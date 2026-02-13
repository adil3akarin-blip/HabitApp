import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { toISODate } from "./dates";
import { Habit } from "./models";

export interface GoalProgress {
  done: number;
  target: number;
  periodLabel: string;
  isComplete: boolean;
}

export function computeGoalProgress(
  habit: Habit,
  completions: Set<string>,
  todayISO: string,
  todayCount?: number,
): GoalProgress {
  const target = habit.goalTarget;
  let done = 0;
  let periodLabel = "today";

  switch (habit.goalPeriod) {
    case "day": {
      done =
        todayCount !== undefined
          ? todayCount
          : completions.has(todayISO)
            ? 1
            : 0;
      periodLabel = "today";
      break;
    }
    case "week": {
      const today = new Date(todayISO);
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      done = days.filter((d) => completions.has(toISODate(d))).length;
      periodLabel = "this week";
      break;
    }
    case "month": {
      const today = new Date(todayISO);
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      done = days.filter((d) => completions.has(toISODate(d))).length;
      periodLabel = "this month";
      break;
    }
  }

  return {
    done,
    target,
    periodLabel,
    isComplete: done >= target,
  };
}
