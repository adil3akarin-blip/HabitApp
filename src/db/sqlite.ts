import * as SQLite from "expo-sqlite";

const DB_NAME = "habitgrid.db";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return db;
}

export async function execAsync(
  sql: string,
  params: unknown[] = [],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(sql, params);
}

export async function queryAsync<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync(sql, params);
  return result as T[];
}

export async function runAsync(
  sql: string,
  params: unknown[] = [],
): Promise<SQLite.SQLiteRunResult> {
  const database = await getDatabase();
  return database.runAsync(sql, params);
}
