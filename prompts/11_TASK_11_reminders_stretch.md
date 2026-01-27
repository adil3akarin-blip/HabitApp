# TASK 11 (Stretch) — Reminders with expo-notifications

Implement TASK 11 only (optional / stretch).

## Objective
Enable per-habit reminders.

## Requirements
- Add fields to habit form:
  - reminderEnabled
  - reminderTime "HH:mm"
- When enabled:
  - request permissions
  - schedule daily local notification at the given time
- When disabled or time changed:
  - cancel previous schedule and reschedule

Notes:
- For MVP, it’s acceptable to store scheduled notification ids in SQLite (e.g., add `reminderNotifId TEXT` to habits).
- Keep implementation simple and stable.

## Definition of Done
- On real device, notifications trigger at set time (best-effort)

## Output format (MANDATORY)
1) ✅ TASK 11 done
2) Files changed/added
3) How to verify
