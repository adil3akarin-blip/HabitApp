# TASK 18 — Goal Progress Logic on HabitDetailsScreen

Implement TASK 18 only.
Do NOT change DB schemas.
Goal: Make `goalPeriod` and `goalTarget` visible and meaningful on the HabitDetailsScreen so the user understands their progress toward the current period's goal.

---

## Context / Assumptions
- Each habit has `goalPeriod: 'day' | 'week' | 'month'` and `goalTarget: number`.
- Completions are stored as individual dates (one per day).
- Streaks already use `goalPeriod` + `goalTarget` (see `src/domain/streaks.ts`).
- The HabitDetailsScreen currently shows: streak, best, total pills + a calendar.
- **Nothing currently tells the user how many completions they need THIS period** or how close they are.

---

## Objective
Add a **Goal Progress** section to HabitDetailsScreen that:
1. Shows the current period's progress (e.g., "3/5 this week")
2. Visually indicates completion percentage (progress bar or ring)
3. Adapts label and date range based on `goalPeriod`

---

## Requirements

### A) Compute current period progress
Create a pure helper function in `src/domain/goals.ts`:

```ts
interface GoalProgress {
  done: number;        // completions in current period
  target: number;      // goalTarget
  periodLabel: string; // "today" | "this week" | "this month"
  isComplete: boolean; // done >= target
}

function computeGoalProgress(
  habit: Habit,
  completions: Set<string>,
  todayISO: string,
): GoalProgress
```

Logic per `goalPeriod`:

| goalPeriod | Date range to count | periodLabel | Example |
|---|---|---|---|
| `'day'` | Only `todayISO` | `"today"` | 1/1 today |
| `'week'` | `startOfWeek(today)` → `endOfWeek(today)` (Sunday start) | `"this week"` | 3/5 this week |
| `'month'` | `startOfMonth(today)` → `endOfMonth(today)` | `"this month"` | 12/20 this month |

Count = number of dates in `completions` that fall within the range.

### B) Display on HabitDetailsScreen
Add a **Goal Progress card** between the pills row and the calendar section.

Layout (inside a `GlassSurface`):
```
┌─────────────────────────────────────┐
│  Goal: 5× per week                 │
│                                     │
│  ████████████░░░░░░░░  3/5          │
│                                     │
│  3 done this week                   │
└─────────────────────────────────────┘
```

Elements:
1. **Goal label** (top): `"Goal: {target}× per {period}"` — muted text
   - `day` → "Goal: {target}× per day"
   - `week` → "Goal: {target}× per week"
   - `month` → "Goal: {target}× per month"
   - If `target === 1` and `period === 'day'`, simplify to "Goal: daily"
2. **Progress bar** (middle):
   - Track: `colors.glassStrong` with `colors.border` border
   - Fill: `habit.color`, width = `min(done/target, 1) * 100%`
   - Animate width changes with `withTiming` (200ms)
   - Height: 8px, borderRadius: 4px
   - Right of bar: `"{done}/{target}"` text
3. **Status text** (bottom): `"{done} done {periodLabel}"` — muted
   - If `isComplete`: show `"✓ Goal reached!"` in `habit.color` instead

### C) Reactivity
- Progress must update **immediately** when user toggles a date in the calendar
- Use `useMemo` with dependencies: `habit`, `completions`, `todayISO`
- The progress bar fill should animate smoothly on change

### D) Edge cases
- `goalTarget = 1` + `goalPeriod = 'day'`:
  - Progress is binary (0/1 or 1/1)
  - When complete, show checkmark state
- `done > target`:
  - Bar fills to 100%, text shows actual count (e.g., "7/5")
  - Status: "✓ Goal reached! (+2 bonus)"
- New habit with 0 completions:
  - Bar empty, "0/{target} {periodLabel}"

### E) Style guidelines
- Use existing design tokens (`colors`, `radii`, `spacing` from `tokens.ts`)
- Match the Warm Ink aesthetic (warm charcoal, amber accents, editorial type)
- Progress bar fill color = `habit.color` (each habit's own color)
- Keep card compact — no taller than ~80px
- Use `GlassSurface` wrapper for consistency with calendar section

---

## Files to create/modify
1. **Create** `src/domain/goals.ts` — `computeGoalProgress` function
2. **Modify** `src/screens/HabitDetailsScreen.tsx` — add goal progress card

---

## Definition of Done
- Habit with `goalPeriod: 'week'`, `goalTarget: 3`:
  - Shows "Goal: 3× per week"
  - With 2 completions this week → bar at 66%, "2/3", "2 done this week"
  - Toggle today on → bar animates to 100%, "3/3", "✓ Goal reached!"
- Habit with `goalPeriod: 'day'`, `goalTarget: 1`:
  - Shows "Goal: daily"
  - Not done today → "0/1 today"
  - Done today → "✓ Goal reached!"
- Habit with `goalPeriod: 'month'`, `goalTarget: 20`:
  - Shows "Goal: 20× per month"
  - Correct count of completions within current calendar month
- Progress updates instantly when toggling dates in the calendar
- No layout shift or performance issues

---

## Output format (MANDATORY)
1) ✅ TASK 18 done — 1–2 sentences
2) Files changed/added — bullet list with paths
3) How to verify — step-by-step manual test
4) Notes/Risks — only if needed
