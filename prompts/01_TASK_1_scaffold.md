# TASK 1 — Scaffold + deps + navigation

You are a senior React Native dev agent. Implement TASK 1 only.

## Objective
Create the Expo + TypeScript app scaffold and navigation structure:
- Bottom tabs: **Home**, **Settings**
- Home stack: **HomeScreen**, **HabitFormScreen**, **HabitDetailsScreen**

## Requirements
1) Ensure project runs with:
   - `npx expo start`
2) Install deps:
   - `@react-navigation/native`
   - `@react-navigation/native-stack`
   - `@react-navigation/bottom-tabs`
   - `react-native-screens`
   - `react-native-safe-area-context`
   - `react-native-gesture-handler`
   - `react-native-reanimated`
   - `expo-sqlite`
   - `date-fns`
   - `zustand`
   - `@expo/vector-icons`
3) Create placeholder screens:
   - HomeScreen: show header + button **Add habit** that navigates to HabitFormScreen
   - HabitFormScreen: show placeholder title + Back works
   - HabitDetailsScreen: placeholder (takes `habitId` param but can be unused now)
   - SettingsScreen: placeholder

## File structure
Implement:
- `src/app/navigation/AppNavigator.tsx` (tabs)
- `src/app/navigation/HomeStack.tsx` (stack)
- Screens inside `src/screens/*.tsx`

## Notes
- No database work yet.
- Keep styling minimal.

## Definition of Done
- App opens on Home tab
- Tapping "Add habit" opens HabitFormScreen
- You can navigate back
- Settings tab exists

## Output format (MANDATORY)
1) ✅ TASK 1 done
2) Files changed/added
3) How to verify
