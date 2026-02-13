import { subDays } from "date-fns";
import { create } from "zustand";
import * as completionsRepo from "../db/completionsRepo";
import * as habitsRepo from "../db/habitsRepo";
import { todayISO, toISODate } from "../domain/dates";
import { Habit, HabitInput, HabitPatch } from "../domain/models";
import { cancelHabitReminder } from "../domain/notifications";

interface HabitsState {
  habits: Habit[];
  completionsByHabitId: Record<string, Set<string>>;
  countsByHabitId: Record<string, Record<string, number>>;
  isLoading: boolean;
  gridRangeDays: number;

  loadHabits: () => Promise<void>;
  loadCompletionsForRange: (startISO: string, endISO: string) => Promise<void>;
  refresh: () => Promise<void>;
  toggleToday: (habitId: string) => Promise<void>;
  incrementToday: (habitId: string) => Promise<void>;
  resetTodayCount: (habitId: string) => Promise<void>;
  toggleDate: (habitId: string, dateISO: string) => Promise<void>;
  createHabit: (data: HabitInput) => Promise<void>;
  updateHabit: (id: string, data: HabitPatch) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  seedSampleHabits: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completionsByHabitId: {},
  countsByHabitId: {},
  isLoading: false,
  gridRangeDays: 180,

  loadHabits: async () => {
    const habits = await habitsRepo.listActive();
    set({ habits });
  },

  loadCompletionsForRange: async (startISO: string, endISO: string) => {
    const { habits } = get();
    const completionsByHabitId: Record<string, Set<string>> = {};
    const countsByHabitId: Record<string, Record<string, number>> = {};

    for (const habit of habits) {
      const completions = await completionsRepo.listInRange(
        habit.id,
        startISO,
        endISO,
      );
      completionsByHabitId[habit.id] = new Set(completions.map((c) => c.date));
      const counts: Record<string, number> = {};
      for (const c of completions) {
        counts[c.date] = c.count;
      }
      countsByHabitId[habit.id] = counts;
    }

    set({ completionsByHabitId, countsByHabitId });
  },

  refresh: async () => {
    set({ isLoading: true });
    try {
      await get().loadHabits();

      const { gridRangeDays } = get();
      const endISO = todayISO();
      const startISO = toISODate(subDays(new Date(), gridRangeDays));

      await get().loadCompletionsForRange(startISO, endISO);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleToday: async (habitId: string) => {
    await get().toggleDate(habitId, todayISO());
  },

  incrementToday: async (habitId: string) => {
    const today = todayISO();
    const { countsByHabitId, completionsByHabitId } = get();
    const currentCounts = countsByHabitId[habitId] || {};
    const currentCount = currentCounts[today] || 0;
    const newCount = currentCount + 1;

    // Optimistic update
    const newCounts = { ...currentCounts, [today]: newCount };
    const newDates = new Set(
      completionsByHabitId[habitId] || new Set<string>(),
    );
    newDates.add(today);

    set({
      countsByHabitId: { ...countsByHabitId, [habitId]: newCounts },
      completionsByHabitId: { ...completionsByHabitId, [habitId]: newDates },
    });

    // Persist
    await completionsRepo.incrementCount(habitId, today);
  },

  resetTodayCount: async (habitId: string) => {
    const today = todayISO();
    const { countsByHabitId, completionsByHabitId } = get();

    // Optimistic update
    const newCounts = { ...(countsByHabitId[habitId] || {}) };
    delete newCounts[today];

    const newDates = new Set(
      completionsByHabitId[habitId] || new Set<string>(),
    );
    newDates.delete(today);

    set({
      countsByHabitId: { ...countsByHabitId, [habitId]: newCounts },
      completionsByHabitId: { ...completionsByHabitId, [habitId]: newDates },
    });

    // Persist
    await completionsRepo.deleteForDate(habitId, today);
  },

  toggleDate: async (habitId: string, dateISO: string) => {
    const { completionsByHabitId } = get();
    const currentSet = completionsByHabitId[habitId] || new Set<string>();

    // Optimistic update
    const newSet = new Set(currentSet);
    if (newSet.has(dateISO)) {
      newSet.delete(dateISO);
    } else {
      newSet.add(dateISO);
    }

    set({
      completionsByHabitId: {
        ...completionsByHabitId,
        [habitId]: newSet,
      },
    });

    // Update counts optimistically
    const { countsByHabitId: countsState } = get();
    const habitCounts = { ...(countsState[habitId] || {}) };
    if (newSet.has(dateISO)) {
      habitCounts[dateISO] = 1;
    } else {
      delete habitCounts[dateISO];
    }
    set({
      countsByHabitId: { ...countsState, [habitId]: habitCounts },
    });

    // Persist to DB
    await completionsRepo.toggle(habitId, dateISO);
  },

  createHabit: async (data: HabitInput) => {
    const habit = await habitsRepo.create(data);
    set((state) => ({
      habits: [...state.habits, habit],
      completionsByHabitId: {
        ...state.completionsByHabitId,
        [habit.id]: new Set<string>(),
      },
    }));
  },

  updateHabit: async (id: string, data: HabitPatch) => {
    await habitsRepo.update(id, data);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...data } : h)),
    }));
  },

  archiveHabit: async (id: string) => {
    await habitsRepo.archive(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    }));
  },

  deleteHabit: async (id: string) => {
    const { habits, completionsByHabitId } = get();
    const habitToDelete = habits.find((h) => h.id === id);
    const completionsBackup = completionsByHabitId[id];

    // Optimistic update
    const newCompletions = { ...completionsByHabitId };
    delete newCompletions[id];

    set({
      habits: habits.filter((h) => h.id !== id),
      completionsByHabitId: newCompletions,
    });

    try {
      // Cancel scheduled reminder (best-effort, don't block deletion)
      if (habitToDelete?.reminderNotifId) {
        try {
          await cancelHabitReminder(habitToDelete.reminderNotifId);
        } catch (e) {
          console.warn("Failed to cancel reminder during delete:", e);
        }
      }

      await habitsRepo.deleteHabit(id);
    } catch (error) {
      // Restore previous state on failure
      if (habitToDelete) {
        set((state) => ({
          habits: [...state.habits, habitToDelete],
          completionsByHabitId: {
            ...state.completionsByHabitId,
            [id]: completionsBackup || new Set<string>(),
          },
        }));
      }
      throw error;
    }
  },

  seedSampleHabits: async () => {
    const sampleHabits: HabitInput[] = [
      {
        name: "Drink Water",
        description: "Stay hydrated throughout the day",
        icon: "water-outline",
        color: "#22D3EE",
        goalPeriod: "day",
        goalTarget: 1,
      },
      {
        name: "Workout",
        description: "Exercise and stay fit",
        icon: "barbell-outline",
        color: "#7C3AED",
        goalPeriod: "week",
        goalTarget: 3,
      },
      {
        name: "Read",
        description: "Read books or articles",
        icon: "book-outline",
        color: "#10B981",
        goalPeriod: "month",
        goalTarget: 20,
      },
    ];

    for (const habitData of sampleHabits) {
      await get().createHabit(habitData);
    }
  },
}));
