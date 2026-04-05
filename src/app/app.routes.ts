import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'MyGrammar Quiz',
  },
  {
    path: 'book/:bookId',
    loadComponent: () =>
      import('./features/home/book.component').then(m => m.BookComponent),
    title: 'Versions',
  },
  {
    path: 'version/:bookId/:versionId',
    loadComponent: () =>
      import('./features/home/version.component').then(m => m.VersionComponent),
    title: 'Units',
  },
  {
    path: 'unit/:bookId/:versionId/:unitId',
    loadComponent: () =>
      import('./features/home/unit.component').then(m => m.UnitComponent),
    title: 'Quizzes',
  },
  {
    path: 'quiz/:quizId',
    loadComponent: () =>
      import('./features/quiz/quiz.component').then(m => m.QuizComponent),
    title: 'Quiz',
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./features/result/result.component').then(m => m.ResultComponent),
    title: 'Results',
  },
  { path: '**', redirectTo: '' },
];
