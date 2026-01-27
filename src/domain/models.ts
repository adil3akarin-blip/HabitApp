export type GoalPeriod = "day" | "week" | "month";

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  goalPeriod: GoalPeriod;
  goalTarget: number;
  archivedAt: string | null;
  createdAt: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string;
  count: number;
  createdAt: string;
}

export interface HabitInput {
  name: string;
  description?: string;
  icon: string;
  color: string;
  goalPeriod: GoalPeriod;
  goalTarget: number;
}

export interface HabitPatch {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  goalPeriod?: GoalPeriod;
  goalTarget?: number;
}
