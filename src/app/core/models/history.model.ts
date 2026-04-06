export type SerializedAnswer =
  | { type: 'multiple-choice'; index: number; label: string }
  | { type: 'true-false'; value: boolean }
  | { type: 'fill-in'; text: string; selfGraded: boolean }
  | { type: 'categorize'; placements: Record<string, string[]> }
  | { type: 'reorder'; order: string[] };

export interface AnswerRecord {
  questionText: string;
  questionType: string;
  correct: boolean;
  userAnswer: SerializedAnswer;
  correctAnswer: SerializedAnswer;
  explanation: string;
  options?: string[];
}

export interface AttemptRecord {
  id: string;
  quizGuid: string;
  quizId: string;
  quizTitle: string;
  date: string;
  correct: number;
  total: number;
  percentage: number;
  answers: AnswerRecord[];
}

export interface HistoryStore {
  version: 1;
  attempts: AttemptRecord[];
}
