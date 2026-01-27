# TASK 9 — Streaks logic (daily required; weekly/monthly optional)

Implement TASK 9 only.

## Objective
Compute streak count based on habit goal configuration.

## Requirements
Create:
- `src/domain/streaks.ts`

API:
- `computeStreak(habit: Habit, activeDates: Set<string>, todayISO: string): number`

Rules:
- day:
  - streak = number of consecutive days ending at today where completion exists.
- week:
  - streak = consecutive ISO weeks where completions count >= goalTarget.
- month:
  - streak = consecutive months where completions count >= goalTarget.

Use `date-fns` helpers and local date math.
Show streak in `HabitDetailsScreen`.

## Definition of Done
- Daily streak behaves correctly when toggling today/yesterday
- If weekly/monthly implemented, behaves for simple test cases

## Output format (MANDATORY)
1) ✅ TASK 9 done
2) Files changed/added
3) How to verify
