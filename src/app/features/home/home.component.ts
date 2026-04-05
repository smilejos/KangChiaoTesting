import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizLoaderService } from '../../core/services/quiz-loader.service';
import { I18nService } from '../../core/services/i18n.service';
import { BookEntry } from '../../core/models/quiz-index.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">
      <header class="header">
        <div class="header-top">
          <h1 class="title">{{ i18n.t('appTitle') }}</h1>
          <button class="lang-toggle" (click)="i18n.toggle()">
            {{ i18n.lang() === 'en' ? '中文' : 'EN' }}
          </button>
        </div>
        <p class="subtitle">{{ i18n.t('appSubtitle') }}</p>
      </header>

      <div class="book-list">
        @for (book of books(); track book.id) {
          <a class="book-card" [routerLink]="['/book', book.id]"
             [style.--card-color]="book.color">
            <div class="book-icon">📖</div>
            <div class="book-body">
              <h3 class="book-name">{{ book.name }}</h3>
              <p class="book-meta">
                {{ book.versions.length }} {{ book.versions.length === 1 ? i18n.t('version') : i18n.t('versions') }}
              </p>
            </div>
            <span class="arrow">&rarr;</span>
          </a>
        } @empty {
          <p class="loading">{{ i18n.t('loading') }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .home {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-md);
      padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
    }
    .header { margin-bottom: var(--space-lg); }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .title {
      font-size: 1.75rem;
      margin: 0;
      color: var(--color-text);
    }
    .subtitle {
      margin: var(--space-xs) 0 0;
      color: var(--color-muted);
      font-size: 0.95rem;
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
    .book-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .book-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--color-text);
      transition: transform 0.15s, box-shadow 0.15s;
      border-left: 4px solid var(--card-color, var(--color-accent));
      min-height: 44px;
    }
    .book-card:active { transform: scale(0.98); }
    .book-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
      width: 56px;
      text-align: center;
    }
    .book-body { flex: 1; min-width: 0; }
    .book-name {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .book-meta {
      margin: 4px 0 0;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    .arrow {
      font-size: 1.2rem;
      color: var(--card-color, var(--color-accent));
      flex-shrink: 0;
    }
    .loading {
      text-align: center;
      color: var(--color-muted);
      padding: var(--space-xl);
    }
  `],
})
export class HomeComponent implements OnInit {
  private loader = inject(QuizLoaderService);
  i18n = inject(I18nService);
  books = signal<BookEntry[]>([]);

  ngOnInit(): void {
    this.loader.loadIndex().subscribe(data => {
      this.books.set(data.books);
    });
  }
}
