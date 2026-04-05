import { Injectable, signal, computed } from '@angular/core';

export interface ScoreEntry {
  correct: number;
  total: number;
  percentage: number;
  date: string;
}

export interface QuizScoreRecord {
  bestScore: number;
  lastScore: number;
  attempts: number;
  lastAttemptAt: string;
  history: ScoreEntry[];
}

interface ScoreStore {
  version: 1;
  quizzes: Record<string, QuizScoreRecord>;
}

const STORAGE_KEY = 'kc-quiz-scores';
const MAX_HISTORY = 5;

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private store = signal<ScoreStore>(this.load());

  allScores = computed(() => this.store().quizzes);

  getQuizScore(guid: string): QuizScoreRecord | null {
    return this.store().quizzes[guid] ?? null;
  }

  recordScore(guid: string, correct: number, total: number): void {
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const now = new Date().toISOString();
    const entry: ScoreEntry = { correct, total, percentage, date: now };

    const current = { ...this.store() };
    const quizzes = { ...current.quizzes };
    const existing = quizzes[guid];

    if (existing) {
      const history = [entry, ...existing.history].slice(0, MAX_HISTORY);
      quizzes[guid] = {
        bestScore: Math.max(existing.bestScore, percentage),
        lastScore: percentage,
        attempts: existing.attempts + 1,
        lastAttemptAt: now,
        history,
      };
    } else {
      quizzes[guid] = {
        bestScore: percentage,
        lastScore: percentage,
        attempts: 1,
        lastAttemptAt: now,
        history: [entry],
      };
    }

    current.quizzes = quizzes;
    this.store.set(current);
    this.persist(current);
  }

  resetAll(): void {
    const empty: ScoreStore = { version: 1, quizzes: {} };
    this.store.set(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }

  private load(): ScoreStore {
    try {
      if (typeof localStorage === 'undefined') return { version: 1, quizzes: {} };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 &&
            typeof parsed.quizzes === 'object' && parsed.quizzes !== null &&
            !Array.isArray(parsed.quizzes)) {
          return parsed as ScoreStore;
        }
      }
    } catch { /* corrupted data, start fresh */ }
    return { version: 1, quizzes: {} };
  }

  private persist(store: ScoreStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch { /* localStorage full or unavailable */ }
  }
}
