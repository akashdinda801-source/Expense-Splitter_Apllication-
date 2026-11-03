import { Component, inject, signal } from '@angular/core';
import { ExpenseService } from '../expense.service';
import { ExpenseFormComponent } from '../components/expense-form.component';
import { ExpenseListComponent } from '../components/expense-list.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ExpenseFormComponent, ExpenseListComponent],
  template: `
    <section class="page">
      <header><h1>Expenses</h1><p class="muted">Add a bill and choose who shares it.</p></header>
      @if (flash()) { <p class="flash" role="status">Expense added.</p> }
      <div class="grid two">
        <app-expense-form (saved)="onSaved()" />
        <div class="card">
          <h2>All expenses</h2>
          <app-expense-list [expenses]="svc.expenses()" [filterable]="true" />
        </div>
      </div>
    </section>`,
  styles: [`.flash { background: #d9f5f1; color: #0b7467; padding: .6rem 1rem; border-radius: 12px; font-weight: 600; }`]
})
export class ExpensesComponent {
  svc = inject(ExpenseService);
  flash = signal(false);
  onSaved() { this.flash.set(true); setTimeout(() => this.flash.set(false), 2500); }
}