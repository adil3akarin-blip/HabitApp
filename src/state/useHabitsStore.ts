import { create } from "zustand";
import { Habit, HabitInput, HabitPatch } from "../domain/models";
import * as habitsRepo from "../db/habitsRepo";
import * as completionsRepo from "../db/completionsRepo";
import { todayISO, toISODate } from "../domain/dates";
import { subDays } from "date-fns";

interface HabitsState {
  habits: Habit[];
  completionsByHabitId: Record<string, Set<string>>;
  isLoading: boolean;
  gridRangeDays: number;

  loadHabits: () => Promise<void>;
  loadCompletionsForRange: (startISO: string, endISO: string) => Promise<void>;
  refresh: () => Promise<void>;
  toggleToday: (habitId: string) => Promise<void>;
  toggleDate: (habitId: string, dateISO: string) => Promise<void>;
  createHabit: (data: HabitInput) => Promise<void>;
  updateHabit: (id: string, data: HabitPatch) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completionsByHabitId: {},
  isLoading: false,
  gridRangeDays: 180,

  loadHabits: async () => {
    const habits = await habitsRepo.listActive();
    set({ habits });
  },

  loadCompletionsForRange: async (startISO: string, endISO: string) => {
    const { habits } = get();
    const completionsByHabitId: Record<string, Set<string>> = {};

    for (const habit of habits) {
      const completions = await completionsRepo.listInRange(
        habit.id,
        startISO,
        endISO,
      );
      completionsByHabitId[habit.id] = new Set(completions.map((c) => c.date));
    }

    set({ completionsByHabitId });
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
}));
