# TASK 6 — HomeScreen + HabitCard list

Implement TASK 6 only.

## Objective
Create habit list UI: HabitCard with icon/name/desc, toggle-today button, and HabitGrid.

## Requirements
Create:
- `src/components/HabitCard.tsx`

Update `src/screens/HomeScreen.tsx`:
- Use FlatList of `habits`
- For each habit:
  - HabitCard shows:
    - icon + name
    - optional description
    - today toggle button (calls `toggleToday`)
    - HabitGrid for last `gridRangeDays`

Tap card navigates to HabitDetailsScreen with `habitId`.

Empty state:
- Text “No habits yet”
- Button “Create habit” -> HabitFormScreen

## Definition of Done
- Habit list renders
- Toggle today works per card
- Tap card opens HabitDetails screen

## Output format (MANDATORY)
1) ✅ TASK 6 done
2) Files changed/added
3) How to verify
