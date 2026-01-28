# TASK 14 — Micro-interactions + Haptics (Soft Glass polish)

Implement TASK 14 only. Do not change repositories/DB schemas/streak logic.
Goal: make the app feel premium with subtle animations + haptics.

## Dependencies
Add (if not present):
- expo-haptics
- react-native-reanimated
- react-native-gesture-handler
(Expo usually already has reanimated; ensure config works.)

Optional (nice):
- react-native-reanimated (v3) + useAnimatedStyle
- expo-av (NOT required)

## Objective
Add subtle, consistent micro-interactions:
1) Haptics on key actions
2) Animated toggle feedback (scale + fade)
3) Pressable states (opacity/scale)
4) Calendar tap animation
5) Smooth screen transitions (optional, minimal)

## Haptics rules
Use `expo-haptics`:
- On marking completion (today toggle / calendar day toggle):
  - `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
- On destructive action confirm (archive/delete confirm):
  - `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)`
- On success save habit:
  - `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`

Add a helper:
- `src/utils/haptics.ts` with small wrappers:
  - `hapticTap()`, `hapticSuccess()`, `hapticWarning()`
Guard with try/catch so it never crashes.

## Animations (Reanimated)
### A) HabitCard toggle button
When user toggles today:
- Animate the toggle button:
  - scale: 1 -> 0.92 -> 1 (spring)
  - if state becomes completed: small "pop" + inner check fades in
- Keep animation lightweight:
  - Use `useSharedValue` for scale
  - `withSpring` or `withTiming` (fast: 120–180ms)
- IMPORTANT: do not re-render entire list excessively.
  - Keep animation inside component local state, triggered by press.

### B) Grid cell highlight (optional minimal)
Do NOT animate all grid cells.
Only animate **today cell** when toggled:
- quick fade-in/out or scale 0.8->1 on the today cell component only.

### C) Calendar day tap
When user taps a day:
- Animate the day cell:
  - scale down slightly on press (press-in)
  - on toggle success: small pop back + subtle glow (if active)
- Keep it local to the tapped day cell.
- Do not animate full calendar reflow.

### D) Primary buttons (Form save)
- On press: scale 0.98 (press-in), back to 1 on release
- On successful save: trigger haptic success

## Implementation details
### Components to update
- HabitCard (toggle today button)
- CalendarMonth (day cell press/toggle)
- HabitFormScreen (Save button)
- Any confirm modals (archive/delete) -> warning haptic on confirm

### Pressable pattern
Create reusable component:
- `src/components/ui/AnimatedPressable.tsx`
Features:
- Wraps Pressable
- Animates scale/opacity on press in/out (Reanimated)
- Props: `onPress`, `disabled`, `style`, `children`

Use it for:
- FAB
- Toggle button
- Primary button
- Calendar day cells

## Safety/UX constraints
- Animations must not block state updates.
- If toggle fails (unexpected), do not spam haptics.
- Keep durations short; avoid heavy shadows that cause jank.

## Definition of Done
- Toggling today triggers a light haptic + toggle button pop animation.
- Tapping a calendar day triggers a light haptic + day cell animation.
- Saving habit triggers success haptic + subtle press animation on button.
- Archive/delete confirm triggers warning haptic.
- No noticeable FPS drop when scrolling Home list.

## Output format (MANDATORY)
1) ✅ TASK 14 done
2) Files changed/added
3) How to verify
