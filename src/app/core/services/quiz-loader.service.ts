import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { QuizIndex } from '../models/quiz-index.model';
import { QuizData } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuizLoaderService {
  private http = inject(HttpClient);
  private indexCache$?: Observable<QuizIndex>;

  loadIndex(): Observable<QuizIndex> {
    if (!this.indexCache$) {
      this.indexCache$ = this.http
        .get<QuizIndex>('quizzes/index.json')
        .pipe(shareReplay(1));
    }
    return this.indexCache$;
  }

  loadQuiz(filename: string): Observable<QuizData> {
    // Sanitize filename to prevent path traversal
    const safe = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    return this.http.get<QuizData>(`quizzes/${safe}`);
  }
}
