import { getFirstAsync, runAsync } from "./sqlite";

export async function get(key: string): Promise<string | null> {
  const row = await getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = ?",
    [key],
  );
  return row?.value ?? null;
}

export async function set(key: string, value: string): Promise<void> {
  const now = new Date().toISOString();
  await runAsync(
    `INSERT INTO app_meta (key, value, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    [key, value, now],
  );
}

export async function getBool(key: string): Promise<boolean> {
  const value = await get(key);
  return value === "1";
}

export async function setBool(key: string, value: boolean): Promise<void> {
  await set(key, value ? "1" : "0");
}
