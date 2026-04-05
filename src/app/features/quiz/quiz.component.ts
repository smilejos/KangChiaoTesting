import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ProgressBarComponent } from './progress-bar.component';
import { MultipleChoiceComponent } from './question-types/multiple-choice.component';
import { TrueFalseComponent } from './question-types/true-false.component';
import { FillInComponent } from './question-types/fill-in.component';
import { CategorizeComponent } from './question-types/categorize.component';
import { ReorderComponent } from './question-types/reorder.component';
import { QuizLoaderService } from '../../core/services/quiz-loader.service';
import { QuizEngineService } from '../../core/services/quiz-engine.service';
import { I18nService } from '../../core/services/i18n.service';
import { QuizEntry } from '../../core/models/quiz-index.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    ProgressBarComponent,
    MultipleChoiceComponent,
    TrueFalseComponent,
    FillInComponent,
    CategorizeComponent,
    ReorderComponent,
  ],
  template: `
    <div class="quiz-page">
      @if (loading()) {
        <p class="loading">{{ i18n.t('loading') }}</p>
      } @else {
        <header class="quiz-header">
          <button class="back-btn" (click)="goHome()">&larr;</button>
          <app-progress-bar
            [current]="engine.currentIndex()"
            [total]="engine.totalQuestions()" />
          <div class="score-badge">
            {{ i18n.t('score') }}: {{ engine.score() }}
          </div>
        </header>

        <main class="question-area">
          @switch (engine.currentQuestion()?.type) {
            @case ('multiple-choice') {
              <app-multiple-choice
                [question]="$any(engine.currentQuestion())"
                [answered]="engine.isAnswered()"
                (answer)="onAnswer($event)" />
            }
            @case ('true-false') {
              <app-true-false
                [question]="$any(engine.currentQuestion())"
                [answered]="engine.isAnswered()"
                (answer)="onAnswer($event)" />
            }
            @case ('fill-in') {
              <app-fill-in
                [question]="$any(engine.currentQuestion())"
                (selfGraded)="onSelfGrade($event)" />
            }
            @case ('categorize') {
              <app-categorize
                [question]="$any(engine.currentQuestion())"
                [answered]="engine.isAnswered()"
                (answer)="onAnswer($event)" />
            }
            @case ('reorder') {
              <app-reorder
                [question]="$any(engine.currentQuestion())"
                [answered]="engine.isAnswered()"
                (answer)="onAnswer($event)" />
            }
          }

          <!-- Feedback area -->
          @if (engine.isAnswered()) {
            <div class="feedback" [class.correct]="engine.isCorrect()" [class.wrong]="!engine.isCorrect()">
              <div class="feedback-label">
                {{ engine.isCorrect() ? i18n.t('correct') : i18n.t('incorrect') }}
              </div>
              @if (engine.currentQuestion()?.explanation) {
                <div class="explanation">
                  <strong>{{ i18n.t('explanation') }}:</strong>
                  {{ engine.currentQuestion()?.explanation }}
                </div>
              }
            </div>

            <button class="btn-next" (click)="next()">
              {{ isLast() ? i18n.t('resultTitle') : i18n.t('next') }}
            </button>
          }
        </main>
      }
    </div>
  `,
  styles: [`
    .quiz-page {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
    }
    .loading { text-align: center; color: var(--color-muted); padding: var(--space-xl); }
    .quiz-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .back-btn {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text);
      font-size: 1.2rem;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      flex-shrink: 0;
    }
    app-progress-bar { flex: 1; }
    .score-badge {
      background: var(--color-surface);
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      color: var(--color-accent);
    }
    .question-area { margin-top: var(--space-md); }
    .feedback {
      margin-top: var(--space-lg);
      padding: var(--space-md);
      border-radius: var(--radius-sm);
    }
    .feedback.correct {
      background: rgba(16,185,129,0.1);
      border: 1px solid var(--color-correct);
    }
    .feedback.wrong {
      background: rgba(239,68,68,0.1);
      border: 1px solid var(--color-wrong);
    }
    .feedback-label {
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: var(--space-xs);
    }
    .feedback.correct .feedback-label { color: var(--color-correct); }
    .feedback.wrong .feedback-label { color: var(--color-wrong); }
    .explanation {
      font-size: 0.9rem;
      color: var(--color-muted);
      line-height: 1.5;
    }
    .btn-next {
      margin-top: var(--space-lg);
      width: 100%;
      padding: var(--space-md);
      background: var(--color-accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 52px;
    }
    .btn-next:active { transform: scale(0.98); }
  `],
})
export class QuizComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loader = inject(QuizLoaderService);
  engine = inject(QuizEngineService);
  i18n = inject(I18nService);

  loading = signal(true);

  get isLast() {
    return () => this.engine.currentIndex() >= this.engine.totalQuestions() - 1;
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const quizId = decodeURIComponent(params.get('quizId')!);
          return this.loader.loadIndex().pipe(
            switchMap(index => {
              // Search all books/versions/units for the quiz
              let entry: QuizEntry | undefined;
              for (const book of index.books) {
                for (const version of book.versions) {
                  for (const unit of version.units) {
                    entry = unit.quizzes.find((q: QuizEntry) => q.id === quizId);
                    if (entry) break;
                  }
                  if (entry) break;
                }
                if (entry) break;
              }
              if (!entry) throw new Error(`Quiz not found: ${quizId}`);
              return this.loader.loadQuiz(entry.file);
            })
          );
        })
      )
      .subscribe({
        next: quiz => {
          this.engine.init(quiz);
          this.loading.set(false);
        },
        error: () => this.router.navigate(['/']),
      });
  }

  onAnswer(answer: unknown): void {
    this.engine.submitAnswer(answer);
  }

  onSelfGrade(correct: boolean): void {
    this.engine.selfGrade(correct);
  }

  next(): void {
    if (!this.engine.nextQuestion()) {
      // Store summary in sessionStorage for refresh resilience
      sessionStorage.setItem(
        'quizResult',
        JSON.stringify(this.engine.getResultSummary())
      );
      this.router.navigate(['/result']);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
