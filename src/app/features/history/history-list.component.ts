import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { I18nService } from '../../core/services/i18n.service';
import { AttemptRecord } from '../../core/models/history.model';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <header class="header">
        <button class="back-btn" (click)="goBack()">&larr;</button>
        <h1 class="title">{{ i18n.t('attemptHistory') }}</h1>
      </header>

      @if (grouped().length === 0) {
        <p class="empty">{{ i18n.t('noAttempts') }}</p>
      }

      @for (group of grouped(); track group.quizGuid) {
        <div class="quiz-group">
          <h2 class="group-title">{{ group.quizTitle }}</h2>
          <div class="attempt-list">
            @for (attempt of group.attempts; track attempt.id) {
              <a class="attempt-card" [routerLink]="['/history/detail', attempt.id]">
                <div class="attempt-ring"
                     [style.--pct]="attempt.percentage"
                     [style.--ring-color]="ringColor(attempt.percentage)">
                  <span class="ring-text">{{ attempt.percentage }}%</span>
                </div>
                <div class="attempt-info">
                  <div class="attempt-score">
                    {{ attempt.correct }}/{{ attempt.total }} {{ i18n.t('questionsCorrect') }}
                  </div>
                  <div class="attempt-date">{{ formatDate(attempt.date) }}</div>
                </div>
                <span class="arrow">&rarr;</span>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
    }
    .header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
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
    .title { font-size: 1.4rem; margin: 0; }
    .empty {
      text-align: center;
      color: var(--color-muted);
      padding: var(--space-xl);
    }
    .quiz-group { margin-bottom: var(--space-lg); }
    .group-title {
      font-size: 1rem;
      color: var(--color-muted);
      margin: 0 0 var(--space-sm);
      padding-bottom: var(--space-xs);
      border-bottom: 1px solid var(--color-border);
    }
    .attempt-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .attempt-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      text-decoration: none;
      color: var(--color-text);
      min-height: 44px;
    }
    .attempt-card:active { transform: scale(0.98); }
    .attempt-ring {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: conic-gradient(
        var(--ring-color) calc(var(--pct) * 1%),
        var(--color-border) 0
      );
      flex-shrink: 0;
    }
    .ring-text {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .attempt-info { flex: 1; }
    .attempt-score { font-weight: 600; font-size: 0.95rem; }
    .attempt-date { font-size: 0.8rem; color: var(--color-muted); margin-top: 2px; }
    .arrow {
      font-size: 1.2rem;
      color: var(--color-accent);
      flex-shrink: 0;
    }
  `],
})
export class HistoryListComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private historyService = inject(HistoryService);
  i18n = inject(I18nService);

  filterGuid = signal<string | null>(null);

  ngOnInit(): void {
    const guid = this.route.snapshot.paramMap.get('quizGuid');
    if (guid) this.filterGuid.set(guid);
  }

  grouped = computed(() => {
    const attempts = this.filterGuid()
      ? this.historyService.getAttemptsByQuiz(this.filterGuid()!)
      : this.historyService.allAttempts();

    const map = new Map<string, { quizGuid: string; quizTitle: string; attempts: AttemptRecord[] }>();
    for (const a of attempts) {
      if (!map.has(a.quizGuid)) {
        map.set(a.quizGuid, { quizGuid: a.quizGuid, quizTitle: a.quizTitle, attempts: [] });
      }
      map.get(a.quizGuid)!.attempts.push(a);
    }
    return Array.from(map.values());
  });

  ringColor(pct: number): string {
    if (pct >= 80) return 'var(--color-correct)';
    if (pct >= 50) return '#facc15';
    return 'var(--color-wrong)';
  }

  formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
