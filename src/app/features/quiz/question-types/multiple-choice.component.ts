import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { MultipleChoiceQuestion } from '../../../core/models/question.model';

@Component({
  selector: 'app-multiple-choice',
  standalone: true,
  template: `
    <div class="question-text">{{ question.question }}</div>
    <div class="options">
      @for (option of question.options; track $index) {
        <button
          class="option"
          [class.selected]="selectedIndex === $index"
          [class.correct]="answered && $index === question.answer"
          [class.wrong]="answered && selectedIndex === $index && $index !== question.answer"
          [disabled]="answered"
          (click)="select($index)">
          <span class="option-letter">{{ letters[$index] }}</span>
          <span class="option-text">{{ option }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .question-text {
      font-size: 1.2rem;
      margin-bottom: var(--space-lg);
      line-height: 1.6;
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .option {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: 1rem;
      cursor: pointer;
      min-height: 52px;
      text-align: left;
      transition: border-color 0.15s;
    }
    .option:not(:disabled):active { transform: scale(0.98); }
    .option.selected { border-color: var(--color-accent); }
    .option.correct { border-color: var(--color-correct); background: rgba(16, 185, 129, 0.1); }
    .option.wrong { border-color: var(--color-wrong); background: rgba(239, 68, 68, 0.1); }
    .option-letter {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--color-border);
      font-weight: 600;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .option.correct .option-letter { background: var(--color-correct); color: #fff; }
    .option.wrong .option-letter { background: var(--color-wrong); color: #fff; }
  `],
})
export class MultipleChoiceComponent implements OnChanges {
  @Input({ required: true }) question!: MultipleChoiceQuestion;
  @Input() answered = false;
  @Output() answer = new EventEmitter<number>();

  letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  selectedIndex: number | null = null;

  ngOnChanges(): void {
    this.selectedIndex = null;
  }

  select(index: number): void {
    if (this.answered) return;
    this.selectedIndex = index;
    this.answer.emit(index);
  }
}
