import { Completion, Habit } from './models';

export interface BackupV1 {
  schemaVersion: 1;
  app: 'HabitGrid';
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
}

export function validateBackup(data: unknown): BackupV1 {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup: not a JSON object.');
  }

  const obj = data as Record<string, unknown>;

  if (obj.schemaVersion !== 1) {
    throw new Error('Invalid backup: unsupported schema version.');
  }

  if (obj.app !== 'HabitGrid') {
    throw new Error('Invalid backup: not a HabitGrid backup file.');
  }

  if (!Array.isArray(obj.habits)) {
    throw new Error('Invalid backup: habits must be an array.');
  }

  for (const h of obj.habits) {
    if (!h || typeof h !== 'object') {
      throw new Error('Invalid backup: each habit must be an object.');
    }
    const habit = h as Record<string, unknown>;
    if (typeof habit.id !== 'string' || !habit.id) {
      throw new Error('Invalid backup: each habit must have a string id.');
    }
    if (typeof habit.name !== 'string' || !habit.name) {
      throw new Error('Invalid backup: each habit must have a string name.');
    }
    if (typeof habit.icon !== 'string') {
      throw new Error('Invalid backup: each habit must have a string icon.');
    }
    if (typeof habit.color !== 'string') {
      throw new Error('Invalid backup: each habit must have a string color.');
    }
    if (!['day', 'week', 'month'].includes(habit.goalPeriod as string)) {
      throw new Error('Invalid backup: each habit must have a valid goalPeriod.');
    }
    if (typeof habit.goalTarget !== 'number' || habit.goalTarget < 1) {
      throw new Error('Invalid backup: each habit must have a goalTarget >= 1.');
    }
    if (typeof habit.createdAt !== 'string') {
      throw new Error('Invalid backup: each habit must have a createdAt string.');
    }
  }

  if (!Array.isArray(obj.completions)) {
    throw new Error('Invalid backup: completions must be an array.');
  }

  for (const c of obj.completions) {
    if (!c || typeof c !== 'object') {
      throw new Error('Invalid backup: each completion must be an object.');
    }
    const comp = c as Record<string, unknown>;
    if (typeof comp.habitId !== 'string' || !comp.habitId) {
      throw new Error('Invalid backup: each completion must have a habitId.');
    }
    if (typeof comp.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(comp.date)) {
      throw new Error('Invalid backup: each completion must have a date (YYYY-MM-DD).');
    }
  }

  return data as BackupV1;
}
