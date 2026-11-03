import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <nav class="nav" aria-label="Main">
        <a class="logo" routerLink="/">Split<span>Ledger</span></a>
        <div class="links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Overview</a>
          <a routerLink="/expenses" routerLinkActive="active">Expenses</a>
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
        </div>
      </nav>
      <main class="main"><router-outlet /></main>
    </div>
  `,
  // Approach 2: component-scoped styles
  styles: [`
    .shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
    .nav { background: var(--ink); color: #fff; padding: 1.75rem 1.25rem; position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 2rem; }
    .logo { font-family: var(--display); font-weight: 800; font-size: 1.5rem; color: #fff; text-decoration: none; span { color: var(--amber); } }
    .links { display: grid; gap: .35rem; }
    .links a { color: #c9ccf2; text-decoration: none; padding: .65rem .9rem; border-radius: 12px; font-weight: 500; }
    .links a:hover { background: rgba(255,255,255,.08); }
    .links a.active { background: #fff; color: var(--ink); font-weight: 600; }
    .main { padding: 2rem clamp(1rem, 4vw, 3rem) 4rem; max-width: 1100px; width: 100%; }
    @media (max-width: 760px) {
      .shell { grid-template-columns: 1fr; }
      .nav { height: auto; position: sticky; top: 0; z-index: 5; flex-direction: row; align-items: center; justify-content: space-between; padding: .75rem 1rem; gap: 1rem; }
      .links { display: flex; }
      .links a { padding: .45rem .7rem; font-size: .9rem; }
    }
  `]
})
export class AppComponent {}
