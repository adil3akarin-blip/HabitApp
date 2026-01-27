# TASK 4 — State store (Zustand) + data loading

Implement TASK 4 only.

## Objective
Create Zustand store that loads habits, loads completions into Sets, and supports toggling.

## Requirements
Create `src/state/useHabitsStore.ts` with:
State:
- `habits: Habit[]`
- `completionsByHabitId: Record<string, Set<string>>`
- `isLoading: boolean`
- `gridRangeDays: number` (set to 365 or 180)

Actions:
- `loadHabits(): Promise<void>`
- `loadCompletionsForRange(startISO, endISO): Promise<void>` // for all habits
- `refresh(): Promise<void>` // loads habits + completions
- `toggleToday(habitId): Promise<void>`
- `toggleDate(habitId, dateISO): Promise<void>`
- `createHabit(data): Promise<void>`
- `updateHabit(id, data): Promise<void>`
- `archiveHabit(id): Promise<void>`

Implementation details:
- Use `Set<string>` for each habit’s completion dates.
- After toggling, update the Set in-memory immediately.

Hook it into `HomeScreen`:
- On mount: `refresh()`

## Definition of Done
- Home loads without errors
- Toggling (via temporary UI button or later HabitCard action) updates store instantly
- Data persists across reloads

## Output format (MANDATORY)
1) ✅ TASK 4 done
2) Files changed/added
3) How to verify
