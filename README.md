# SplitLedger: Shared Expense Splitter (Angular)

Angular 18 standalone app. Track shared bills, see balances, and get the fewest payments needed to settle up.

## Run
```bash
npm install
npm start        # http://localhost:4200
```
Admin PIN (demo): `admin123`. Data is stored in the browser's localStorage.

## Concept map (React topic → Angular equivalent used here)
| Brief | In this project |
|---|---|
| Component-based architecture | Standalone components in `components/` and `pages/` |
| JSX syntax | Angular templates with `{{ }}`, `[prop]`, `(event)`, `@if` / `@for` |
| Props | `@Input()` and `@Output()` (e.g. `app-stat-card`, `app-expense-list`) |
| State with hooks | Signals (`signal`, `computed`, `effect`) in `expense.service.ts` |
| Array operations | `filter`, `sort`, `reduce`, `map`, `slice` for lists, balances, categories |
| Reusable UI | `app-avatar`, `app-stat-card`, `app-expense-list`, `app-balance-list`, `app-expense-form` |
| React Router | Angular Router: `app.routes.ts`, `routerLink`, `routerLinkActive` |
| Multiple styling approaches | Global SCSS tokens, component-scoped styles, `[class.x]` / `[style.width.%]` bindings |
| Responsive | Grid auto-fit layouts; sidebar becomes a top bar under 760px |

## Pages
- `/` Overview: stats, settle-up ticket, balances, latest expenses
- `/expenses` Add expense form and searchable list
- `/admin` PIN-gated: members, category breakdown, delete expenses, JSON backup, reset
