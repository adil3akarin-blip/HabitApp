# HabitGrid — Current Context

## Технологии проекта

### Core
- **React Native** + **Expo SDK 54**
- **TypeScript**
- **Expo Router** (file-based routing)

### Navigation
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `LiquidTabs` — кастомный glass tab bar

### State Management
- **Zustand** — глобальный стейт для habits и completions

### Database
- **expo-sqlite** — локальная SQLite база
- Миграции через `src/db/migrations.ts`

### UI/Styling
- `expo-blur` — BlurView для glass эффектов
- `expo-linear-gradient` — градиенты
- `react-native-reanimated` — анимации
- `react-native-gesture-handler` — жесты
- `react-native-safe-area-context` — safe area
- Кастомные UI примитивы: GlassSurface, GlassHeader, Pill, AnimatedPressable

### Notifications
- `expo-notifications` — локальные напоминания

### Haptics
- `expo-haptics` — тактильная обратная связь

### Date Utilities
- `date-fns`

---

## Выполненные задачи

### TASK 0 — Overview
Определение целей проекта, технологий, правил и структуры папок.

### TASK 1 — Scaffold
- Создание Expo + TypeScript проекта
- Настройка навигации (Tab Navigator + Stack)
- Placeholder экраны: Home, Settings, HabitDetails, HabitForm

### TASK 2 — SQLite & Migrations
- Настройка expo-sqlite
- Создание таблиц `habits` и `completions`
- Система миграций с версионированием

### TASK 3 — Repositories
- `src/db/habitsRepo.ts` — CRUD для habits (create, update, list, listArchived, getById, archive)
- `src/db/completionsRepo.ts` — toggle, getRange для completions

### TASK 4 — Zustand Store
- `src/state/useHabitsStore.ts`
- Actions: refresh, toggleToday, toggleDate, archiveHabit, createHabit, updateHabit
- Computed: completionsByHabitId, gridRangeDays

### TASK 5 — HabitGrid Component
- `src/components/HabitGrid.tsx`
- GitHub-style contribution grid
- Props: startISO, endISO, activeDates, color, cellSize, cellGap

### TASK 6 — HomeScreen + HabitCard
- `src/screens/HomeScreen.tsx` — список привычек с FlatList
- `src/components/HabitCard.tsx` — карточка с иконкой, названием, toggle кнопкой и HabitGrid

### TASK 7 — HabitFormScreen
- `src/screens/HabitFormScreen.tsx`
- Форма создания/редактирования привычки
- IconPicker, ColorPicker
- Выбор goal period (daily/weekly/monthly) и target

### TASK 8 — HabitDetailsScreen + CalendarMonth
- `src/screens/HabitDetailsScreen.tsx` — детали привычки
- `src/components/CalendarMonth.tsx` — месячный календарь с toggle дней
- Навигация по месяцам

### TASK 9 — Streaks
- `src/domain/streaks.ts`
- computeStreak() — текущий streak
- computeLongestStreak() — лучший streak
- Поддержка daily/weekly/monthly goals

### TASK 10 — Settings + Archive
- `src/screens/SettingsScreen.tsx` — минимальные настройки
- Кнопка Archive на HabitDetailsScreen
- Архивированные привычки скрыты из Home

### TASK 11 — Reminders (Stretch)
- `src/domain/notifications.ts` — scheduleHabitReminder, cancelHabitReminder
- Поля reminderEnabled, reminderTime, reminderNotifId в модели Habit
- UI для включения/настройки напоминаний в HabitFormScreen

### TASK 12 — Delete Habit
- Кнопка Delete на HabitDetailsScreen
- deleteHabit action в store
- Удаление из БД с каскадным удалением completions
- Отмена напоминания при удалении

### TASK 13 — Soft Glass UI
- `src/theme/tokens.ts` — цвета, радиусы, тени, типографика
- UI примитивы: GlassSurface, GlassHeader, GlassFab, Pill
- Обновление всех экранов с glass дизайном
- Тёмная тема (#070A12 фон)
- Градиентные акценты (purple → cyan)

### TASK 14 — Micro-interactions + Haptics
- `src/utils/haptics.ts` — hapticTap, hapticSuccess, hapticWarning
- `src/components/ui/AnimatedPressable.tsx` — анимированная кнопка
- Анимация toggle кнопки на HabitCard (scale pop)
- Анимация дней в CalendarMonth
- Haptics на toggle, save, archive/delete

---

## Структура проекта

```
src/
├── app/
│   └── navigation/
│       ├── AppNavigator.tsx    # Root navigator с LiquidTabs
│       └── HomeStack.tsx       # Stack для Home flow
├── components/
│   ├── ui/
│   │   ├── GlassSurface.tsx
│   │   ├── GlassHeader.tsx
│   │   ├── GlassFab.tsx
│   │   ├── Pill.tsx
│   │   └── AnimatedPressable.tsx
│   ├── HabitCard.tsx
│   ├── HabitGrid.tsx
│   ├── CalendarMonth.tsx
│   ├── IconPicker.tsx
│   ├── ColorPicker.tsx
│   └── LiquidTabs.tsx
├── db/
│   ├── database.ts
│   ├── migrations.ts
│   ├── habitsRepo.ts
│   └── completionsRepo.ts
├── domain/
│   ├── models.ts
│   ├── dates.ts
│   ├── streaks.ts
│   └── notifications.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── HabitDetailsScreen.tsx
│   ├── HabitFormScreen.tsx
│   └── SettingsScreen.tsx
├── state/
│   └── useHabitsStore.ts
├── theme/
│   └── tokens.ts
└── utils/
    └── haptics.ts
```
