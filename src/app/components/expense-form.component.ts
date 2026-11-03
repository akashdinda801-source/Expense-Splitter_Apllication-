import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../expense.service';
import { CATEGORIES } from '../models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="card form" (ngSubmit)="submit()">
      <h2>Add an expense</h2>
      <label>What was it for?
        <input name="title" [(ngModel)]="title" placeholder="Dinner at Park Street" required>
      </label>
      <div class="row">
        <label>Amount (₹)
          <input name="amount" type="number" min="1" [(ngModel)]="amount" required>
        </label>
        <label>Category
          <select name="category" [(ngModel)]="category">
            @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
          </select>
        </label>
      </div>
      <label>Paid by
        <select name="paidBy" [(ngModel)]="paidBy">
          @for (m of svc.members(); track m.id) { <option [value]="m.id">{{ m.name }}</option> }
        </select>
      </label>
      <div>
        <p class="legend">Split between</p>
        <div class="chips">
          @for (m of svc.members(); track m.id) {
            <button type="button" class="chip" [class.on]="splitAmong.includes(m.id)" (click)="toggle(m.id)">{{ m.name }}</button>
          }
        </div>
      </div>
      @if (error) { <p class="neg" role="alert">{{ error }}</p> }
      <button class="btn" type="submit">Add expense</button>
    </form>`,
  styles: [`
    .form { display: grid; gap: 1rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .legend { font-size: .9rem; font-weight: 500; margin-bottom: .4rem; }
    .chips { display: flex; flex-wrap: wrap; gap: .4rem; }
  `]
})
export class ExpenseFormComponent {
  svc = inject(ExpenseService);
  categories = CATEGORIES;
  @Output() saved = new EventEmitter<void>();

  title = '';
  amount: number | null = null;
  category = CATEGORIES[0];
  paidBy = this.svc.members()[0]?.id ?? '';
  splitAmong: string[] = this.svc.members().map(m => m.id);
  error = '';

  toggle(id: string) {
    this.splitAmong = this.splitAmong.includes(id)
      ? this.splitAmong.filter(x => x !== id)
      : [...this.splitAmong, id];
  }

  submit() {
    if (!this.title.trim() || !this.amount || this.amount <= 0) { this.error = 'Enter a title and an amount above zero.'; return; }
    if (!this.splitAmong.length) { this.error = 'Pick at least one person to split with.'; return; }
    this.svc.addExpense({ title: this.title.trim(), amount: this.amount, paidBy: this.paidBy, splitAmong: this.splitAmong, category: this.category });
    this.title = ''; this.amount = null; this.error = '';
    this.saved.emit();
  }
}
