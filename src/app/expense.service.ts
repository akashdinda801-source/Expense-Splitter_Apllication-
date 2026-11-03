import { Injectable, computed, effect, signal } from '@angular/core';
import { CATEGORIES, Expense, Member, PALETTE, Settlement } from './models';

const uid = () => Math.random().toString(36).slice(2, 10);
const today = (back = 0) => new Date(Date.now() - back * 864e5).toISOString().slice(0, 10);

function demoMembers(): Member[] {
  return ['Arjun', 'Priya', 'Rahul', 'Sneha'].map((name, i) => ({ id: uid(), name, color: PALETTE[i] }));
}
function demoExpenses(m: Member[]): Expense[] {
  const all = m.map(x => x.id);
  return [
    { id: uid(), title: 'Darjeeling homestay', amount: 8400, paidBy: m[0].id, splitAmong: all, category: 'Stay', date: today(6) },
    { id: uid(), title: 'Cab from NJP', amount: 2200, paidBy: m[1].id, splitAmong: all, category: 'Travel', date: today(5) },
    { id: uid(), title: 'Momos and thukpa', amount: 1180, paidBy: m[2].id, splitAmong: [m[0].id, m[2].id, m[3].id], category: 'Food', date: today(4) },
    { id: uid(), title: 'Toy train tickets', amount: 1600, paidBy: m[3].id, splitAmong: all, category: 'Fun', date: today(3) },
    { id: uid(), title: 'Wi-Fi recharge', amount: 599, paidBy: m[1].id, splitAmong: [m[0].id, m[1].id], category: 'Bills', date: today(1) }
  ];
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  readonly members = signal<Member[]>([]);
  readonly expenses = signal<Expense[]>([]);
  readonly isAdmin = signal(false);

  constructor() {
    this.members.set(this.load<Member[]>('es.members', []));
    this.expenses.set(this.load<Expense[]>('es.expenses', []));
    if (!this.members().length) this.loadDemo();
    effect(() => localStorage.setItem('es.members', JSON.stringify(this.members())));
    effect(() => localStorage.setItem('es.expenses', JSON.stringify(this.expenses())));
  }

  readonly total = computed(() => this.expenses().reduce((s, e) => s + e.amount, 0));

  readonly balances = computed(() => {
    const net = new Map<string, number>(this.members().map(m => [m.id, 0]));
    for (const e of this.expenses()) {
      const share = e.amount / e.splitAmong.length;
      net.set(e.paidBy, (net.get(e.paidBy) ?? 0) + e.amount);
      e.splitAmong.forEach(id => net.set(id, (net.get(id) ?? 0) - share));
    }
    return this.members().map(m => ({ member: m, net: Math.round((net.get(m.id) ?? 0) * 100) / 100 }));
  });

  /** Greedy settle-up: fewest payments that clear every balance. */
  readonly settlements = computed<Settlement[]>(() => {
    const owes = this.balances().filter(b => b.net < -0.01).map(b => ({ id: b.member.id, v: -b.net })).sort((a, b) => b.v - a.v);
    const gets = this.balances().filter(b => b.net > 0.01).map(b => ({ id: b.member.id, v: b.net })).sort((a, b) => b.v - a.v);
    const out: Settlement[] = [];
    let i = 0, j = 0;
    while (i < owes.length && j < gets.length) {
      const pay = Math.min(owes[i].v, gets[j].v);
      out.push({ from: owes[i].id, to: gets[j].id, amount: Math.round(pay * 100) / 100 });
      owes[i].v -= pay; gets[j].v -= pay;
      if (owes[i].v < 0.01) i++;
      if (gets[j].v < 0.01) j++;
    }
    return out;
  });

  readonly byCategory = computed(() =>
    CATEGORIES.map(c => ({ category: c, total: this.expenses().filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) }))
      .filter(x => x.total > 0).sort((a, b) => b.total - a.total));

  member(id: string) { return this.members().find(m => m.id === id); }
  nameOf(id: string) { return this.member(id)?.name ?? 'Removed member'; }

  addExpense(e: Omit<Expense, 'id' | 'date'>) {
    this.expenses.update(list => [{ ...e, id: uid(), date: today() }, ...list]);
  }
  removeExpense(id: string) { this.expenses.update(list => list.filter(e => e.id !== id)); }

  addMember(name: string) {
    const color = PALETTE[this.members().length % PALETTE.length];
    this.members.update(list => [...list, { id: uid(), name: name.trim(), color }]);
  }
  /** A member who appears in any expense can't be removed (keeps balances correct). */
  removeMember(id: string): boolean {
    if (this.expenses().some(e => e.paidBy === id || e.splitAmong.includes(id))) return false;
    this.members.update(list => list.filter(m => m.id !== id));
    return true;
  }

  loadDemo() {
    const m = demoMembers();
    this.members.set(m);
    this.expenses.set(demoExpenses(m));
  }
  clearAll() { this.expenses.set([]); }

  exportJson() {
    return JSON.stringify({ members: this.members(), expenses: this.expenses() }, null, 2);
  }

  private load<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; }
  }
}
