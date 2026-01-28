import { execAsync } from "./sqlite";

export async function runMigrations(): Promise<void> {
  // Create habits table
  await execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      goalPeriod TEXT NOT NULL,
      goalTarget INTEGER NOT NULL,
      archivedAt TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Create completions table with unique constraint
  await execAsync(`
    CREATE TABLE IF NOT EXISTS completions (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      UNIQUE(habitId, date)
    );
  `);

  // Create index on completions(habitId, date)
  await execAsync(`
    CREATE INDEX IF NOT EXISTS idx_completions_habitId_date 
    ON completions(habitId, date);
  `);

  // Create index on habits(archivedAt)
  await execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habits_archivedAt 
    ON habits(archivedAt);
  `);

  // Add reminder fields to habits table (migration for existing DBs)
  try {
    await execAsync(
      `ALTER TABLE habits ADD COLUMN reminderEnabled INTEGER DEFAULT 0;`,
    );
  } catch (e) {
    // Column already exists
  }
  try {
    await execAsync(`ALTER TABLE habits ADD COLUMN reminderTime TEXT;`);
  } catch (e) {
    // Column already exists
  }
  try {
    await execAsync(`ALTER TABLE habits ADD COLUMN reminderNotifId TEXT;`);
  } catch (e) {
    // Column already exists
  }

  console.log("migrations ok");
}
