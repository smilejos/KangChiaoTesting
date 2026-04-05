import { Component, Input, Output, EventEmitter, inject, signal, computed, OnChanges } from '@angular/core';
import { CategorizeQuestion } from '../../../core/models/question.model';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-categorize',
  standalone: true,
  template: `
    <div class="question-text">{{ question.question }}</div>
    <p class="instruction">{{ i18n.t('categorizeInstruction') }}</p>

    <div class="items">
      @for (item of remainingItems(); track item) {
        <button
          class="chip"
          [class.selected]="selectedItem() === item"
          [disabled]="answered"
          (click)="selectItem(item)">
          {{ item }}
        </button>
      }
    </div>

    <div class="categories">
      @for (cat of question.categories; track cat.label) {
        <div
          class="category"
          [class.drop-target]="selectedItem() !== null"
          [class.correct]="answered && isCategoryCorrect(cat.label)"
          [class.wrong]="answered && !isCategoryCorrect(cat.label)"
          (click)="placeInCategory(cat.label)">
          <div class="cat-label">{{ cat.label }}</div>
          <div class="cat-items">
            @for (item of placements()[cat.label] || []; track item) {
              <span class="placed-chip"
                    [class.item-correct]="answered && cat.answers.includes(item)"
                    [class.item-wrong]="answered && !cat.answers.includes(item)">
                {{ item }}
                @if (!answered) {
                  <button class="remove" (click)="removeItem(cat.label, item, $event)">&times;</button>
                }
              </span>
            }
          </div>
        </div>
      }
    </div>

    @if (!answered && allPlaced()) {
      <button class="btn-check" (click)="submit()">
        {{ i18n.t('check') }}
      </button>
    }
  `,
  styles: [`
    .question-text { font-size: 1.2rem; margin-bottom: var(--space-sm); line-height: 1.6; }
    .instruction { font-size: 0.85rem; color: var(--color-muted); margin-bottom: var(--space-md); }
    .items {
      display: flex; flex-wrap: wrap; gap: var(--space-sm);
      margin-bottom: var(--space-lg);
    }
    .chip {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: 1rem;
      cursor: pointer;
      min-height: 44px;
    }
    .chip.selected { border-color: var(--color-accent); background: rgba(99,102,241,0.15); }
    .categories {
      display: flex; flex-direction: column; gap: var(--space-md);
    }
    .category {
      padding: var(--space-md);
      background: var(--color-surface);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      min-height: 60px;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .category.drop-target { border-color: var(--color-accent); }
    .category.correct { border-color: var(--color-correct); border-style: solid; }
    .category.wrong { border-color: var(--color-wrong); border-style: solid; }
    .cat-label { font-weight: 600; margin-bottom: var(--space-sm); font-size: 0.95rem; }
    .cat-items { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
    .placed-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px;
      background: rgba(99,102,241,0.2);
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .placed-chip.item-correct { background: rgba(16,185,129,0.2); }
    .placed-chip.item-wrong { background: rgba(239,68,68,0.2); }
    .remove {
      background: none; border: none; color: var(--color-muted);
      cursor: pointer; font-size: 1rem; padding: 0 2px;
    }
    .btn-check {
      margin-top: var(--space-lg);
      width: 100%;
      padding: var(--space-md);
      background: var(--color-accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 48px;
    }
  `],
})
export class CategorizeComponent implements OnChanges {
  @Input({ required: true }) question!: CategorizeQuestion;
  @Input() answered = false;
  @Output() answer = new EventEmitter<Record<string, string[]>>();

  i18n = inject(I18nService);
  selectedItem = signal<string | null>(null);
  placements = signal<Record<string, string[]>>({});

  ngOnChanges(): void {
    this.selectedItem.set(null);
    this.placements.set({});
  }

  remainingItems = computed(() => {
    const placed = new Set(
      Object.values(this.placements()).flat()
    );
    return this.question.items.filter(i => !placed.has(i));
  });

  allPlaced = computed(() => this.remainingItems().length === 0);

  selectItem(item: string): void {
    this.selectedItem.set(this.selectedItem() === item ? null : item);
  }

  placeInCategory(label: string): void {
    const item = this.selectedItem();
    if (!item || this.answered) return;
    this.placements.update(p => ({
      ...p,
      [label]: [...(p[label] || []), item],
    }));
    this.selectedItem.set(null);
  }

  removeItem(label: string, item: string, event: Event): void {
    event.stopPropagation();
    this.placements.update(p => ({
      ...p,
      [label]: (p[label] || []).filter(i => i !== item),
    }));
  }

  isCategoryCorrect(label: string): boolean {
    const cat = this.question.categories.find(c => c.label === label);
    if (!cat) return false;
    const placed = this.placements()[label] || [];
    return (
      placed.length === cat.answers.length &&
      cat.answers.every(a => placed.includes(a))
    );
  }

  submit(): void {
    this.answer.emit(this.placements());
  }
}
