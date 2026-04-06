import { Component, Input, Output, EventEmitter, inject, signal, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FillInQuestion } from '../../../core/models/question.model';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-fill-in',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="question-text">{{ question.question }}</div>

    @if (question.hint) {
      <div class="hint">{{ i18n.t('hintLabel') }}: {{ question.hint }}</div>
    }

    <input
      class="fill-input"
      type="text"
      [(ngModel)]="userInput"
      [placeholder]="i18n.t('fillInPlaceholder')"
      [disabled]="revealed()"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false" />

    @if (!revealed()) {
      <button class="btn btn-reveal" (click)="reveal()">
        {{ i18n.t('revealAnswer') }}
      </button>
    } @else {
      <div class="answer-display">
        <span class="correct-label">{{ i18n.t('correctAnswer') }}:</span>
        <span class="correct-answer">{{ question.answer }}</span>
      </div>
      @if (!graded()) {
        <div class="self-grade">
          <button class="btn btn-correct" (click)="grade(true)">
            &#10003; {{ i18n.t('gotIt') }}
          </button>
          <button class="btn btn-wrong" (click)="grade(false)">
            &#10007; {{ i18n.t('missedIt') }}
          </button>
        </div>
      }
    }
  `,
  styles: [`
    .question-text {
      font-size: 1.2rem;
      margin-bottom: var(--space-md);
      line-height: 1.6;
    }
    .hint {
      font-size: 0.9rem;
      color: var(--color-muted);
      margin-bottom: var(--space-md);
      font-style: italic;
    }
    .fill-input {
      width: 100%;
      padding: var(--space-md) var(--space-lg);
      font-size: 1.1rem;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      min-height: 52px;
      box-sizing: border-box;
    }
    .fill-input:focus {
      outline: none;
      border-color: var(--color-accent);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md) var(--space-lg);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 48px;
      min-width: 44px;
      margin-top: var(--space-md);
    }
    .btn-reveal {
      background: var(--color-accent);
      color: #fff;
      width: 100%;
    }
    .answer-display {
      margin-top: var(--space-md);
      padding: var(--space-md);
      background: rgba(16, 185, 129, 0.1);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-correct);
    }
    .correct-label {
      color: var(--color-muted);
      font-size: 0.85rem;
      display: block;
      margin-bottom: 4px;
    }
    .correct-answer {
      color: var(--color-correct);
      font-size: 1.3rem;
      font-weight: 700;
    }
    .self-grade {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .btn-correct {
      background: var(--color-correct);
      color: #fff;
    }
    .btn-wrong {
      background: var(--color-wrong);
      color: #fff;
    }
  `],
})
export class FillInComponent implements OnChanges {
  @Input({ required: true }) question!: FillInQuestion;
  @Output() selfGraded = new EventEmitter<{ correct: boolean; userInput: string }>();

  i18n = inject(I18nService);
  userInput = '';
  revealed = signal(false);
  graded = signal(false);

  ngOnChanges(): void {
    this.userInput = '';
    this.revealed.set(false);
    this.graded.set(false);
    (document.activeElement as HTMLElement)?.blur();
  }

  reveal(): void {
    this.revealed.set(true);
  }

  grade(correct: boolean): void {
    this.graded.set(true);
    this.selfGraded.emit({ correct, userInput: this.userInput });
  }
}
