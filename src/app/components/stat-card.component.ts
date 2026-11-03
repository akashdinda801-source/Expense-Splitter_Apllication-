import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat" [class]="tone">
      <span class="label">{{ label }}</span>
      <strong>{{ value }}</strong>
      @if (hint) { <small>{{ hint }}</small> }
    </div>`,
  styles: [`
    .stat { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.1rem 1.25rem; display: grid; gap: .15rem; border-top: 5px solid var(--brand); }
    .stat.good { border-top-color: var(--owed); } .stat.warn { border-top-color: var(--amber); }
    .label { color: var(--ink-soft); font-size: .9rem; }
    strong { font-family: var(--display); font-size: 1.9rem; letter-spacing: -.02em; }
    small { color: var(--ink-soft); }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() hint = '';
  @Input() tone: '' | 'good' | 'warn' = '';
}
