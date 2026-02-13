# TASK 17 — Delete habit must also cancel reminders (hard delete cleanup)

Implement TASK 17 only.
Do NOT change DB schemas unless absolutely required.
Goal: Ensure that when a habit is permanently deleted, all scheduled reminders for it are cancelled.

---

## Context / Assumptions
- Reminders were implemented in TASK 11 using `expo-notifications`.
- There is currently a way to schedule/cancel notifications per habit.
- Habit deletion exists (TASK 12) or equivalent hard delete flow.
- We must ensure **no orphan scheduled notifications** remain after deleting a habit.

---

## Objective
When user deletes a habit:
1) Cancel all scheduled reminder notifications associated with that habit
2) Then delete completions + habit record
3) UI updates immediately as before

---

## Requirements

### A) Centralize reminder scheduling / cancellation
Create (or update) a single module to own reminder operations:
- `src/notifications/reminders.ts`

Expose functions:
- `scheduleHabitReminder(habit: Habit): Promise<string | null>`
  - returns notificationId if scheduled, else null
- `cancelHabitReminder(notificationId: string): Promise<void>`
- `cancelAllHabitReminders(habitId: string): Promise<void>`

Implementation notes:
- `cancelHabitReminder(id)` should call:
  - `Notifications.cancelScheduledNotificationAsync(id)` inside try/catch
- `cancelAllHabitReminders(habitId)` must cancel:
  - the stored reminder id for that habit (preferred)
  - AND any other ids if your implementation stored multiple ids (if applicable)

### B) Identify which notification(s) belong to a habit
Preferred approach (no schema change):
1) If your code already stores the notification id somewhere (habit row or app_meta):
   - Read it via existing repo/store and cancel it.
2) If notificationId is NOT stored anywhere:
   - Add minimal persistence WITHOUT schema change if possible:
     - Use `app_meta` keys like `reminder:<habitId>` -> `<notificationId>`
     - Store when scheduling; remove when canceling/deleting.
   - Only if app_meta does not exist, create it (but likely you already added in TASK 15).

Rules:
- Do NOT add a new column to `habits` unless there is no other practical option.
- If using app_meta:
  - key format: `reminder:${habitId}`
  - value: `<notificationId>`

### C) Hook into delete flow
Update deletion pipeline in BOTH places:
1) Store action `deleteHabit(habitId)` (or equivalent)
2) Repo delete (if it performs deletion independently)

Required order inside store action:
1) Optimistic UI removal (existing behavior)
2) Call `cancelAllHabitReminders(habitId)` (await)
3) Call repos to delete completions + habit (await)
4) Cleanup reminder mapping (remove app_meta key if used)

If cancellation fails:
- Continue with delete anyway (best effort).
- Log warning but do not block deletion.

### D) Also cleanup on Archive (optional)
If your reminders should stop when habit archived:
- When archiving: cancel reminders too (best practice)
This is optional unless you already intended that behavior.

---

## Definition of Done
- Create a habit with reminder enabled, verify a scheduled notification exists (best on device).
- Delete the habit:
  - Habit disappears from Home immediately
  - Notification is cancelled (no reminder triggers later)
  - Restart app: habit still deleted, no reminder mapping remains in app_meta
- No crashes if reminder permissions were denied.

---

## Output format (MANDATORY)
1) ✅ TASK 17 done — 1–2 sentences
2) Files changed/added — bullet list with paths
3) How to verify — step-by-step manual test
4) Notes/Risks — only if needed
