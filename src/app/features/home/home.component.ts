import { Component, inject, OnInit, signal } from '@angular/core';
import { QuizCardComponent } from './quiz-card.component';
import { QuizLoaderService } from '../../core/services/quiz-loader.service';
import { I18nService } from '../../core/services/i18n.service';
import { QuizEntry } from '../../core/models/quiz-index.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [QuizCardComponent],
  template: `
    <div class="home">
      <header class="header">
        <div class="header-top">
          <h1 class="title">{{ i18n.t('appTitle') }}</h1>
          <button class="lang-toggle" (click)="i18n.toggle()">
            {{ i18n.lang() === 'en' ? '中文' : 'EN' }}
          </button>
        </div>
        <p class="subtitle">{{ i18n.t('appSubtitle') }}</p>
      </header>

      <div class="quiz-list">
        @for (quiz of quizzes(); track quiz.id) {
          <app-quiz-card [quiz]="quiz" />
        } @empty {
          <p class="loading">{{ i18n.t('loading') }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .home {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
    }
    .header {
      margin-bottom: var(--space-lg);
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .title {
      font-size: 1.75rem;
      margin: 0;
      color: var(--color-text);
    }
    .subtitle {
      margin: var(--space-xs) 0 0;
      color: var(--color-muted);
      font-size: 0.95rem;
    }
    .lang-toggle {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
    }
    .quiz-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .loading {
      text-align: center;
      color: var(--color-muted);
      padding: var(--space-xl);
    }
  `],
})
export class HomeComponent implements OnInit {
  private loader = inject(QuizLoaderService);
  i18n = inject(I18nService);
  quizzes = signal<QuizEntry[]>([]);

  ngOnInit(): void {
    this.loader.loadIndex().subscribe(data => {
      this.quizzes.set(data.quizzes);
    });
  }
}
