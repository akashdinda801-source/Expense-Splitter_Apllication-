import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../expense.service';
import { CATEGORIES, Expense } from '../models';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, AvatarComponent],
  template: `
    @if (filterable) {
      <div class="filters">
        <input type="search" placeholder="Search expenses" [(ngModel)]="query" aria-label="Search expenses">
        <select [(ngModel)]="category" aria-label="Filter by category">
          <option value="">All categories</option>
          @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
        </select>
      </div>
    }
    <ul class="list">
      @for (e of visible; track e.id) {
        <li>
          <app-avatar [name]="svc.nameOf(e.paidBy)" [color]="svc.member(e.paidBy)?.color ?? '#999'" />
          <div class="info">
            <strong>{{ e.title }}</strong>
            <span class="muted">{{ svc.nameOf(e.paidBy) }} paid, split {{ e.splitAmong.length }} ways, {{ e.date | date: 'd MMM' }}</span>
          </div>
          <span class="tag" [class]="e.category.toLowerCase()">{{ e.category }}</span>
          <strong class="amt">{{ e.amount | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
          @if (canDelete) { <button class="x" (click)="remove.emit(e.id)" [attr.aria-label]="'Delete ' + e.title">✕</button> }
        </li>
      } @empty {
        <li class="empty">No expenses match. Add one to get started.</li>
      }
    </ul>`,
  styles: [`
    .filters { display: grid; grid-template-columns: 2fr 1fr; gap: .6rem; margin-bottom: .9rem; }
    .list { list-style: none; margin: 0; padding: 0; display: grid; }
    li { display: flex; align-items: center; gap: .8rem; padding: .85rem 0; border-bottom: 1px dashed var(--line); }
    li:last-child { border-bottom: 0; }
    .info { flex: 1; display: grid; min-width: 0; }
    .info span { font-size: .85rem; }
    .amt { font-family: var(--display); font-size: 1.1rem; }
    .tag { font-size: .75rem; padding: .15rem .6rem; border-radius: 999px; background: #e9ebff; color: var(--brand); }
    .tag.food { background: #fff1d6; color: #9a6200; } .tag.travel { background: #d9f5f1; color: #0b7467; }
    .tag.stay { background: #f1e6fb; color: #6b2fa0; } .tag.fun { background: #ffe3ee; color: #a8235f; }
    .x { border: 0; background: transparent; color: var(--ink-soft); cursor: pointer; border-radius: 8px; padding: .3rem .5rem; }
    .x:hover { background: #ffe5e6; color: var(--owe); }
    .empty { color: var(--ink-soft); justify-content: center; }
    @media (max-width: 560px) { .tag { display: none; } .filters { grid-template-columns: 1fr; } }
  `]
})
export class ExpenseListComponent {
  svc = inject(ExpenseService);
  categories = CATEGORIES;
  @Input() expenses: Expense[] = [];
  @Input() canDelete = false;
  @Input() filterable = false;
  @Output() remove = new EventEmitter<string>();

  query = '';
  category = '';

  // Dynamic rendering via filter + sort array operations
  get visible(): Expense[] {
    const q = this.query.trim().toLowerCase();
    return this.expenses
      .filter(e => (!this.category || e.category === this.category) && (!q || e.title.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}
