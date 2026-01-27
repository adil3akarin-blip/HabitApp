# TASK 7 — HabitFormScreen (Create/Edit) + icon/color pickers

Implement TASK 7 only.

## Objective
Implement Create/Edit habit form.

## Requirements
Update:
- `src/screens/HabitFormScreen.tsx`
Create:
- `src/components/IconPicker.tsx`
- `src/components/ColorPicker.tsx`

Fields:
- name (required)
- description (optional)
- icon (choose from a fixed list, 20–40)
- color (choose from palette 10–16)
- goalPeriod: day/week/month
- goalTarget: number (>=1)

Behavior:
- If route params include `habitId` -> edit mode:
  - load habit from store
  - prefill fields
- Save:
  - createHabit or updateHabit
  - navigate back

Validation:
- name required; show error

## Definition of Done
- Can create a habit and see it on Home
- Can edit habit (add an “Edit” button somewhere easy, e.g., on HabitDetails later; for now you can add a dev action on Home card long-press -> edit)
- No crashes

## Output format (MANDATORY)
1) ✅ TASK 7 done
2) Files changed/added
3) How to verify
