import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'MyGrammar Quiz',
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
