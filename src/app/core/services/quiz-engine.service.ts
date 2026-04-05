import { Injectable, signal } from '@angular/core';
import { Question, QuizData, QuizResult, ResultSummary } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuizEngineService {
  currentQuestion = signal<Question | null>(null);
  currentIndex = signal<number>(0);
  totalQuestions = signal<number>(0);
  score = signal<number>(0);
  isAnswered = signal<boolean>(false);
  isCorrect = signal<boolean>(false);
  results = signal<QuizResult[]>([]);

  private questions: Question[] = [];
  private quizTitle = '';
  private quizId = '';
  private quizGuid = '';

  init(quiz: QuizData): void {
    this.quizTitle = quiz.meta.title;
    this.quizId = quiz.meta.id;
    this.quizGuid = quiz.meta.guid ?? '';
    this.questions = quiz.settings.shuffle
      ? this.shuffle([...quiz.questions])
      : [...quiz.questions];
    if (quiz.settings.maxQuestions) {
      this.questions = this.questions.slice(0, quiz.settings.maxQuestions);
    }
    this.totalQuestions.set(this.questions.length);
    this.currentIndex.set(0);
    this.score.set(0);
    this.isAnswered.set(false);
    this.isCorrect.set(false);
    this.results.set([]);
    this.currentQuestion.set(this.questions[0] ?? null);
  }

  submitAnswer(answer: unknown): boolean {
    const q = this.currentQuestion();
    if (!q || this.isAnswered()) return false;

    const correct = this.checkAnswer(q, answer);
    if (correct) this.score.update(s => s + 1);
    this.isCorrect.set(correct);
    this.isAnswered.set(true);
    this.results.update(r => [...r, { question: q, correct, userAnswer: answer }]);
    return correct;
  }

  /** For fill-in self-grading */
  selfGrade(correct: boolean): void {
    const q = this.currentQuestion();
    if (!q) return;
    if (correct) this.score.update(s => s + 1);
    this.isCorrect.set(correct);
    this.isAnswered.set(true);
    this.results.update(r => [...r, { question: q, correct, userAnswer: null }]);
  }

  nextQuestion(): boolean {
    const next = this.currentIndex() + 1;
    if (next >= this.questions.length) return false;
    this.currentIndex.set(next);
    this.currentQuestion.set(this.questions[next]);
    this.isAnswered.set(false);
    this.isCorrect.set(false);
    return true;
  }

  getResultSummary(): ResultSummary {
    const total = this.totalQuestions();
    const correct = this.score();
    return {
      quizTitle: this.quizTitle,
      quizId: this.quizId,
      quizGuid: this.quizGuid,
      total,
      correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      results: this.results(),
    };
  }

  private checkAnswer(q: Question, answer: unknown): boolean {
    switch (q.type) {
      case 'multiple-choice':
        return answer === q.answer;
      case 'true-false':
        return answer === q.answer;
      case 'fill-in':
        // Fill-in uses self-grading, but support auto-check as fallback
        return q.acceptedAnswers.some(
          a => a.toLowerCase() === String(answer).toLowerCase()
        );
      case 'categorize': {
        const userMap = answer as Record<string, string[]>;
        return q.categories.every(cat => {
          const placed = userMap[cat.label] ?? [];
          return placed.length === cat.answers.length &&
            cat.answers.every(a => placed.includes(a));
        });
      }
      case 'reorder': {
        const userOrder = answer as string[];
        return (
          q.answer.length === userOrder.length &&
          q.answer.every((w, i) => w === userOrder[i])
        );
      }
      default:
        return false;
    }
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
