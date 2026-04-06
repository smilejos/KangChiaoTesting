import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { I18nService } from '../../core/services/i18n.service';
import { AttemptRecord } from '../../core/models/history.model';
import { AnswerDisplayComponent } from './answer-display.component';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [AnswerDisplayComponent],
  template: `
    <div class="page">
      @if (attempt(); as a) {
        <header class="header">
          <button class="back-btn" (click)="goBack()">&larr;</button>
          <h1 class="title">{{ a.quizTitle }}</h1>
        </header>

        <div class="score-ring"
             [style.--pct]="a.percentage"
             [style.--ring-color]="ringColor(a.percentage)">
          <div class="ring-inner">
            <span class="ring-score">{{ a.correct }} / {{ a.total }}</span>
            <span class="ring-pct">{{ a.percentage }}%</span>
          </div>
        </div>

        <p class="date">{{ formatDate(a.date) }}</p>

        <h2 class="section-title">{{ i18n.t('review') }}</h2>
        <div class="answers">
          @for (answer of a.answers; track $index) {
            <app-answer-display [record]="answer" />
          }
        </div>

        <button class="btn btn-secondary" (click)="goBack()">
          {{ i18n.t('backToHome') }}
        </button>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
      text-align: center;
    }
    .header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
      text-align: left;
    }
    .back-btn {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text);
      font-size: 1.2rem;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      flex-shrink: 0;
    }
    .title { font-size: 1.3rem; margin: 0; }
    .score-ring {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: 0 auto var(--space-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: conic-gradient(
        var(--ring-color) calc(var(--pct) * 1%),
        var(--color-surface) 0
      );
    }
    .ring-inner {
      width: 122px;
      height: 122px;
      border-radius: 50%;
      background: var(--color-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .ring-score { font-size: 1.4rem; font-weight: 700; }
    .ring-pct { font-size: 0.85rem; color: var(--color-muted); }
    .date {
      font-size: 0.85rem;
      color: var(--color-muted);
      margin-bottom: var(--space-lg);
    }
    .section-title {
      font-size: 1.1rem;
      text-align: left;
      margin-bottom: var(--space-sm);
    }
    .answers {
      text-align: left;
      margin-bottom: var(--space-lg);
    }
    .btn {
      padding: var(--space-md);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 52px;
      width: 100%;
    }
    .btn:active { transform: scale(0.98); }
    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }
  `],
})
export class HistoryDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private historyService = inject(HistoryService);
  i18n = inject(I18nService);

  attempt = signal<AttemptRecord | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('attemptId');
    if (id) {
      const found = this.historyService.getAttempt(id);
      if (found) {
        this.attempt.set(found);
        return;
      }
    }
    this.router.navigate(['/history']);
  }

  ringColor(pct: number): string {
    if (pct >= 80) return 'var(--color-correct)';
    if (pct >= 50) return '#facc15';
    return 'var(--color-wrong)';
  }

  formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  }

  goBack(): void {
    const a = this.attempt();
    if (a) {
      this.router.navigate(['/history', a.quizGuid]);
    } else {
      this.router.navigate(['/history']);
    }
  }
}
