# TASK 3 — Repository layer (CRUD)

Implement TASK 3 only.

## Objective
Implement repository functions for habits and completions.

## Requirements
Create files:
- `src/db/habitsRepo.ts`
- `src/db/completionsRepo.ts`

### habitsRepo API
- `listActive(): Promise<Habit[]>` — return habits where `archivedAt IS NULL` ordered by createdAt
- `getById(id): Promise<Habit | null>`
- `create(input): Promise<Habit>` — generate id, createdAt; insert row
- `update(id, patch): Promise<void>` — update fields provided
- `archive(id): Promise<void>` — set archivedAt to now ISO

### completionsRepo API
- `listInRange(habitId, startISO, endISO): Promise<Completion[]>` — inclusive start/end
- `toggle(habitId, dateISO): Promise<void>` — insert if not exists else delete

### Domain types
Add `src/domain/models.ts`:
- `Habit`, `Completion`, `GoalPeriod`

### Helpers
Add `src/domain/dates.ts`:
- `toISODate(date: Date): string` // YYYY-MM-DD in local time
- `todayISO(): string`

## Definition of Done
- Repos compile and are used in at least one quick manual dev action:
  - Add a temporary test call in HomeScreen (DEV ONLY) that runs a create + toggle and prints results to console.
  - Remove or guard it behind a `__DEV__` flag.

## Output format (MANDATORY)
1) ✅ TASK 3 done
2) Files changed/added
3) How to verify
