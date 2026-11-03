import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ExpenseService } from '../expense.service';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-balance-list',
  standalone: true,
  imports: [CurrencyPipe, AvatarComponent],
  template: `
    <ul>
      @for (b of svc.balances(); track b.member.id) {
        <li>
          <app-avatar [name]="b.member.name" [color]="b.member.color" [size]="32" />
          <div class="body">
            <div class="top">
              <span>{{ b.member.name }}</span>
              <strong [class.pos]="b.net > 0" [class.neg]="b.net < 0">
                @if (b.net > 0) { gets back {{ b.net | currency: 'INR' : 'symbol' : '1.0-0' }} }
                @else if (b.net < 0) { owes {{ abs(b.net) | currency: 'INR' : 'symbol' : '1.0-0' }} }
                @else { settled }
              </strong>
            </div>
            <div class="track"><div class="fill" [class.give]="b.net < 0" [style.width.%]="width(b.net)"></div></div>
          </div>
        </li>
      }
    </ul>`,
  styles: [`
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
    li { display: flex; gap: .75rem; align-items: center; }
    .body { flex: 1; }
    .top { display: flex; justify-content: space-between; font-size: .95rem; margin-bottom: .3rem; }
    .track { height: 8px; background: var(--paper); border-radius: 99px; overflow: hidden; }
    .fill { height: 100%; background: var(--owed); border-radius: 99px; transition: width .4s; }
    .fill.give { background: var(--owe); }
  `]
})
export class BalanceListComponent {
  svc = inject(ExpenseService);
  abs = Math.abs;
  width(net: number) {
    const max = Math.max(1, ...this.svc.balances().map(b => Math.abs(b.net)));
    return (Math.abs(net) / max) * 100;
  }
}
