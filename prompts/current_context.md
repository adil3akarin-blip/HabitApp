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

### Backup / Data
- `expo-file-system` — чтение/запись файлов (SDK 54 class API: File, Paths)
- `expo-sharing` — share sheet для экспорта
- `expo-document-picker` — выбор файла для импорта

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

### TASK 15–18 — Warm Ink Animations + Streak Fixes
- `src/motion/tokens.ts` — централизованные motion tokens (durations, springs, easing)
- `src/motion/primitives.ts` — reusable animation helpers (enterFadeUp, enterSpring, staggerDelay)
- `src/motion/useReducedMotion.ts` — хук для Reduce Motion accessibility
- `src/components/AnimatedListItem.tsx` — staggered fade-slide-up для FlatList items
- `src/components/AnimatedSection.tsx` — staggered entrance для секций экранов
- Анимации на всех экранах: HomeScreen, HabitDetailsScreen, HabitFormScreen, SettingsScreen, OnboardingScreen
- GlassHeader — fade-slide entrance для title/subtitle
- HabitCard — ink-drop toggle animation с celebration pulse, animated fill height
- OnboardingScreen — animated dot indicator с spring-based position
- Streaks считаются только для полностью выполненных дней (multi-target habits)
- Fix: "Rendered fewer hooks" — все hooks выше early return в HabitDetailsScreen
- Fix: reactCompiler отключён в app.json (вызывал hook count mismatch)

### TASK 19 — Import/Export Data
- `src/domain/backup.ts` — BackupV1 тип + validateBackup() валидация
- `src/db/backupRepo.ts` — exportBackup() и importBackupReplace() с транзакцией
- `src/data/backupFile.ts` — writeBackupToFile(), shareFile(), pickBackupFile(), readBackupFromFile()
- Формат: `.habitgrid.json` с версионированным envelope (schemaVersion: 1)
- Export: все habits + completions → JSON → share sheet
- Import: DocumentPicker → валидация → confirm dialog → replace data → reschedule reminders
- SettingsScreen обновлён: кнопки Export/Import с loading state, haptics, error handling
- Orphan completions (missing habitId) пропускаются при импорте

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
│   ├── LiquidTabs.tsx
│   ├── AnimatedListItem.tsx    # Staggered list item entrance
│   └── AnimatedSection.tsx     # Staggered section entrance
├── data/
│   └── backupFile.ts         # File IO, share, pick для backup
├── db/
│   ├── sqlite.ts
│   ├── migrations.ts
│   ├── habitsRepo.ts
│   ├── completionsRepo.ts
│   ├── appMetaRepo.ts
│   └── backupRepo.ts          # Export/Import DB operations
├── domain/
│   ├── models.ts
│   ├── dates.ts
│   ├── streaks.ts
│   ├── notifications.ts
│   └── backup.ts              # BackupV1 type + validation
├── motion/
│   ├── tokens.ts              # Duration, spring, easing tokens
│   ├── primitives.ts           # Reusable animation helpers
│   └── useReducedMotion.ts     # Accessibility-aware motion hook
├── screens/
│   ├── HomeScreen.tsx
│   ├── HabitDetailsScreen.tsx
│   ├── HabitFormScreen.tsx
│   ├── SettingsScreen.tsx
│   └── OnboardingScreen.tsx
├── state/
│   └── useHabitsStore.ts
├── theme/
│   └── tokens.ts
└── utils/
    └── haptics.ts
```
