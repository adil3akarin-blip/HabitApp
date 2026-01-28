# TASK 12 — Delete habit (permanent)

Implement TASK 12 only.

## Objective
Add permanent deletion of a habit (hard delete), including its completions and reminders.

## Requirements
### UI
- Add a destructive button **"Delete habit"** on `HabitDetailsScreen` (below Archive).
- On tap: show confirmation modal:
  - Title: "Delete habit?"
  - Text: "This will permanently delete the habit and all history. This can't be undone."
  - Buttons: "Cancel" + "Delete" (destructive)
- After successful deletion: navigate back to Home.

### Store
In `useHabitsStore` add:
- `deleteHabit(habitId: string): Promise<void>`
Behavior:
- Optimistically remove habit from `habits`
- Remove `completionsByHabitId[habitId]`
- Call repo delete
- If deletion fails: restore previous state (best-effort) and show alert.

### Repositories
In `habitsRepo` add:
- `delete(id: string): Promise<void>`

Implementation:
- Delete from `completions` where `habitId = ?`
- Delete from `habits` where `id = ?`
- Prefer a transaction if your sqlite helper supports it.

### Reminders (if TASK 11 exists)
- Before deleting habit, cancel scheduled notification(s) for that habit.
- If you store notification id in DB, read it and cancel.

## Edge cases
- If habit is already archived, delete still works.
- Ensure there are no orphan completions.

## Definition of Done
- Create habit -> mark a few days -> delete -> habit disappears from Home immediately.
- Reopen app -> habit is still gone.
- Habit details cannot be opened after deletion.
- If reminders were enabled, they stop.

## Output format (MANDATORY)
1) ✅ TASK 12 done
2) Files changed/added
3) How to verify
