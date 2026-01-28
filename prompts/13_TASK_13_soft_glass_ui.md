# TASK 13 — Soft Glass UI Refresh (unique design)

Implement TASK 13 only. Do not change business logic, DB, streaks, repositories.
Goal: update UI to a consistent "Soft Glass" design system with minimal diffs.

## Objective
Introduce a small theme + 4 UI primitives (GlassSurface, GlassHeader, GlassFab, Pill)
and restyle Home + HabitCard + Details + Form to match Soft Glass.

## Dependencies
Add (if not present):
- expo-blur
- expo-linear-gradient
Optional (nice): expo-haptics

## Theme tokens
Create:
- `src/theme/tokens.ts` exporting colors, radii, spacing, typography.

Use these tokens (exact values):
Background:
- bg: "#070A12"
- text: "rgba(255,255,255,0.92)"
- textMuted: "rgba(255,255,255,0.65)"
- textFaint: "rgba(255,255,255,0.45)"

Glass:
- glass: "rgba(255,255,255,0.06)"
- glassStrong: "rgba(255,255,255,0.10)"
- border: "rgba(255,255,255,0.12)"

Accents:
- accentA: "#7C3AED"
- accentB: "#22D3EE"
- danger: "#FB7185"

Radii:
- card: 14
- modal: 20
- pill: 999

Shadow preset (use on cards, light):
- shadowColor: "#000"
- shadowOpacity: 0.25
- shadowRadius: 16
- shadowOffset: { width: 0, height: 8 }
- elevation: 6 (android)

## UI primitives
Create:
1) `src/components/ui/GlassSurface.tsx`
- A View container with:
  - backgroundColor: tokens.glass
  - borderColor: tokens.border, borderWidth: 1
  - borderRadius: tokens.radii.card
  - soft shadow preset
- IMPORTANT: no BlurView here (performance for FlatList)

2) `src/components/ui/GlassHeader.tsx`
- Use `BlurView` for a top header container (safe area)
- overlay a subtle LinearGradient (optional) for character
- Should host title + optional right action slot

3) `src/components/ui/GlassFab.tsx`
- Circular FAB with LinearGradient from accentA->accentB
- subtle glow (shadow) and plus icon
- Used on Home as main "Add habit" action (replace top-right plus if you currently have it)

4) `src/components/ui/Pill.tsx`
- Small rounded container for streak/goal
- background: tokens.glassStrong, border tokens.border, text tokens.textMuted

## Screen changes (minimal)
### HomeScreen
- Use a background (either solid bg or subtle LinearGradient)
- Add GlassHeader with title (e.g., "Habits") and an optional summary line:
  - "X/Y done today" (use store info; if too much, placeholder ok)
- Place GlassFab bottom-right (position absolute) to navigate to HabitFormScreen
- Keep tabs as is.

### HabitCard
- Wrap card in GlassSurface
- Layout:
  - left: Icon in small glass circle (Glass icon badge)
  - center: name + optional description (muted)
  - right: round toggle button (glass circle). If completed today:
    - fill with habit color + subtle glow
- Grid:
  - inactive cells should be faint glass: rgba white 0.08
  - active cells: habit color
  - keep sizes same; only restyle colors/border radius slightly

### HabitDetailsScreen
- Use GlassHeader (with back)
- Show streak + goal as Pills
- Calendar container in GlassSurface
- Add Archive/Delete buttons as glass buttons (do not implement delete here if already TASK 12 exists separately)

### HabitFormScreen
- Inputs inside GlassSurface blocks
- Buttons: primary with gradient (accentA->accentB), secondary glass

## Performance constraints
- Do NOT use BlurView inside FlatList items.
- Blur only for header / modal overlays.

## Definition of Done
- App has consistent Soft Glass look across Home, HabitCard, Details, Form.
- Scroll Home list remains smooth (no blur per item).
- No changes to data logic; all features still work.

## Output format (MANDATORY)
1) ✅ TASK 13 done
2) Files changed/added
3) How to verify
