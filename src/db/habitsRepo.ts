import { queryAsync, runAsync } from "./sqlite";
import { Habit, HabitInput, HabitPatch } from "../domain/models";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function nowISO(): string {
  return new Date().toISOString();
}

export async function listActive(): Promise<Habit[]> {
  return queryAsync<Habit>(
    `SELECT * FROM habits WHERE archivedAt IS NULL ORDER BY createdAt ASC`,
  );
}

export async function listArchived(): Promise<Habit[]> {
  return queryAsync<Habit>(
    `SELECT * FROM habits WHERE archivedAt IS NOT NULL ORDER BY archivedAt DESC`,
  );
}

export async function getById(id: string): Promise<Habit | null> {
  const results = await queryAsync<Habit>(`SELECT * FROM habits WHERE id = ?`, [
    id,
  ]);
  return results[0] || null;
}

export async function create(input: HabitInput): Promise<Habit> {
  const id = generateId();
  const createdAt = nowISO();
  const habit: Habit = {
    id,
    name: input.name,
    description: input.description || null,
    icon: input.icon,
    color: input.color,
    goalPeriod: input.goalPeriod,
    goalTarget: input.goalTarget,
    archivedAt: null,
    createdAt,
  };

  await runAsync(
    `INSERT INTO habits (id, name, description, icon, color, goalPeriod, goalTarget, archivedAt, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habit.id,
      habit.name,
      habit.description,
      habit.icon,
      habit.color,
      habit.goalPeriod,
      habit.goalTarget,
      habit.archivedAt,
      habit.createdAt,
    ],
  );

  return habit;
}

export async function update(id: string, patch: HabitPatch): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (patch.name !== undefined) {
    fields.push("name = ?");
    values.push(patch.name);
  }
  if (patch.description !== undefined) {
    fields.push("description = ?");
    values.push(patch.description);
  }
  if (patch.icon !== undefined) {
    fields.push("icon = ?");
    values.push(patch.icon);
  }
  if (patch.color !== undefined) {
    fields.push("color = ?");
    values.push(patch.color);
  }
  if (patch.goalPeriod !== undefined) {
    fields.push("goalPeriod = ?");
    values.push(patch.goalPeriod);
  }
  if (patch.goalTarget !== undefined) {
    fields.push("goalTarget = ?");
    values.push(patch.goalTarget);
  }

  if (fields.length === 0) return;

  values.push(id);
  await runAsync(`UPDATE habits SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function archive(id: string): Promise<void> {
  await runAsync(`UPDATE habits SET archivedAt = ? WHERE id = ?`, [
    nowISO(),
    id,
  ]);
}

export async function unarchive(id: string): Promise<void> {
  await runAsync(`UPDATE habits SET archivedAt = NULL WHERE id = ?`, [id]);
}

export async function deleteHabit(id: string): Promise<void> {
  await runAsync(`DELETE FROM completions WHERE habitId = ?`, [id]);
  await runAsync(`DELETE FROM habits WHERE id = ?`, [id]);
}
