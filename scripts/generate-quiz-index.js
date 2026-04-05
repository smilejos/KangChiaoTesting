#!/usr/bin/env node

/**
 * Scans public/quizzes/ folder structure and generates index.json.
 *
 * Folder structure:
 *   public/quizzes/<Book>/<Version>/<Unit>/<quiz>.json
 *
 * Output: public/quizzes/index.json
 */

const fs = require('fs');
const path = require('path');

const QUIZZES_DIR = path.join(__dirname, '..', 'public', 'quizzes');
const OUTPUT = path.join(QUIZZES_DIR, 'index.json');

// Default colors to cycle through for books that don't specify one
const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const DEFAULT_EMOJI = '📚';

function scanQuizzes() {
  const books = [];

  const topEntries = fs.readdirSync(QUIZZES_DIR, { withFileTypes: true });
  const bookDirs = topEntries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

  bookDirs.forEach((bookDir, bookIdx) => {
    const bookPath = path.join(QUIZZES_DIR, bookDir.name);
    const book = {
      id: bookDir.name,
      name: bookDir.name.replace(/_/g, ' '),
      color: COLORS[bookIdx % COLORS.length],
      versions: [],
    };

    // Read version folders (e.g. 1.1, 1.2)
    const versionEntries = fs.readdirSync(bookPath, { withFileTypes: true });
    const versionDirs = versionEntries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

    versionDirs.forEach(versionDir => {
      const versionPath = path.join(bookPath, versionDir.name);
      const version = {
        id: `${bookDir.name}/${versionDir.name}`,
        name: versionDir.name,
        units: [],
      };

      // Read unit folders
      const unitEntries = fs.readdirSync(versionPath, { withFileTypes: true });
      const unitDirs = unitEntries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

      unitDirs.forEach(unitDir => {
        const unitPath = path.join(versionPath, unitDir.name);
        const unit = {
          id: `${bookDir.name}/${versionDir.name}/${unitDir.name}`,
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
            const relativePath = `${bookDir.name}/${versionDir.name}/${unitDir.name}/${file}`;

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

        if (unit.quizzes.length > 0) {
          version.units.push(unit);
        }
      });

      // Also check for quiz files directly in the version folder (no unit subfolder)
      const versionFiles = unitEntries.filter(e => e.isFile() && e.name.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));
      if (versionFiles.length > 0) {
        const directUnit = {
          id: `${bookDir.name}/${versionDir.name}/_root`,
          name: 'General',
          quizzes: [],
        };
        versionFiles.forEach(file => {
          const filePath = path.join(versionPath, file.name);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const meta = data.meta || {};
            const questionCount = (data.questions || []).length;
            const relativePath = `${bookDir.name}/${versionDir.name}/${file.name}`;

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
          version.units.unshift(directUnit);
        }
      }

      if (version.units.length > 0) {
        book.versions.push(version);
      }
    });

    if (book.versions.length > 0) {
      books.push(book);
    }
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

const totalQuizzes = books.reduce((sum, b) => sum + b.versions.reduce((sv, v) => sv + v.units.reduce((su, u) => su + u.quizzes.length, 0), 0), 0);
const totalUnits = books.reduce((sum, b) => sum + b.versions.reduce((sv, v) => sv + v.units.length, 0), 0);
const totalVersions = books.reduce((sum, b) => sum + b.versions.length, 0);

const index = {
  version: '3.0',
  generated: new Date().toISOString(),
  books,
};

fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2) + '\n');
console.log(`Generated index.json: ${books.length} book(s), ${totalVersions} version(s), ${totalUnits} unit(s), ${totalQuizzes} quiz(zes)`);
