# TASK 15 — Premium Empty States + Mini Onboarding (SQLite, Soft Glass)

Implement TASK 15 only.
Do NOT change repositories logic for habits/completions, streak rules, notifications scheduling.
Goal: Improve first-run UX with a premium onboarding and polished empty states using existing Soft Glass UI kit.
Use SQLite for persistence (no AsyncStorage).

---

## Objective
1) Add a 3-step onboarding flow (Soft Glass style) shown only once
2) Add premium empty states:
   - Home when no habits exist
   - Details hint when there are no completions for the current month
3) (Recommended) Add "Add sample habits" quick start on Home empty state

---

## Constraints / Existing Context
- Expo SDK 54, Expo Router exists but project currently has Root navigator in:
  - `src/app/navigation/AppNavigator.tsx`
- DB is expo-sqlite, migrations in `src/db/migrations.ts`
- Soft Glass primitives exist:
  - `GlassSurface`, `GlassHeader`, `GlassFab`, `Pill`, `AnimatedPressable`
- Tokens in `src/theme/tokens.ts`
- Haptics helper exists in `src/utils/haptics.ts`

Keep diffs minimal; integrate onboarding gating as close to root navigation as possible.

---

## Part A — SQLite meta storage (app_meta)
### 1) Migration
Update `src/db/migrations.ts` by ADDING a new migration step (do not rewrite older versions):
Create table `app_meta` (idempotent):
- `key TEXT PRIMARY KEY`
- `value TEXT NOT NULL`
- `updatedAt TEXT NOT NULL`

Store booleans as:
- "1" = true, "0" = false

### 2) Repo
Create: `src/db/appMetaRepo.ts`
API:
- `get(key: string): Promise<string | null>`
- `set(key: string, value: string): Promise<void>`
- `getBool(key: string): Promise<boolean>`  // true if "1"
- `setBool(key: string, value: boolean): Promise<void>`

Key used:
- `onboardingCompleted`

---

## Part B — Onboarding UI (3 steps)
### 1) Screen
Create: `src/screens/OnboardingScreen.tsx`

UI requirements (Soft Glass):
- Background: use `LinearGradient` (subtle) on whole screen
- Top: optional small "Skip" action (AnimatedPressable)
- Body: 3 pages, either:
  - Horizontal `ScrollView` with `pagingEnabled`, OR
  - Controlled step state (0..2) with animated transitions
- Each page contains:
  - Big title
  - Short subtitle (1–2 lines)
  - Minimal “illustration” using icons + gradient blob (no external assets)

Recommended copy:
1) Title: "Track habits visually"
   Subtitle: "A year-at-a-glance grid makes progress obvious."
2) Title: "Tap to log"
   Subtitle: "Mark today or any past day in the calendar."
3) Title: "Build streaks"
   Subtitle: "Set daily/weekly/monthly goals and grow consistency."

Controls:
- Step dots indicator (3 dots) near bottom
- Button row:
  - "Next" (steps 0–1)
  - "Get started" (step 2)
- Buttons must use Soft Glass style:
  - Primary: gradient accent (purple->cyan) if you already have pattern from TASK 13
  - Secondary: glass button

Haptics:
- On Next / Get started: `hapticTap()`
- On Get started (completion): `hapticSuccess()`

### 2) Completion behavior
When user taps Skip or Get started:
- `await appMetaRepo.setBool("onboardingCompleted", true)`
- Navigate to main app

---

## Part C — Onboarding gating (shown once)
Update root navigation entry to conditionally show onboarding.

Preferred integration point:
- `src/app/navigation/AppNavigator.tsx` (Root navigator with LiquidTabs)

Implementation requirements:
- On mount (or during app init), read:
  - `const completed = await appMetaRepo.getBool("onboardingCompleted")`
- While loading: show a minimal loading view (Soft Glass background + spinner)
- If not completed:
  - render `OnboardingScreen`
- Else:
  - render existing tabs navigator

Important:
- Do not break existing navigation (Home/Settings stacks).
- Keep logic minimal: one boolean + loading.

(Testing convenience, optional):
- Add a Settings button "Reset onboarding" that sets the flag to false.

---

## Part D — Premium empty states
### 1) Home empty state
Update `src/screens/HomeScreen.tsx`:
If `habits.length === 0`:
- Render a centered premium empty state:
  - `GlassSurface` card
  - Title: "No habits yet"
  - Subtitle: "Create your first habit in seconds."
  - Primary button: "Create habit" -> navigate to HabitFormScreen
  - Secondary button (recommended): "Add sample habits" -> seeds sample habits

Keep Soft Glass style:
- Use tokens for text colors
- Use AnimatedPressable for buttons
- Optional icon at top inside a small glass circle

### 2) Details hint empty state
Update `src/screens/HabitDetailsScreen.tsx`:
If there are 0 completions in the currently visible month:
- Under calendar, show a small muted hint:
  - "Tip: Tap a day to mark it done."

---

## Part E — Sample habits seeding (recommended)
Add to `src/state/useHabitsStore.ts`:
- `seedSampleHabits(): Promise<void>`

Behavior:
- Only intended for empty state (no habits)
- Create 3 sample habits quickly, then `refresh()`

Samples:
1) Name: "Drink Water"
   Icon: pick your existing icon keys (e.g. Ionicons "water" or similar)
   Color: use tokens accentB or a pleasant cyan
   Goal: day, target 1
2) Name: "Workout"
   Icon: "barbell" / "fitness"
   Color: accentA
   Goal: week, target 3
3) Name: "Read"
   Icon: "book"
   Color: a neutral/pleasant (or reuse accent mix)
   Goal: month, target 20

UX:
- Disable the button while seeding
- Use `hapticSuccess()` after seeding

Note:
- Do not add new DB schema fields here.
- Use existing `createHabit` flow if available, or call repos directly inside store.

---

## Definition of Done
- Fresh install (or after "Reset onboarding"):
  - Onboarding screen appears BEFORE main tabs
  - Skip/Get started saves SQLite flag and opens app
- Restart app:
  - Onboarding does NOT show again
- Home with no habits:
  - Premium empty state card appears
  - Create habit navigates to HabitForm
- If "Add sample habits" implemented:
  - Tap adds 3 habits and returns to normal Home list immediately
  - Restart app: habits persist
- HabitDetails:
  - When month has no completions, hint is shown

---

## Output format (MANDATORY)
1) ✅ TASK 15 done — 1–2 sentences
2) Files changed/added — bullet list with paths
3) How to verify — step-by-step
4) Notes/Risks — only if needed
