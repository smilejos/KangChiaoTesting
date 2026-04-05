import { Component, Input, Output, EventEmitter, inject, signal, computed, OnChanges } from '@angular/core';
import { ReorderQuestion } from '../../../core/models/question.model';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-reorder',
  standalone: true,
  template: `
    <div class="question-text">{{ question.question }}</div>
    <p class="instruction">{{ i18n.t('reorderInstruction') }}</p>

    <!-- Selected words (answer area) -->
    <div class="answer-area">
      @for (word of selected(); track $index) {
        <button
          class="word placed"
          [class.word-correct]="answered && question.answer[$index] === word"
          [class.word-wrong]="answered && question.answer[$index] !== word"
          [disabled]="answered"
          (click)="removeWord($index)">
          {{ word }}
        </button>
      }
      @if (selected().length === 0 && !answered) {
        <span class="placeholder">...</span>
      }
    </div>

    <!-- Available words -->
    <div class="word-bank">
      @for (word of remaining(); track word + $index) {
        <button class="word" [disabled]="answered" (click)="addWord(word)">
          {{ word }}
        </button>
      }
    </div>

    @if (!answered && selected().length === question.answer.length) {
      <button class="btn-check" (click)="submit()">
        {{ i18n.t('check') }}
      </button>
    }

    @if (!answered && selected().length > 0) {
      <button class="btn-reset" (click)="reset()">
        {{ i18n.t('reset') }}
      </button>
    }
  `,
  styles: [`
    .question-text { font-size: 1.2rem; margin-bottom: var(--space-sm); line-height: 1.6; }
    .instruction { font-size: 0.85rem; color: var(--color-muted); margin-bottom: var(--space-md); }
    .answer-area {
      display: flex; flex-wrap: wrap; gap: var(--space-sm);
      min-height: 52px;
      padding: var(--space-md);
      background: var(--color-surface);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md);
      align-items: center;
    }
    .word-bank {
      display: flex; flex-wrap: wrap; gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .word {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: 1rem;
      cursor: pointer;
      min-height: 44px;
    }
    .word:not(:disabled):active { transform: scale(0.95); }
    .word.placed {
      background: rgba(99,102,241,0.15);
      border-color: var(--color-accent);
    }
    .word.word-correct { border-color: var(--color-correct); background: rgba(16,185,129,0.15); }
    .word.word-wrong { border-color: var(--color-wrong); background: rgba(239,68,68,0.15); }
    .placeholder { color: var(--color-muted); font-style: italic; }
    .btn-check, .btn-reset {
      width: 100%;
      padding: var(--space-md);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 48px;
      margin-bottom: var(--space-sm);
    }
    .btn-check { background: var(--color-accent); color: #fff; }
    .btn-reset { background: var(--color-surface); color: var(--color-muted); border: 1px solid var(--color-border); }
  `],
})
export class ReorderComponent implements OnChanges {
  @Input({ required: true }) question!: ReorderQuestion;
  @Input() answered = false;
  @Output() answer = new EventEmitter<string[]>();

  i18n = inject(I18nService);
  selected = signal<string[]>([]);

  // Track which indices from the original words array have been used
  private usedIndices = signal<Set<number>>(new Set());

  ngOnChanges(): void {
    this.selected.set([]);
    this.usedIndices.set(new Set());
  }

  remaining = computed(() => {
    const used = this.usedIndices();
    return this.question.words.filter((_, i) => !used.has(i));
  });

  addWord(word: string): void {
    const used = this.usedIndices();
    const origIndex = this.question.words.findIndex(
      (w, i) => w === word && !used.has(i)
    );
    if (origIndex === -1) return;

    this.selected.update(s => [...s, word]);
    this.usedIndices.update(u => new Set([...u, origIndex]));
  }

  removeWord(index: number): void {
    const word = this.selected()[index];
    this.selected.update(s => s.filter((_, i) => i !== index));
    // Free up one occurrence of this word
    const used = [...this.usedIndices()];
    const origIndex = used.find(
      i => this.question.words[i] === word
    );
    if (origIndex !== undefined) {
      this.usedIndices.update(u => {
        const next = new Set(u);
        next.delete(origIndex);
        return next;
      });
    }
  }

  reset(): void {
    this.selected.set([]);
    this.usedIndices.set(new Set());
  }

  submit(): void {
    this.answer.emit(this.selected());
  }
}
