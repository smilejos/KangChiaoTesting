import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizCardComponent } from './quiz-card.component';
import { QuizLoaderService } from '../../core/services/quiz-loader.service';
import { I18nService } from '../../core/services/i18n.service';
import { BookEntry, QuizEntry, UnitEntry } from '../../core/models/quiz-index.model';

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [QuizCardComponent],
  template: `
    <div class="page">
      <header class="header">
        <div class="header-top">
          <button class="back-btn" (click)="goBack()">&larr;</button>
          <div class="header-titles">
            <h1 class="title">{{ unitName() }}</h1>
            <p class="breadcrumb">{{ bookName() }}</p>
          </div>
          <button class="lang-toggle" (click)="i18n.toggle()">
            {{ i18n.lang() === 'en' ? '中文' : 'EN' }}
          </button>
        </div>
      </header>

      <div class="quiz-list">
        @for (quiz of quizzes(); track quiz.id) {
          <app-quiz-card [quiz]="quiz" />
        } @empty {
          <p class="empty">{{ i18n.t('noQuizzes') }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
    }
    .header { margin-bottom: var(--space-lg); }
    .header-top {
      display: flex;
      align-items: center;
      gap: var(--space-md);
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
    .header-titles { flex: 1; min-width: 0; }
    .title {
      font-size: 1.5rem;
      margin: 0;
      color: var(--color-text);
    }
    .breadcrumb {
      margin: 2px 0 0;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    .lang-toggle {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
    }
    .quiz-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .empty {
      text-align: center;
      color: var(--color-muted);
      padding: var(--space-xl);
    }
  `],
})
export class UnitComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loader = inject(QuizLoaderService);
  i18n = inject(I18nService);

  bookId = signal('');
  bookName = signal('');
  unitName = signal('');
  quizzes = signal<QuizEntry[]>([]);

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('bookId')!;
    const unitId = this.route.snapshot.paramMap.get('unitId')!;
    this.bookId.set(bookId);

    this.loader.loadIndex().subscribe(data => {
      const book = data.books.find((b: BookEntry) => b.id === bookId);
      if (!book) {
        this.router.navigate(['/']);
        return;
      }
      this.bookName.set(book.name);

      const unit = book.units.find((u: UnitEntry) => u.id === `${bookId}/${unitId}`);
      if (!unit) {
        this.router.navigate(['/book', bookId]);
        return;
      }
      this.unitName.set(unit.name);
      this.quizzes.set(unit.quizzes);
    });
  }

  goBack(): void {
    this.router.navigate(['/book', this.bookId()]);
  }
}
