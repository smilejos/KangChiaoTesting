import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { TrueFalseQuestion } from '../../../core/models/question.model';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-true-false',
  standalone: true,
  template: `
    <div class="question-text">{{ question.question }}</div>
    <div class="options">
      <button
        class="option"
        [class.selected]="selected === true"
        [class.correct]="answered && question.answer === true"
        [class.wrong]="answered && selected === true && question.answer !== true"
        [disabled]="answered"
        (click)="select(true)">
        {{ i18n.t('true') }}
      </button>
      <button
        class="option"
        [class.selected]="selected === false"
        [class.correct]="answered && question.answer === false"
        [class.wrong]="answered && selected === false && question.answer !== false"
        [disabled]="answered"
        (click)="select(false)">
        {{ i18n.t('false') }}
      </button>
    </div>
  `,
  styles: [`
    .question-text {
      font-size: 1.2rem;
      margin-bottom: var(--space-lg);
      line-height: 1.6;
    }
    .options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }
    .option {
      padding: var(--space-lg);
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text);
      font-size: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 64px;
      transition: border-color 0.15s;
    }
    .option:not(:disabled):active { transform: scale(0.97); }
    .option.selected { border-color: var(--color-accent); }
    .option.correct { border-color: var(--color-correct); background: rgba(16, 185, 129, 0.1); }
    .option.wrong { border-color: var(--color-wrong); background: rgba(239, 68, 68, 0.1); }
  `],
})
export class TrueFalseComponent {
  @Input({ required: true }) question!: TrueFalseQuestion;
  @Input() answered = false;
  @Output() answer = new EventEmitter<boolean>();

  i18n = inject(I18nService);
  selected: boolean | null = null;

  select(value: boolean): void {
    if (this.answered) return;
    this.selected = value;
    this.answer.emit(value);
  }
}
