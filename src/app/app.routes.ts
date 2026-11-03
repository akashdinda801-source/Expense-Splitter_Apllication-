import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { ExpensesComponent } from './pages/expenses.component';
import { AdminComponent } from './pages/admin.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'Overview' },
  { path: 'expenses', component: ExpensesComponent, title: 'Expenses' },
  { path: 'admin', component: AdminComponent, title: 'Admin' },
  { path: '**', redirectTo: '' }
];
