# HabitGrid (MVP HabitKit-like) — Windsurf Claude Opus 4.5 Prompt Pack

**Goal:** Build an MVP React Native (Expo + TypeScript) app called **HabitGrid** that replicates the *core mechanics* commonly associated with HabitKit-style apps:
- Dashboard list of habits with a **tile/grid chart** (GitHub-like contributions).
- One-tap toggle for **today**.
- Habit details screen with **monthly calendar**; tap a day to toggle completion.
- Create/Edit habit: name, description, icon, color, goal (day/week/month + target).
- Streak calculation (daily required; weekly/monthly nice-to-have).
- **Local-first** persistence (SQLite), no account/cloud.

> ⚠️ Do NOT copy any proprietary branding, text, or assets. Only implement generic mechanics.

---

## Tech stack (fixed)
- Expo + TypeScript
- Navigation: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- Storage: `expo-sqlite`
- Dates: `date-fns`
- Icons: `@expo/vector-icons`
- State: Zustand (preferred)

(Stretch) Reminders: `expo-notifications`

---

## Project rules (Claude Opus 4.5)
### Output format after each task
Claude must respond in this format:
1) ✅ **TASK N done** — 1–2 sentences what is completed
2) **Files changed/added** — bullet list of file paths
3) **How to verify** — step-by-step manual test instructions
4) **Notes/Risks** — only if needed

### Coding rules
- Use **local dates** stored as `"YYYY-MM-DD"` (never UTC for storage).
- Keep UI simple; prioritize correctness, stability, and MVP speed.
- Avoid heavy UI frameworks. Use small reusable components.
- Optimize grid rendering (use Sets and precomputed arrays).

---

## Data model (SQLite)
### `habits` table
- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `description TEXT`
- `icon TEXT NOT NULL`
- `color TEXT NOT NULL`
- `goalPeriod TEXT NOT NULL` — `"day" | "week" | "month"`
- `goalTarget INTEGER NOT NULL`
- `archivedAt TEXT` — ISO string or null
- `createdAt TEXT NOT NULL`

### `completions` table
- `id TEXT PRIMARY KEY`
- `habitId TEXT NOT NULL`
- `date TEXT NOT NULL` — `"YYYY-MM-DD"`
- `count INTEGER NOT NULL DEFAULT 1`
- `createdAt TEXT NOT NULL`
- UNIQUE(`habitId`, `date`)

Toggle rule:
- If completion exists for (habitId, date) → delete row
- Else → insert row (`count=1`)

---

## Folder structure (recommended)
```
src/
  app/navigation/
  db/
    sqlite.ts
    migrations.ts
    habitsRepo.ts
    completionsRepo.ts
  domain/
    dates.ts
    grid.ts
    streaks.ts
    models.ts
  state/
    useHabitsStore.ts
  screens/
    HomeScreen.tsx
    HabitFormScreen.tsx
    HabitDetailsScreen.tsx
    SettingsScreen.tsx
  components/
    HabitCard.tsx
    HabitGrid.tsx
    CalendarMonth.tsx
    IconPicker.tsx
    ColorPicker.tsx
```

---

## How to use this pack
1) Open `01_TASK_1_scaffold.md` and paste it into Claude in Windsurf.
2) After Claude completes the task, paste the next task prompt.
3) Do tasks strictly in order.

If Claude deviates, instruct it to:
- Re-read the task requirements.
- Fix with smallest possible diff.
- Keep the output format.
