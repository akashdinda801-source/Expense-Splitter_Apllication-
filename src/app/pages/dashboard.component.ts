import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../expense.service';
import { StatCardComponent } from '../components/stat-card.component';
import { BalanceListComponent } from '../components/balance-list.component';
import { ExpenseListComponent } from '../components/expense-list.component';
import { AvatarComponent } from '../components/avatar.component';
 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, StatCardComponent, BalanceListComponent, ExpenseListComponent, AvatarComponent],
  template: `
    <section class="page">
 
      <!-- Hero: total + category donut -->
      <header class="hero">
        <div class="hero-text">
          <p class="kicker">{{ svc.members().length }} people, {{ svc.expenses().length }} expenses</p>
          <h1>{{ fmt(svc.total()) }}<span> spent together</span></h1>
          <p class="sub">
            @if (svc.settlements().length) {
              {{ svc.settlements().length }} payment{{ svc.settlements().length > 1 ? 's' : '' }} will make everyone even.
            } @else {
              Everyone is even. Nothing to pay.
            }
          </p>
          <div class="actions">
            <a class="btn amber" routerLink="/expenses">Add expense</a>
            <a class="btn outline" routerLink="/admin">Manage group</a>
          </div>
        </div>
 
        <div class="chart">
          <div class="donut" [style.background]="donut()" role="img" aria-label="Spending by category">
            <div class="hole"><strong>{{ cats().length }}</strong><small>categories</small></div>
          </div>
          <ul class="legend">
            @for (c of cats(); track c.category) {
              <li><i [style.background]="c.color"></i>{{ c.category }}<b>{{ c.pct.toFixed(0) }}%</b></li>
            } @empty {
              <li class="none">No spending yet</li>
            }
          </ul>
        </div>
      </header>
 
      <!-- Quick facts -->
      <div class="grid stats">
        <app-stat-card label="Fair share each" [value]="fmt(perPerson())" tone="good" hint="If split evenly" />
        @if (topPayer(); as t) {
          <app-stat-card label="Paid the most" [value]="t.name" [hint]="fmt(t.amount) + ' covered'" />
        }
        @if (biggest(); as b) {
          <app-stat-card label="Biggest expense" [value]="fmt(b.amount)" [hint]="b.title" tone="warn" />
        }
      </div>
 
      <!-- Who pays what -->
      <div class="people-wrap">
        <div class="people-head">
          <h2>Who pays what</h2>
          <p class="muted">{{ svc.members().length }} people share {{ fmt(svc.total()) }}. Fair share is {{ fmt(perPerson()) }} each.</p>
        </div>
        <div class="people">
          @for (p of people(); track p.member.id) {
            <article class="person" [class.owes]="p.pays.length > 0" [class.gets]="p.gets.length > 0">
              <header>
                <app-avatar [name]="p.member.name" [color]="p.member.color" [size]="44" />
                <h3>{{ p.member.name }}</h3>
              </header>
              <dl>
                <div><dt>Paid so far</dt><dd>{{ fmt(p.paid) }}</dd></div>
                <div><dt>Own share</dt><dd>{{ fmt(p.share) }}</dd></div>
              </dl>
              <div class="verdict">
                @for (x of p.pays; track x.to) {
                  <p class="pays">Pays <strong>{{ svc.nameOf(x.to) }}</strong><span>{{ fmt(x.amount) }}</span></p>
                }
                @if (!p.pays.length && p.gets.length) {
                  <p class="gets-line">Gets back<span>{{ fmt(p.net) }}</span></p>
                }
                @if (!p.pays.length && !p.gets.length) {
                  <p class="even">All settled</p>
                }
              </div>
            </article>
          }
        </div>
      </div>
 
      <!-- Settle up + balances -->
      <div class="grid two">
        <div class="ticket">
          <div class="ticket-head">
            <h2>Settle up</h2>
            <span class="count">{{ svc.settlements().length }} to pay</span>
          </div>
          @for (s of svc.settlements(); track s.from + s.to) {
            <div class="pay">
              <app-avatar [name]="svc.nameOf(s.from)" [color]="svc.member(s.from)?.color ?? '#999'" [size]="34" />
              <div class="who">
                <strong>{{ svc.nameOf(s.from) }}</strong>
                <span>pays {{ svc.nameOf(s.to) }}</span>
              </div>
              <span class="sum">{{ s.amount | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
            </div>
          } @empty {
            <p class="done">All settled. Add an expense to start a new round.</p>
          }
        </div>
 
        <div class="card">
          <h2>Balances</h2>
          <app-balance-list />
        </div>
      </div>
 
      <!-- Latest -->
      <div class="card">
        <div class="head">
          <h2>Latest expenses</h2>
          <a class="btn ghost" routerLink="/expenses">See all</a>
        </div>
        <app-expense-list [expenses]="svc.expenses().slice(0, 5)" />
      </div>
    </section>`,
  styles: [`
    /* Hero */
    .hero { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center;
      background: linear-gradient(135deg, #1b1f5e 0%, #2b2fa8 100%); color: #fff;
      border-radius: 26px; padding: clamp(1.4rem, 3vw, 2.4rem); }
    .kicker { color: #b9bde8; font-size: .95rem; margin-bottom: .4rem; }
    .hero h1 { font-size: clamp(2.4rem, 6vw, 3.8rem); line-height: 1.05; }
    .hero h1 span { display: block; font-size: 1.1rem; font-weight: 600; color: #c9ccf2; letter-spacing: 0; margin-top: .4rem; }
    .sub { margin-top: 1rem; color: #dfe1fb; max-width: 34ch; }
    .actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.4rem; }
    .actions .btn { text-decoration: none; }
    .btn.amber { background: var(--amber); color: #1b1f5e; } .btn.amber:hover { background: #ffb938; }
    .btn.outline { background: transparent; border: 1px solid rgba(255,255,255,.4); } .btn.outline:hover { background: rgba(255,255,255,.1); }
 
    /* Donut built with a CSS conic-gradient, no chart library */
    .chart { display: flex; align-items: center; gap: 1.4rem; justify-content: center; flex-wrap: wrap; }
    .donut { width: 168px; height: 168px; border-radius: 50%; display: grid; place-items: center; flex: none; }
    .hole { width: 104px; height: 104px; border-radius: 50%; background: #222694; display: grid; place-content: center; text-align: center; }
    .hole strong { font-family: var(--display); font-size: 1.8rem; line-height: 1; }
    .hole small { color: #b9bde8; }
    .legend { list-style: none; margin: 0; padding: 0; display: grid; gap: .45rem; font-size: .92rem; min-width: 140px; }
    .legend li { display: flex; align-items: center; gap: .5rem; }
    .legend i { width: 10px; height: 10px; border-radius: 3px; flex: none; }
    .legend b { margin-left: auto; font-weight: 600; color: #c9ccf2; }
    .legend .none { color: #b9bde8; }
 
    /* Settle-up ticket */
    .ticket { position: relative; background: #fff; border: 1px solid var(--line); border-radius: var(--radius);
      padding: 1.3rem 1.5rem; display: grid; gap: .9rem; border-left: 6px solid var(--amber); }
    .ticket-head { display: flex; justify-content: space-between; align-items: center; }
    .count { background: #fff1d6; color: #9a6200; font-size: .8rem; font-weight: 600; padding: .2rem .7rem; border-radius: 999px; }
    .pay { display: flex; align-items: center; gap: .8rem; padding-bottom: .9rem; border-bottom: 2px dashed var(--line); }
    .pay:last-child { border-bottom: 0; padding-bottom: 0; }
    .who { flex: 1; display: grid; line-height: 1.25; }
    .who span { color: var(--ink-soft); font-size: .9rem; }
    .sum { font-family: var(--display); font-size: 1.45rem; font-weight: 800; color: var(--ink); }
    .done { color: var(--owed); font-weight: 600; }
 
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
    .head .btn { text-decoration: none; }
 
    /* Who pays what */
    .people-head { margin-bottom: .9rem; display: grid; gap: .2rem; }
    .people { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .person { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: 1.1rem; display: grid; gap: .9rem; border-top: 6px solid var(--line); }
    .person.owes { border-top-color: var(--owe); }
    .person.gets { border-top-color: var(--owed); }
    .person header { display: flex; align-items: center; gap: .7rem; }
    .person dl { margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    .person dt { font-size: .8rem; color: var(--ink-soft); }
    .person dd { margin: 0; font-family: var(--display); font-weight: 800; font-size: 1.15rem; }
    .verdict { border-top: 2px dashed var(--line); padding-top: .8rem; display: grid; gap: .4rem; }
    .verdict p { display: flex; align-items: center; gap: .4rem; }
    .verdict span { margin-left: auto; font-family: var(--display); font-weight: 800; font-size: 1.2rem; }
    .pays { color: var(--owe); } .gets-line { color: var(--owed); font-weight: 600; } .even { color: var(--ink-soft); font-weight: 600; }
 
    @media (max-width: 860px) { .hero { grid-template-columns: 1fr; } .chart { justify-content: flex-start; } }
  `]
})
export class DashboardComponent {
  svc = inject(ExpenseService);
 
  private palette = ['#7c83ff', '#2dd4bf', '#ffb938', '#ff6b70', '#c08cf0', '#ff7ab8'];
 
  perPerson = computed(() => this.svc.members().length ? this.svc.total() / this.svc.members().length : 0);
 
  // Category slices with colour + percentage (map)
  cats = computed(() => {
    const total = this.svc.total() || 1;
    return this.svc.byCategory().map((c, i) => ({ ...c, color: this.palette[i % this.palette.length], pct: (c.total / total) * 100 }));
  });
 
  // Donut background: conic-gradient stops built from the slices
  donut = computed(() => {
    const list = this.cats();
    if (!list.length) return 'conic-gradient(rgba(255,255,255,.18) 0 100%)';
    let acc = 0;
    const stops = list.map(c => { const start = acc; acc += c.pct; return `${c.color} ${start}% ${acc}%`; });
    return `conic-gradient(${stops.join(', ')})`;
  });
 
  // Who has paid out the most (reduce, then sort)
  topPayer = computed(() => {
    const paid = new Map<string, number>();
    for (const e of this.svc.expenses()) paid.set(e.paidBy, (paid.get(e.paidBy) ?? 0) + e.amount);
    const best = [...paid.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? { name: this.svc.nameOf(best[0]), amount: best[1] } : null;
  });
 
  biggest = computed(() => [...this.svc.expenses()].sort((a, b) => b.amount - a.amount)[0] ?? null);
 
  // Per-person summary: what they paid, their own share, and who they must pay
  people = computed(() => {
    const paid = new Map<string, number>();
    const share = new Map<string, number>();
    for (const e of this.svc.expenses()) {
      paid.set(e.paidBy, (paid.get(e.paidBy) ?? 0) + e.amount);
      const each = e.amount / e.splitAmong.length;
      e.splitAmong.forEach(id => share.set(id, (share.get(id) ?? 0) + each));
    }
    return this.svc.members().map(m => {
      const p = paid.get(m.id) ?? 0, sh = share.get(m.id) ?? 0;
      return {
        member: m, paid: p, share: sh, net: p - sh,
        pays: this.svc.settlements().filter(x => x.from === m.id),
        gets: this.svc.settlements().filter(x => x.to === m.id)
      };
    });
  });
 
  fmt(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
}
 