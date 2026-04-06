import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewItemComponent } from './review-item.component';
import { QuizEngineService } from '../../core/services/quiz-engine.service';
import { I18nService } from '../../core/services/i18n.service';
import { ResultSummary } from '../../core/models/question.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [ReviewItemComponent],
  template: `
    <div class="result-page">
      @if (summary()) {
        <h1 class="title">{{ i18n.t('resultTitle') }}</h1>

        <!-- Score ring -->
        <div class="score-ring"
             [style.--pct]="summary()!.percentage"
             [style.--ring-color]="ringColor()">
          <div class="ring-inner">
            <span class="ring-score">{{ summary()!.correct }} / {{ summary()!.total }}</span>
            <span class="ring-pct">{{ summary()!.percentage }}%</span>
          </div>
        </div>

        <p class="motivation">{{ motivation() }}</p>

        <h2 class="review-title">{{ i18n.t('review') }}</h2>
        <div class="review-list">
          @for (r of summary()!.results; track $index) {
            <app-review-item [result]="r" />
          }
        </div>

        <div class="actions">
          <button class="btn btn-primary" (click)="tryAgain()">
            {{ i18n.t('tryAgain') }}
          </button>
          @if (summary()?.quizGuid) {
            <button class="btn btn-secondary" (click)="viewHistory()">
              {{ i18n.t('viewHistory') }}
            </button>
          }
          <button class="btn btn-secondary" (click)="goHome()">
            {{ i18n.t('chooseAnother') }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .result-page {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
      text-align: center;
    }
    .title {
      font-size: 1.6rem;
      margin: 0 0 var(--space-lg);
    }
    .score-ring {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      margin: 0 auto var(--space-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      background: conic-gradient(
        var(--ring-color) calc(var(--pct) * 1%),
        var(--color-surface) 0
      );
    }
    .ring-inner {
      width: 148px;
      height: 148px;
      border-radius: 50%;
      background: var(--color-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .ring-score { font-size: 1.6rem; font-weight: 700; }
    .ring-pct { font-size: 0.95rem; color: var(--color-muted); }
    .motivation {
      font-size: 1.1rem;
      margin-bottom: var(--space-lg);
      color: var(--color-muted);
    }
    .review-title {
      font-size: 1.1rem;
      text-align: left;
      margin-bottom: var(--space-sm);
    }
    .review-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      margin-bottom: var(--space-lg);
      text-align: left;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .btn {
      padding: var(--space-md);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 52px;
    }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: var(--color-accent); color: #fff; }
    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }
  `],
})
export class ResultComponent implements OnInit {
  private router = inject(Router);
  private engine = inject(QuizEngineService);
  i18n = inject(I18nService);

  summary = signal<ResultSummary | null>(null);

  ngOnInit(): void {
    // Try engine first, fall back to sessionStorage
    const fromEngine = this.engine.getResultSummary();
    if (fromEngine.total > 0) {
      this.summary.set(fromEngine);
    } else {
      try {
        const stored = sessionStorage.getItem('quizResult');
        if (stored) {
          this.summary.set(JSON.parse(stored));
          return;
        }
      } catch { /* corrupted sessionStorage */ }
      this.router.navigate(['/']);
    }
  }

  ringColor(): string {
    const pct = this.summary()?.percentage ?? 0;
    if (pct >= 80) return 'var(--color-correct)';
    if (pct >= 50) return '#facc15';
    return 'var(--color-wrong)';
  }

  motivation(): string {
    const pct = this.summary()?.percentage ?? 0;
    if (pct === 100) return this.i18n.t('motivationPerfect');
    if (pct >= 70) return this.i18n.t('motivationGreat');
    if (pct >= 40) return this.i18n.t('motivationGood');
    return this.i18n.t('motivationKeepTrying');
  }

  viewHistory(): void {
    const guid = this.summary()?.quizGuid;
    if (guid) this.router.navigate(['/history', guid]);
  }

  tryAgain(): void {
    const id = this.summary()?.quizId;
    if (id) this.router.navigate(['/quiz', id]);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
