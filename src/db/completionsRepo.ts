import { queryAsync, runAsync } from "./sqlite";
import { Completion } from "../domain/models";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function nowISO(): string {
  return new Date().toISOString();
}

export async function listInRange(
  habitId: string,
  startISO: string,
  endISO: string,
): Promise<Completion[]> {
  return queryAsync<Completion>(
    `SELECT * FROM completions 
     WHERE habitId = ? AND date >= ? AND date <= ?
     ORDER BY date ASC`,
    [habitId, startISO, endISO],
  );
}

export async function listAllForHabit(habitId: string): Promise<Completion[]> {
  return queryAsync<Completion>(
    `SELECT * FROM completions WHERE habitId = ? ORDER BY date ASC`,
    [habitId],
  );
}

export async function toggle(habitId: string, dateISO: string): Promise<void> {
  const existing = await queryAsync<Completion>(
    `SELECT * FROM completions WHERE habitId = ? AND date = ?`,
    [habitId, dateISO],
  );

  if (existing.length > 0) {
    await runAsync(`DELETE FROM completions WHERE habitId = ? AND date = ?`, [
      habitId,
      dateISO,
    ]);
  } else {
    const id = generateId();
    const createdAt = nowISO();
    await runAsync(
      `INSERT INTO completions (id, habitId, date, count, createdAt)
       VALUES (?, ?, ?, 1, ?)`,
      [id, habitId, dateISO, createdAt],
    );
  }
}

export async function getCompletionDatesSet(
  habitId: string,
  startISO: string,
  endISO: string,
): Promise<Set<string>> {
  const completions = await listInRange(habitId, startISO, endISO);
  return new Set(completions.map((c) => c.date));
}
