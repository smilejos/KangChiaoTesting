export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInQuestion
  | CategorizeQuestion
  | ReorderQuestion;

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  hint?: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true-false';
  question: string;
  answer: boolean;
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export interface FillInQuestion {
  id: string;
  type: 'fill-in';
  question: string;
  answer: string;
  acceptedAnswers: string[];
  hint?: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export interface CategorizeQuestion {
  id: string;
  type: 'categorize';
  question: string;
  items: string[];
  categories: { label: string; answers: string[] }[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export interface ReorderQuestion {
  id: string;
  type: 'reorder';
  question: string;
  words: string[];
  answer: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export interface QuizData {
  meta: {
    id: string;
    version: string;
    title: string;
    subject: string;
    level: string;
    created: string;
    description: string;
  };
  settings: {
    shuffle: boolean;
    maxQuestions: number | null;
  };
  questions: Question[];
}

export interface QuizResult {
  question: Question;
  correct: boolean;
  userAnswer: unknown;
}

export interface ResultSummary {
  quizTitle: string;
  quizId: string;
  total: number;
  correct: number;
  percentage: number;
  results: QuizResult[];
}
