import { Injectable, signal, computed } from '@angular/core';
import { HistoryStore, AttemptRecord, AnswerRecord, SerializedAnswer } from '../models/history.model';
import { ResultSummary, QuizResult } from '../models/question.model';

const STORAGE_KEY = 'kc-quiz-history';
const MAX_ATTEMPTS_PER_QUIZ = 10;
const MAX_ATTEMPTS_TOTAL = 200;

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private store = signal<HistoryStore>(this.load());

  allAttempts = computed(() => this.store().attempts);

  getAttemptsByQuiz(guid: string): AttemptRecord[] {
    return this.store().attempts.filter(a => a.quizGuid === guid);
  }

  getAttempt(id: string): AttemptRecord | null {
    return this.store().attempts.find(a => a.id === id) ?? null;
  }

  hasAnyAttempts = computed(() => this.store().attempts.length > 0);

  recordAttempt(summary: ResultSummary): void {
    const attempt = this.serializeAttempt(summary);
    const attempts = [attempt, ...this.store().attempts];

    // Per-quiz cap
    const guidCounts = new Map<string, number>();
    const pruned = attempts.filter(a => {
      const count = (guidCounts.get(a.quizGuid) ?? 0) + 1;
      guidCounts.set(a.quizGuid, count);
      return count <= MAX_ATTEMPTS_PER_QUIZ;
    });

    // Global cap
    const final = pruned.slice(0, MAX_ATTEMPTS_TOTAL);

    const newStore: HistoryStore = { version: 1, attempts: final };
    this.store.set(newStore);
    this.persist(newStore);
  }

  resetAll(): void {
    const empty: HistoryStore = { version: 1, attempts: [] };
    this.store.set(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }

  private serializeAttempt(summary: ResultSummary): AttemptRecord {
    return {
      id: crypto.randomUUID(),
      quizGuid: summary.quizGuid ?? '',
      quizId: summary.quizId,
      quizTitle: summary.quizTitle,
      date: new Date().toISOString(),
      correct: summary.correct,
      total: summary.total,
      percentage: summary.percentage,
      answers: summary.results.map(r => this.serializeAnswer(r)),
    };
  }

  private serializeAnswer(result: QuizResult): AnswerRecord {
    const q = result.question;
    const base = {
      questionText: q.question,
      questionType: q.type,
      correct: result.correct,
      explanation: q.explanation,
    };

    switch (q.type) {
      case 'multiple-choice': {
        const userIdx = result.userAnswer as number;
        return {
          ...base,
          options: q.options,
          userAnswer: { type: 'multiple-choice', index: userIdx, label: q.options[userIdx] ?? '' },
          correctAnswer: { type: 'multiple-choice', index: q.answer, label: q.options[q.answer] ?? '' },
        };
      }
      case 'true-false':
        return {
          ...base,
          userAnswer: { type: 'true-false', value: result.userAnswer as boolean },
          correctAnswer: { type: 'true-false', value: q.answer },
        };
      case 'fill-in': {
        const userText = result.userAnswer as string | null;
        return {
          ...base,
          userAnswer: { type: 'fill-in', text: userText ?? '', selfGraded: true },
          correctAnswer: { type: 'fill-in', text: q.answer, selfGraded: false },
        };
      }
      case 'categorize': {
        const userMap = result.userAnswer as Record<string, string[]>;
        const correctMap: Record<string, string[]> = {};
        for (const cat of q.categories) {
          correctMap[cat.label] = cat.answers;
        }
        return {
          ...base,
          userAnswer: { type: 'categorize', placements: userMap },
          correctAnswer: { type: 'categorize', placements: correctMap },
        };
      }
      case 'reorder':
        return {
          ...base,
          userAnswer: { type: 'reorder', order: result.userAnswer as string[] },
          correctAnswer: { type: 'reorder', order: q.answer },
        };
    }
  }

  private load(): HistoryStore {
    try {
      if (typeof localStorage === 'undefined') return { version: 1, attempts: [] };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.attempts)) {
          return parsed as HistoryStore;
        }
      }
    } catch { /* corrupted data, start fresh */ }
    return { version: 1, attempts: [] };
  }

  private persist(store: HistoryStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch { /* localStorage full or unavailable */ }
  }
}
