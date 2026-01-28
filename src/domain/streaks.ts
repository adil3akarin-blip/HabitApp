import {
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  format,
} from "date-fns";
import { Habit } from "./models";
import { toISODate } from "./dates";

export function computeStreak(
  habit: Habit,
  activeDates: Set<string>,
  todayISO: string,
): number {
  switch (habit.goalPeriod) {
    case "day":
      return computeDailyStreak(activeDates, todayISO);
    case "week":
      return computeWeeklyStreak(activeDates, todayISO, habit.goalTarget);
    case "month":
      return computeMonthlyStreak(activeDates, todayISO, habit.goalTarget);
    default:
      return 0;
  }
}

function computeDailyStreak(
  activeDates: Set<string>,
  todayISO: string,
): number {
  let streak = 0;
  let currentDate = new Date(todayISO);

  // Check if today is completed, if not start from yesterday
  if (!activeDates.has(todayISO)) {
    currentDate = subDays(currentDate, 1);
  }

  // Count consecutive days backwards
  while (true) {
    const dateStr = toISODate(currentDate);
    if (activeDates.has(dateStr)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

function computeWeeklyStreak(
  activeDates: Set<string>,
  todayISO: string,
  goalTarget: number,
): number {
  let streak = 0;
  let currentWeekStart = startOfWeek(new Date(todayISO), { weekStartsOn: 0 });

  while (true) {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    const daysInWeek = eachDayOfInterval({
      start: currentWeekStart,
      end: weekEnd,
    });

    const completionsInWeek = daysInWeek.filter((day) =>
      activeDates.has(toISODate(day)),
    ).length;

    if (completionsInWeek >= goalTarget) {
      streak++;
      currentWeekStart = subWeeks(currentWeekStart, 1);
    } else {
      // If current week is incomplete but we're still in it, don't break streak
      const today = new Date(todayISO);
      if (streak === 0 && currentWeekStart <= today && today <= weekEnd) {
        // Current week not yet complete, check previous weeks
        currentWeekStart = subWeeks(currentWeekStart, 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

function computeMonthlyStreak(
  activeDates: Set<string>,
  todayISO: string,
  goalTarget: number,
): number {
  let streak = 0;
  let currentMonthStart = startOfMonth(new Date(todayISO));

  while (true) {
    const monthEnd = endOfMonth(currentMonthStart);
    const daysInMonth = eachDayOfInterval({
      start: currentMonthStart,
      end: monthEnd,
    });

    const completionsInMonth = daysInMonth.filter((day) =>
      activeDates.has(toISODate(day)),
    ).length;

    if (completionsInMonth >= goalTarget) {
      streak++;
      currentMonthStart = subMonths(currentMonthStart, 1);
    } else {
      // If current month is incomplete but we're still in it, don't break streak
      const today = new Date(todayISO);
      if (streak === 0 && currentMonthStart <= today && today <= monthEnd) {
        // Current month not yet complete, check previous months
        currentMonthStart = subMonths(currentMonthStart, 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

export function computeLongestStreak(activeDates: Set<string>): number {
  if (activeDates.size === 0) return 0;

  const sortedDates = Array.from(activeDates).sort();
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}
