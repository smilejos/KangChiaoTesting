import { Component, Input, inject } from '@angular/core';
import { AnswerRecord } from '../../core/models/history.model';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-answer-display',
  standalone: true,
  template: `
    <div class="answer-row" [class.correct]="record.correct" [class.wrong]="!record.correct">
      <div class="row-header">
        <span class="icon">{{ record.correct ? '&#10003;' : '&#10007;' }}</span>
        <span class="q-text">{{ record.questionText }}</span>
      </div>

      <div class="answer-body">
        @switch (record.userAnswer.type) {
          @case ('multiple-choice') {
            <div class="answer-line user" [class.wrong-text]="!record.correct">
              <span class="label">{{ i18n.t('studentAnswer') }}:</span>
              <span>{{ mcLabel(record.userAnswer.index) }} {{ record.userAnswer.label }}</span>
            </div>
            @if (!record.correct) {
              <div class="answer-line correct-line">
                <span class="label">{{ i18n.t('correctAnswer') }}:</span>
                <span>{{ mcLabel(record.correctAnswer.type === 'multiple-choice' ? record.correctAnswer.index : 0) }}
                  {{ record.correctAnswer.type === 'multiple-choice' ? record.correctAnswer.label : '' }}</span>
              </div>
            }
          }
          @case ('true-false') {
            <div class="answer-line user" [class.wrong-text]="!record.correct">
              <span class="label">{{ i18n.t('studentAnswer') }}:</span>
              <span>{{ record.userAnswer.value ? i18n.t('true') : i18n.t('false') }}</span>
            </div>
            @if (!record.correct) {
              <div class="answer-line correct-line">
                <span class="label">{{ i18n.t('correctAnswer') }}:</span>
                <span>{{ record.correctAnswer.type === 'true-false' ? (record.correctAnswer.value ? i18n.t('true') : i18n.t('false')) : '' }}</span>
              </div>
            }
          }
          @case ('fill-in') {
            <div class="answer-line user" [class.wrong-text]="!record.correct">
              <span class="label">{{ i18n.t('studentAnswer') }}:</span>
              <span>{{ record.userAnswer.text || '—' }}
                @if (record.userAnswer.selfGraded) {
                  <span class="badge">{{ i18n.t('selfGradedLabel') }}</span>
                }
              </span>
            </div>
            @if (!record.correct) {
              <div class="answer-line correct-line">
                <span class="label">{{ i18n.t('correctAnswer') }}:</span>
                <span>{{ record.correctAnswer.type === 'fill-in' ? record.correctAnswer.text : '' }}</span>
              </div>
            }
          }
          @case ('categorize') {
            <div class="cat-compare">
              <div class="cat-col">
                <div class="cat-col-title" [class.wrong-text]="!record.correct">{{ i18n.t('studentAnswer') }}</div>
                @for (entry of catEntries(record.userAnswer.placements); track entry.key) {
                  <div class="cat-group">
                    <div class="cat-label">{{ entry.key }}</div>
                    <div class="cat-items">
                      @for (item of entry.values; track item) {
                        <span class="cat-item">{{ item }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
              @if (!record.correct) {
                <div class="cat-col">
                  <div class="cat-col-title correct-text">{{ i18n.t('correctAnswer') }}</div>
                  @if (record.correctAnswer.type === 'categorize') {
                    @for (entry of catEntries(record.correctAnswer.placements); track entry.key) {
                      <div class="cat-group">
                        <div class="cat-label">{{ entry.key }}</div>
                        <div class="cat-items">
                          @for (item of entry.values; track item) {
                            <span class="cat-item">{{ item }}</span>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }
          @case ('reorder') {
            <div class="answer-line user" [class.wrong-text]="!record.correct">
              <span class="label">{{ i18n.t('studentAnswer') }}:</span>
              <span class="word-list">
                @for (w of record.userAnswer.order; track $index) {
                  <span class="word-chip">{{ w }}</span>
                }
              </span>
            </div>
            @if (!record.correct) {
              <div class="answer-line correct-line">
                <span class="label">{{ i18n.t('correctAnswer') }}:</span>
                <span class="word-list">
                  @if (record.correctAnswer.type === 'reorder') {
                    @for (w of record.correctAnswer.order; track $index) {
                      <span class="word-chip">{{ w }}</span>
                    }
                  }
                </span>
              </div>
            }
          }
        }

        @if (!record.correct && record.explanation) {
          <div class="explanation">{{ record.explanation }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .answer-row {
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-sm);
    }
    .answer-row.correct { background: rgba(16,185,129,0.08); }
    .answer-row.wrong { background: rgba(239,68,68,0.08); }
    .row-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm);
      margin-bottom: var(--space-sm);
    }
    .icon {
      flex-shrink: 0;
      font-weight: 700;
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
    }
    .correct .icon { color: var(--color-correct); }
    .wrong .icon { color: var(--color-wrong); }
    .q-text { flex: 1; line-height: 1.4; }
    .answer-body {
      padding-left: 32px;
      font-size: 0.9rem;
    }
    .answer-line {
      margin-bottom: 4px;
      line-height: 1.5;
    }
    .label {
      color: var(--color-muted);
      margin-right: 4px;
    }
    .wrong-text { color: var(--color-wrong); }
    .correct-text { color: var(--color-correct); }
    .correct-line { color: var(--color-correct); }
    .badge {
      display: inline-block;
      font-size: 0.7rem;
      padding: 1px 6px;
      border-radius: 8px;
      background: var(--color-border);
      color: var(--color-muted);
      margin-left: 4px;
      vertical-align: middle;
    }
    .explanation {
      margin-top: var(--space-sm);
      font-size: 0.85rem;
      color: var(--color-muted);
      font-style: italic;
      line-height: 1.4;
    }
    .cat-compare {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }
    .cat-col-title {
      font-weight: 600;
      font-size: 0.8rem;
      margin-bottom: var(--space-xs);
    }
    .cat-group { margin-bottom: var(--space-xs); }
    .cat-label {
      font-weight: 600;
      font-size: 0.8rem;
      color: var(--color-muted);
    }
    .cat-items {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
    }
    .cat-item {
      padding: 2px 8px;
      background: var(--color-border);
      border-radius: 6px;
      font-size: 0.8rem;
    }
    .word-list {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .word-chip {
      padding: 2px 8px;
      background: var(--color-border);
      border-radius: 6px;
      font-size: 0.85rem;
    }
  `],
})
export class AnswerDisplayComponent {
  @Input({ required: true }) record!: AnswerRecord;
  i18n = inject(I18nService);

  mcLabel(index: number): string {
    return String.fromCharCode(65 + index) + '.';
  }

  catEntries(placements: Record<string, string[]>): { key: string; values: string[] }[] {
    return Object.entries(placements).map(([key, values]) => ({ key, values }));
  }
}
