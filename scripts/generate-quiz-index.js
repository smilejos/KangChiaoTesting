#!/usr/bin/env node

/**
 * Scans public/quizzes/ folder structure and generates index.json.
 *
 * Folder structure:
 *   public/quizzes/<Book>/<Unit>/<quiz>.json
 *
 * Output: public/quizzes/index.json
 */

const fs = require('fs');
const path = require('path');

const QUIZZES_DIR = path.join(__dirname, '..', 'public', 'quizzes');
const OUTPUT = path.join(QUIZZES_DIR, 'index.json');

// Default colors to cycle through for books that don't specify one
const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
// Default emojis per book (fallback)
const DEFAULT_EMOJI = '📚';

function scanQuizzes() {
  const books = [];

  // Read top-level folders (Books)
  const topEntries = fs.readdirSync(QUIZZES_DIR, { withFileTypes: true });
  const bookDirs = topEntries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

  bookDirs.forEach((bookDir, bookIdx) => {
    const bookPath = path.join(QUIZZES_DIR, bookDir.name);
    const book = {
      id: bookDir.name,
      name: bookDir.name.replace(/_/g, ' '),
      color: COLORS[bookIdx % COLORS.length],
      units: [],
    };

    // Read unit folders
    const unitEntries = fs.readdirSync(bookPath, { withFileTypes: true });
    const unitDirs = unitEntries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

    unitDirs.forEach(unitDir => {
      const unitPath = path.join(bookPath, unitDir.name);
      const unit = {
        id: `${bookDir.name}/${unitDir.name}`,
        name: unitDir.name.replace(/_/g, ' '),
        quizzes: [],
      };

      // Read quiz JSON files
      const files = fs.readdirSync(unitPath).filter(f => f.endsWith('.json')).sort();

      files.forEach(file => {
        const filePath = path.join(unitPath, file);
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const meta = data.meta || {};
          const questionCount = (data.questions || []).length;
          const relativePath = `${bookDir.name}/${unitDir.name}/${file}`;

          unit.quizzes.push({
            id: meta.id || relativePath.replace('.json', ''),
            title: meta.title || file.replace('.json', ''),
            subtitle: meta.description || '',
            emoji: meta.emoji || DEFAULT_EMOJI,
            color: meta.color || book.color,
            tags: collectTags(data.questions || []),
            difficulty: averageDifficulty(data.questions || []),
            file: relativePath,
            questionCount,
          });
        } catch (err) {
          console.warn(`  ⚠ Skipping ${filePath}: ${err.message}`);
        }
      });

      if (unit.quizzes.length > 0 || unitDirs.length > 0) {
        book.units.push(unit);
      }
    });

    // Also check for quiz files directly in the book folder (no unit subfolder)
    const bookFiles = unitEntries.filter(e => e.isFile() && e.name.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));
    if (bookFiles.length > 0) {
      const directUnit = {
        id: `${bookDir.name}/_root`,
        name: 'General',
        quizzes: [],
      };
      bookFiles.forEach(file => {
        const filePath = path.join(bookPath, file.name);
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const meta = data.meta || {};
          const questionCount = (data.questions || []).length;
          const relativePath = `${bookDir.name}/${file.name}`;

          directUnit.quizzes.push({
            id: meta.id || relativePath.replace('.json', ''),
            title: meta.title || file.name.replace('.json', ''),
            subtitle: meta.description || '',
            emoji: meta.emoji || DEFAULT_EMOJI,
            color: meta.color || book.color,
            tags: collectTags(data.questions || []),
            difficulty: averageDifficulty(data.questions || []),
            file: relativePath,
            questionCount,
          });
        } catch (err) {
          console.warn(`  ⚠ Skipping ${filePath}: ${err.message}`);
        }
      });
      if (directUnit.quizzes.length > 0) {
        book.units.unshift(directUnit);
      }
    }

    books.push(book);
  });

  return books;
}

function collectTags(questions) {
  const tagSet = new Set();
  questions.forEach(q => (q.tags || []).forEach(t => tagSet.add(t)));
  return [...tagSet].slice(0, 5);
}

function averageDifficulty(questions) {
  if (questions.length === 0) return 1;
  const avg = questions.reduce((sum, q) => sum + (q.difficulty || 1), 0) / questions.length;
  return Math.round(avg);
}

// --- Main ---
console.log('Scanning quizzes in', QUIZZES_DIR);
const books = scanQuizzes();

const totalQuizzes = books.reduce((sum, b) => sum + b.units.reduce((s, u) => s + u.quizzes.length, 0), 0);
const totalUnits = books.reduce((sum, b) => sum + b.units.length, 0);

const index = {
  version: '2.0',
  generated: new Date().toISOString(),
  books,
};

fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2) + '\n');
console.log(`Generated index.json: ${books.length} book(s), ${totalUnits} unit(s), ${totalQuizzes} quiz(zes)`);
