# TASK 2 — SQLite infra + migrations

Implement TASK 2 only.

## Objective
Add SQLite infra and migrations that create the required tables (`habits`, `completions`) on app start.

## Requirements
1) Create:
- `src/db/sqlite.ts`: open DB + helper `execAsync(sql, params?)` and `queryAsync(sql, params?)`
- `src/db/migrations.ts`: `runMigrations()` that creates tables & constraints safely

2) Migration SQL:
- Create `habits` table (see schema below)
- Create `completions` table with UNIQUE(habitId, date)
- Create indexes:
  - `idx_completions_habitId_date` on (habitId, date)
  - `idx_habits_archivedAt` on archivedAt

3) Call `runMigrations()` before rendering main navigation.
- You may show a simple loading screen while migrations run.

## Schema
### habits
- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `description TEXT`
- `icon TEXT NOT NULL`
- `color TEXT NOT NULL`
- `goalPeriod TEXT NOT NULL`
- `goalTarget INTEGER NOT NULL`
- `archivedAt TEXT`
- `createdAt TEXT NOT NULL`

### completions
- `id TEXT PRIMARY KEY`
- `habitId TEXT NOT NULL`
- `date TEXT NOT NULL`
- `count INTEGER NOT NULL DEFAULT 1`
- `createdAt TEXT NOT NULL`
- UNIQUE(`habitId`, `date`)

## Definition of Done
- First run: tables get created without errors
- Subsequent runs: no crash, migrations are idempotent
- Log a success message (e.g., `console.log("migrations ok")`)

## Output format (MANDATORY)
1) ✅ TASK 2 done
2) Files changed/added
3) How to verify
