# TASK 5 — HabitGrid component (GitHub-like tile chart)

Implement TASK 5 only.

## Objective
Build the core `HabitGrid` component showing 7 rows by N columns for last X days.

## Requirements
Create:
- `src/components/HabitGrid.tsx`
- `src/domain/grid.ts`

### Behavior
- Inputs:
  - `startISO: string`
  - `endISO: string`
  - `activeDates: Set<string>`
  - `color: string`
- Render:
  - 7 rows (days)
  - columns = number of weeks between start and end
  - Each cell corresponds to a date. If date in `activeDates` → active style.

### Notes
- Use local dates (`YYYY-MM-DD`) everywhere.
- Keep it fast:
  - Precompute date list once per prop change
  - Use `React.memo` where useful

Add a temporary preview in HomeScreen:
- Render a grid for a dummy habit using actual active set from store for the first habit.

## Definition of Done
- Grid appears on Home
- Toggling today for a habit makes today cell active

## Output format (MANDATORY)
1) ✅ TASK 5 done
2) Files changed/added
3) How to verify
