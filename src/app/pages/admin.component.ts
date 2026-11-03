import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../expense.service';
import { AvatarComponent } from '../components/avatar.component';
import { StatCardComponent } from '../components/stat-card.component';
import { ExpenseListComponent } from '../components/expense-list.component';

const ADMIN_PIN = 'admin123'; // demo only. Use real authentication on a server in production.

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, AvatarComponent, StatCardComponent, ExpenseListComponent],
  template: `
    @if (!svc.isAdmin()) {
      <section class="gate card">
        <h1>Admin access</h1>
        <p class="muted">Enter the admin PIN to manage members and data. Demo PIN: <code>admin123</code></p>
        <form (ngSubmit)="unlock()">
          <input type="password" name="pin" [(ngModel)]="pin" placeholder="PIN" aria-label="Admin PIN">
          @if (pinError()) { <p class="neg" role="alert">That PIN is incorrect. Try again.</p> }
          <button class="btn" type="submit">Unlock admin</button>
        </form>
      </section>
    } @else {
      <section class="page">
        <header class="bar">
          <div><h1>Admin</h1><p class="muted">Manage members, review spending, and control data.</p></div>
          <button class="btn ghost" (click)="svc.isAdmin.set(false)">Lock</button>
        </header>

        <div class="grid stats">
          <app-stat-card label="Members" [value]="'' + svc.members().length" />
          <app-stat-card label="Expenses" [value]="'' + svc.expenses().length" tone="good" />
          <app-stat-card label="Total tracked" [value]="'₹' + svc.total().toLocaleString('en-IN')" tone="warn" />
        </div>

        <div class="grid two">
          <div class="card">
            <h2>Members</h2>
            <form class="add" (ngSubmit)="addMember()">
              <input name="newName" [(ngModel)]="newName" placeholder="New member name" aria-label="New member name">
              <button class="btn" type="submit">Add</button>
            </form>
            @if (msg()) { <p class="note" role="status">{{ msg() }}</p> }
            <ul class="members">
              @for (m of svc.members(); track m.id) {
                <li>
                  <app-avatar [name]="m.name" [color]="m.color" />
                  <span>{{ m.name }}</span>
                  <button class="btn ghost" (click)="removeMember(m.id, m.name)">Remove</button>
                </li>
              }
            </ul>
          </div>

          <div class="card">
            <h2>Spending by category</h2>
            <ul class="cats">
              @for (c of svc.byCategory(); track c.category) {
                <li>
                  <div class="row"><span>{{ c.category }}</span><strong>{{ c.total | currency: 'INR' : 'symbol' : '1.0-0' }}</strong></div>
                  <div class="track"><div class="fill" [style.width.%]="(c.total / svc.total()) * 100"></div></div>
                </li>
              } @empty { <li class="muted">No spending yet.</li> }
            </ul>
          </div>
        </div>

        <div class="card">
          <h2>Moderate expenses</h2>
          <app-expense-list [expenses]="svc.expenses()" [canDelete]="true" [filterable]="true" (remove)="svc.removeExpense($event)" />
        </div>

        <div class="card tools">
          <h2>Data tools</h2>
          <div class="btns">
            <button class="btn ghost" (click)="download()">Download JSON backup</button>
            <button class="btn ghost" (click)="svc.loadDemo()">Reset to demo data</button>
            <button class="btn danger" (click)="clear()">Delete all expenses</button>
          </div>
        </div>
      </section>
    }`,
  styles: [`
    .gate { max-width: 420px; margin: 8vh auto 0; display: grid; gap: 1rem; }
    .gate form { display: grid; gap: .75rem; }
    code { background: var(--paper); padding: .1rem .4rem; border-radius: 6px; }
    .bar { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
    .add { display: flex; gap: .5rem; margin: 1rem 0 .5rem; }
    .note { color: var(--owe); font-size: .9rem; margin-bottom: .5rem; }
    .members, .cats { list-style: none; margin: .75rem 0 0; padding: 0; display: grid; gap: .75rem; }
    .members li { display: flex; align-items: center; gap: .75rem; } .members span { flex: 1; font-weight: 500; }
    .row { display: flex; justify-content: space-between; margin-bottom: .25rem; }
    .track { height: 10px; background: var(--paper); border-radius: 99px; overflow: hidden; }
    .fill { height: 100%; background: var(--brand); border-radius: 99px; }
    .btns { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1rem; }
  `]
})
export class AdminComponent {
  svc = inject(ExpenseService);
  pin = '';
  newName = '';
  pinError = signal(false);
  msg = signal('');

  unlock() {
    const ok = this.pin === ADMIN_PIN;
    this.pinError.set(!ok);
    this.svc.isAdmin.set(ok);
    this.pin = '';
  }
  addMember() {
    if (!this.newName.trim()) return;
    this.svc.addMember(this.newName);
    this.newName = ''; this.msg.set('');
  }
  removeMember(id: string, name: string) {
    this.msg.set(this.svc.removeMember(id) ? '' : `${name} is part of existing expenses. Delete those expenses first.`);
  }
  clear() { if (confirm('Delete every expense? This cannot be undone.')) this.svc.clearAll(); }
  download() {
    const url = URL.createObjectURL(new Blob([this.svc.exportJson()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'expense-splitter-backup.json'; a.click();
    URL.revokeObjectURL(url);
  }
}
