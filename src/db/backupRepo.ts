import { BackupV1 } from '../domain/backup';
import { Completion, Habit } from '../domain/models';
import { cancelHabitReminder, scheduleHabitReminder } from '../domain/notifications';
import { getDatabase, queryAsync, runAsync } from './sqlite';

interface HabitRow {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  goalPeriod: string;
  goalTarget: number;
  archivedAt: string | null;
  createdAt: string;
  reminderEnabled: number;
  reminderTime: string | null;
  reminderNotifId: string | null;
}

function rowToHabit(row: HabitRow): Habit {
  return {
    ...row,
    goalPeriod: row.goalPeriod as Habit['goalPeriod'],
    reminderEnabled: row.reminderEnabled === 1,
  };
}

export async function exportBackup(): Promise<BackupV1> {
  const habitRows = await queryAsync<HabitRow>('SELECT * FROM habits ORDER BY createdAt ASC');
  const habits = habitRows.map(rowToHabit);

  const completions = await queryAsync<Completion>('SELECT * FROM completions ORDER BY date ASC');

  return {
    schemaVersion: 1,
    app: 'HabitGrid',
    exportedAt: new Date().toISOString(),
    habits,
    completions,
  };
}

export async function importBackupReplace(backup: BackupV1): Promise<void> {
  // 1. Cancel existing reminders (best-effort)
  const existingHabits = await queryAsync<HabitRow>('SELECT * FROM habits');
  for (const h of existingHabits) {
    if (h.reminderNotifId) {
      try {
        await cancelHabitReminder(h.reminderNotifId);
      } catch (e) {
        console.warn('Failed to cancel reminder for habit', h.id, e);
      }
    }
  }

  // 2. Collect valid habit IDs for filtering completions
  const habitIdSet = new Set(backup.habits.map((h) => h.id));

  // 3. Delete all existing data and insert imported data in a transaction
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync('DELETE FROM completions');
    await tx.runAsync('DELETE FROM habits');

    for (const habit of backup.habits) {
      await tx.runAsync(
        `INSERT INTO habits (id, name, description, icon, color, goalPeriod, goalTarget, archivedAt, createdAt, reminderEnabled, reminderTime, reminderNotifId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          habit.id,
          habit.name,
          habit.description ?? null,
          habit.icon,
          habit.color,
          habit.goalPeriod,
          habit.goalTarget,
          habit.archivedAt ?? null,
          habit.createdAt,
          habit.reminderEnabled ? 1 : 0,
          habit.reminderTime ?? null,
          null, // always null — we reschedule below
        ],
      );
    }

    for (const comp of backup.completions) {
      // Skip completions referencing missing habits
      if (!habitIdSet.has(comp.habitId)) {
        console.warn('Skipping completion for missing habit:', comp.habitId);
        continue;
      }
      await tx.runAsync(
        `INSERT INTO completions (id, habitId, date, count, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [
          comp.id,
          comp.habitId,
          comp.date,
          comp.count ?? 1,
          comp.createdAt ?? new Date().toISOString(),
        ],
      );
    }
  });

  // 4. Reschedule reminders for imported habits (best-effort, outside transaction)
  for (const habit of backup.habits) {
    if (habit.reminderEnabled && habit.reminderTime) {
      try {
        const notifId = await scheduleHabitReminder(habit.id, habit.name, habit.reminderTime);
        if (notifId) {
          await runAsync('UPDATE habits SET reminderNotifId = ? WHERE id = ?', [notifId, habit.id]);
        }
      } catch (e) {
        console.warn('Failed to reschedule reminder for habit', habit.id, e);
      }
    }
  }
}
