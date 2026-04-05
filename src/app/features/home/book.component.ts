import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizLoaderService } from '../../core/services/quiz-loader.service';
import { I18nService } from '../../core/services/i18n.service';
import { BookEntry, VersionEntry } from '../../core/models/quiz-index.model';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <header class="header">
        <div class="header-top">
          <button class="back-btn" (click)="goHome()">&larr;</button>
          <h1 class="title">{{ bookName() }}</h1>
          <button class="lang-toggle" (click)="i18n.toggle()">
            {{ i18n.lang() === 'en' ? '中文' : 'EN' }}
          </button>
        </div>
      </header>

      <div class="version-list">
        @for (ver of versions(); track ver.id) {
          <a class="version-card" [routerLink]="['/version', bookId(), ver.name]"
             [style.--card-color]="bookColor()">
            <div class="version-icon">📘</div>
            <div class="version-body">
              <h3 class="version-name">{{ i18n.t('version') }} {{ ver.name }}</h3>
              <p class="version-meta">
                {{ ver.units.length }} {{ i18n.t('units') }}
              </p>
            </div>
            <span class="arrow">&rarr;</span>
          </a>
        } @empty {
          <p class="empty">{{ i18n.t('noVersions') }}</p>
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
    .title {
      flex: 1;
      font-size: 1.5rem;
      margin: 0;
      color: var(--color-text);
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
    .version-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .version-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--color-text);
      transition: transform 0.15s;
      border-left: 4px solid var(--card-color, var(--color-accent));
      min-height: 44px;
    }
    .version-card:active { transform: scale(0.98); }
    .version-icon {
      font-size: 2rem;
      flex-shrink: 0;
      width: 48px;
      text-align: center;
    }
    .version-body { flex: 1; min-width: 0; }
    .version-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .version-meta {
      margin: 4px 0 0;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    .arrow {
      font-size: 1.2rem;
      color: var(--card-color, var(--color-accent));
      flex-shrink: 0;
    }
    .empty {
      text-align: center;
      color: var(--color-muted);
      padding: var(--space-xl);
    }
  `],
})
export class BookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loader = inject(QuizLoaderService);
  i18n = inject(I18nService);

  bookId = signal('');
  bookName = signal('');
  bookColor = signal('');
  versions = signal<VersionEntry[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('bookId')!;
    this.bookId.set(id);

    this.loader.loadIndex().subscribe(data => {
      const book = data.books.find((b: BookEntry) => b.id === id);
      if (!book) {
        this.router.navigate(['/']);
        return;
      }
      this.bookName.set(book.name);
      this.bookColor.set(book.color);
      this.versions.set(book.versions);
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
