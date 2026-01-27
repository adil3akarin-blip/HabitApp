import { addDays, differenceInDays, getDay, startOfWeek } from "date-fns";
import { toISODate } from "./dates";

export interface GridCell {
  date: string;
  dayOfWeek: number;
  weekIndex: number;
}

export function generateGridCells(
  startISO: string,
  endISO: string,
): GridCell[] {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  // Align start to beginning of week (Sunday = 0)
  const alignedStart = startOfWeek(startDate, { weekStartsOn: 0 });

  const cells: GridCell[] = [];
  const totalDays = differenceInDays(endDate, alignedStart) + 1;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(alignedStart, i);
    const dateStr = toISODate(currentDate);
    const dayOfWeek = getDay(currentDate);
    const weekIndex = Math.floor(i / 7);

    cells.push({
      date: dateStr,
      dayOfWeek,
      weekIndex,
    });
  }

  return cells;
}

export function getWeekCount(startISO: string, endISO: string): number {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);
  const alignedStart = startOfWeek(startDate, { weekStartsOn: 0 });
  const totalDays = differenceInDays(endDate, alignedStart) + 1;
  return Math.ceil(totalDays / 7);
}

export function groupCellsByWeek(cells: GridCell[]): GridCell[][] {
  const weeks: GridCell[][] = [];

  for (const cell of cells) {
    if (!weeks[cell.weekIndex]) {
      weeks[cell.weekIndex] = [];
    }
    weeks[cell.weekIndex].push(cell);
  }

  return weeks;
}
