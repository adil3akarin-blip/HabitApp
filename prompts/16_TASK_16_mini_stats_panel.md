# TASK 16 — Today Stats Mini-Panel (X/Y today + Longest streak) — Soft Glass

Implement TASK 16 only.
Do NOT change DB schema, repositories, streak logic (except reusing existing computeStreak), notifications.
Goal: Make Home feel “premium” by adding a compact stats panel that updates instantly.

---

## Objective
On Home screen (when habits exist), add a **Soft Glass stats panel** showing:
1) **Today progress**: `doneToday / totalHabits` + percentage + small progress bar
2) **Longest streak** among active habits (number + label)
3) (Optional) Show a small “Best today” habit name or “0 done” hint (keep minimal)

Must update immediately when user toggles today or calendar days.

---

## Constraints / Existing Context
- Soft Glass UI kit exists: `GlassSurface`, `GlassHeader`, `Pill`, `AnimatedPressable`, tokens in `src/theme/tokens.ts`
- Store: `useHabitsStore` contains `habits` + `completionsByHabitId: Record<string, Set<string>>`
- Dates helper exists: `todayISO()` / `toISODate()`
- Streak function exists: `computeStreak(habit, activeDates, todayISO)`
- Avoid heavy computations over 365 days; use O(#habits).

---

## Requirements

### A) Derived metrics (no DB writes)
Create:
- `src/domain/stats.ts`

Export:
- `type HomeStats = { total: number; doneToday: number; percent: number; longestStreak: number; }`
- `computeHomeStats(params): HomeStats`

Inputs (choose one approach):
1) `habits: Habit[]`, `completionsByHabitId: Record<string, Set<string>>`, `todayISO: string`
2) plus `computeStreak` usage

Rules:
- `total = habits.length` (only active habits already shown on Home)
- `doneToday = count of habits where completionsByHabitId[habit.id] has todayISO`
- `percent = total === 0 ? 0 : Math.round((doneToday / total) * 100)`
- `longestStreak = max over habits: computeStreak(habit, activeDatesSet, todayISO)`
  - if no habits: 0

Performance:
- Use simple loops, no sorting required.
- Must handle missing set for a habit (treat as empty).

### B) UI component
Create:
- `src/components/TodayStatsCard.tsx`

Props:
- `stats: HomeStats`
- optional: `subtitle?: string` (can be omitted)

Design (Soft Glass):
- Wrap in `GlassSurface`
- Top row: "Today" title + `Pill` showing `"done/total"`
- Middle: large percent text (e.g., `75%`) + muted label (“completed”)
- Bottom: progress bar
  - Track: glassStrong with border
  - Fill: gradient accentA -> accentB (use LinearGradient)
  - Fill width = percent%
- Right/secondary area: `Pill` showing `Longest streak: N` (or "Longest: N")

Optional micro interaction:
- When percent changes, animate progress bar width:
  - If Reanimated already used: `withTiming` 180ms
  - Otherwise plain width update is fine

### C) Home integration
Update `src/screens/HomeScreen.tsx`:
- If habits list is empty -> keep existing premium empty state (TASK 15).
- Else render:
  - `GlassHeader`
  - Then `TodayStatsCard` above the FlatList (or as ListHeaderComponent).

Compute stats in a stable way:
- Use `useMemo`:
  - dependencies: `habits`, `completionsByHabitId`, `todayISO`
- OR add a selector/helper in store (but do not overcomplicate).

The stats panel must update immediately when:
- User toggles today on any HabitCard
- User toggles a day in Calendar (if it affects today, then today count changes)

### D) Visual polish
- Ensure spacing matches your tokens (16–20)
- Use muted text for labels
- Keep card height compact (not more than ~120–150px)
- Should not cause FlatList performance issues

---

## Definition of Done
- With 3 habits, if 1 is done today → panel shows `1/3`, `33%`, progress bar matches.
- Toggling today on a habit instantly updates `doneToday`, percent, and bar (no refresh required).
- Longest streak pill shows correct max streak (daily/weekly/monthly based on existing computeStreak).
- Home scroll remains smooth.

---

## Output format (MANDATORY)
1) ✅ TASK 16 done — 1–2 sentences
2) Files changed/added — bullet list with paths
3) How to verify — step-by-step manual test
4) Notes/Risks — only if needed
