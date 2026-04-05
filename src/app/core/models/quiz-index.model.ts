export interface QuizIndex {
  version: string;
  generated: string;
  books: BookEntry[];
}

export interface BookEntry {
  id: string;
  name: string;
  color: string;
  versions: VersionEntry[];
}

export interface VersionEntry {
  id: string;
  name: string;
  units: UnitEntry[];
}

export interface UnitEntry {
  id: string;
  name: string;
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
