import { Component, Input } from '@angular/core';
import { QuizResult } from '../../core/models/question.model';

@Component({
  selector: 'app-review-item',
  standalone: true,
  template: `
    <div class="review-row" [class.correct]="result.correct" [class.wrong]="!result.correct">
      <span class="icon">{{ result.correct ? '&#10003;' : '&#10007;' }}</span>
      <span class="text">{{ result.question.question }}</span>
    </div>
  `,
  styles: [`
    .review-row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm);
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .review-row.correct { background: rgba(16,185,129,0.08); }
    .review-row.wrong { background: rgba(239,68,68,0.08); }
    .icon {
      flex-shrink: 0;
      font-weight: 700;
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
    }
    .correct .icon { color: var(--color-correct); }
    .wrong .icon { color: var(--color-wrong); }
    .text { flex: 1; }
  `],
})
export class ReviewItemComponent {
  @Input({ required: true }) result!: QuizResult;
}
