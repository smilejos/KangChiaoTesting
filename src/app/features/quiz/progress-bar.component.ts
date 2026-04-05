import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="progress-wrap">
      <div class="bar">
        <div class="fill" [style.width.%]="percentage"></div>
      </div>
      <span class="label">{{ current + 1 }} / {{ total }}</span>
    </div>
  `,
  styles: [`
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .bar {
      flex: 1;
      height: 8px;
      background: var(--color-surface);
      border-radius: 4px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--color-accent);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .label {
      font-size: 0.85rem;
      color: var(--color-muted);
      white-space: nowrap;
    }
  `],
})
export class ProgressBarComponent {
  @Input() current = 0;
  @Input() total = 0;

  get percentage(): number {
    return this.total > 0 ? ((this.current + 1) / this.total) * 100 : 0;
  }
}
