export interface QuizIndex {
  version: string;
  quizzes: QuizEntry[];
}

export interface QuizEntry {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  tags: string[];
  difficulty: 1 | 2 | 3;
  file: string;
  questionCount: number;
}
