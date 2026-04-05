import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizEntry } from '../../core/models/quiz-index.model';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/quiz', quiz.id]"
       [style.--card-color]="quiz.color">
      <div class="card-emoji">{{ quiz.emoji }}</div>
      <div class="card-body">
        <h3 class="card-title">{{ quiz.title }}</h3>
        <p class="card-subtitle">{{ quiz.subtitle }}</p>
        <div class="card-meta">
          <span class="stars">{{ stars }}</span>
          <span class="count">{{ quiz.questionCount }} {{ i18n.t('questions') }}</span>
          <span class="arrow">&rarr;</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--color-text);
      transition: transform 0.15s, box-shadow 0.15s;
      border-left: 4px solid var(--card-color, var(--color-accent));
      min-height: 44px;
    }
    .card:active {
      transform: scale(0.98);
    }
    .card-emoji {
      font-size: 2.5rem;
      flex-shrink: 0;
      width: 56px;
      text-align: center;
    }
    .card-body {
      flex: 1;
      min-width: 0;
    }
    .card-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .card-subtitle {
      margin: 4px 0 8px;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    .card-meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 0.8rem;
      color: var(--color-muted);
    }
    .stars { color: #facc15; }
    .arrow {
      margin-left: auto;
      font-size: 1.2rem;
      color: var(--card-color, var(--color-accent));
    }
  `],
})
export class QuizCardComponent {
  @Input({ required: true }) quiz!: QuizEntry;

  constructor(public i18n: I18nService) {}

  get stars(): string {
    return '★'.repeat(this.quiz.difficulty) + '☆'.repeat(3 - this.quiz.difficulty);
  }
}
