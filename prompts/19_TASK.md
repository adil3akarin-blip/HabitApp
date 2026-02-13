# TASK 19 — Import/Export Data (Settings) using a versioned .habitgrid.json backup

Implement TASK 19 only.
Do NOT change DB schemas for habits/completions.
Goal: Add reliable local backup export + restore import from Settings, using a single portable file format.

---

## File format choice (best for MVP)
Use a **single JSON backup file** with versioned envelope:
- Extension: `.habitgrid.json`
- Why: portable, debuggable, easy to validate, works well with Expo FileSystem + Sharing + DocumentPicker. :contentReference[oaicite:0]{index=0}

---

## Dependencies (Expo SDK compatible)
Add (if not present):
- `expo-file-system` (write/read files) :contentReference[oaicite:1]{index=1}
- `expo-sharing` (share exported file) :contentReference[oaicite:2]{index=2}
- `expo-document-picker` (pick import file) :contentReference[oaicite:3]{index=3}

Notes:
- `expo-sharing` supports sharing **from your app to other apps** (export), not importing via share sheet. Import will use DocumentPicker. :contentReference[oaicite:4]{index=4}

---

## Objective
In Settings tab:
1) Button: **Export data**
2) Button: **Import data**
3) Import flow must confirm destructive action:
   - Default behavior: **Replace current data** (recommended for MVP)
4) After import/export show success/failure UI feedback.

---

## Data included in backup
Export must include:
- All habits (active + archived)
- All completions
- (Optional) app meta that is SAFE to transfer (e.g., theme) — but by default:
  - DO NOT export `app_meta` keys that contain device-specific reminder IDs or transient values.

Reminder behavior:
- Export habit reminder settings fields (if stored in habits table).
- On import, DO NOT reuse old notification IDs.
- After import, reschedule reminders based on imported habit reminder settings (best-effort).

---

## Backup JSON schema (v1)
Create TypeScript types in `src/domain/backup.ts`:

Envelope:
- `schemaVersion: 1`
- `app: "HabitGrid"`
- `exportedAt: string` (ISO datetime)
- `habits: Habit[]` (full rows; archived included)
- `completions: Completion[]`

Validation rules:
- `schemaVersion === 1`
- `app === "HabitGrid"`
- `habits` is array; each habit has `id`, `name`, `icon`, `color`, `goalPeriod`, `goalTarget`, `createdAt`
- `completions` is array; each completion has `habitId`, `date` ("YYYY-MM-DD")

If invalid -> show alert and abort.

---

## Implementation

### A) DB access helpers
Create `src/db/backupRepo.ts`:

Functions:
1) `exportBackup(): Promise<BackupV1>`
- Query all rows from `habits` (no archived filter).
- Query all rows from `completions`.
- Return envelope.

2) `importBackupReplace(backup: BackupV1): Promise<void>`
- Best-effort cancel all reminders for existing habits BEFORE wiping (if reminders exist).
- Delete in correct order:
  - delete all `completions`
  - delete all `habits`
- Insert all imported `habits` then all imported `completions`.
- Use a transaction if your sqlite helper supports it; otherwise ensure try/catch and partial failure handling.

After DB import:
- Reschedule reminders for imported habits that have reminders enabled (best-effort).
- Do NOT store imported notification IDs; generate new schedules and store new IDs if your reminders system does that.

### B) File IO + share/pick
Create `src/data/backupFile.ts`:

Functions:
1) `writeBackupToFile(backup: BackupV1): Promise<{ uri: string; filename: string }>`
- `const filename = habitgrid-backup-YYYYMMDD-HHmmss.habitgrid.json`
- `const uri = FileSystem.cacheDirectory + filename`
- Write `JSON.stringify(backup)` via FileSystem.
- Return uri & filename. :contentReference[oaicite:5]{index=5}

2) `shareFile(uri: string): Promise<void>`
- Use `Sharing.shareAsync(uri)` if available. :contentReference[oaicite:6]{index=6}
- If sharing not available (web/simulator edge), show an alert with file uri.

3) `pickBackupFile(): Promise<string | null>`
- Use `DocumentPicker.getDocumentAsync({ type: ["application/json", "*/*"] })`
- Return selected `uri` or null. :contentReference[oaicite:7]{index=7}

4) `readBackupFromFile(uri: string): Promise<BackupV1>`
- `FileSystem.readAsStringAsync(uri, { encoding: "utf8" })` then JSON.parse. :contentReference[oaicite:8]{index=8}
- Validate schema and throw a user-friendly error if invalid.

### C) Settings UI
Update `src/screens/SettingsScreen.tsx`:
Add section "Data":
- GlassSurface block with:
  - "Export data" button
  - "Import data" button

Export flow:
- Call `backupRepo.exportBackup()`
- Write to file
- Share file
- Show success message

Import flow:
- Pick file
- Read + validate
- Show confirm modal:
  - Title: "Import backup?"
  - Body: "This will replace your current habits and history. This can't be undone."
  - Buttons: Cancel / Import (destructive)
- On confirm:
  - `backupRepo.importBackupReplace(backup)`
  - Trigger store refresh (e.g., `useHabitsStore.getState().refresh()`)

UX polish:
- Disable buttons while processing.
- Use haptics:
  - success on export/import completion
  - warning on destructive confirm (if your haptics helpers exist)

### D) Store refresh
No store rewrites.
After import, call existing store refresh so Home updates immediately.

---

## Edge cases
- Importing a backup with completions referencing missing habitId:
  - Option A (simple): skip those completions + log warning
  - Option B: fail import with message
Choose A (skip) for robustness.

- Very large backups:
  - Keep operations async
  - Avoid rendering huge JSON in UI

- Reminders:
  - Rescheduling may require permissions; if denied, continue import and show non-blocking warning.

---

## Definition of Done
- Export creates a `.habitgrid.json` file and opens share dialog (on device). :contentReference[oaicite:9]{index=9}
- Import via DocumentPicker reads that file and restores:
  - habits (including archived)
  - completions
- After import, Home reflects restored habits immediately.
- App does not crash if reminder permissions are denied; import still succeeds.
- Invalid JSON shows a friendly error and does not modify DB.

---

## Output format (MANDATORY)
1) ✅ TASK 19 done — 1–2 sentences
2) Files changed/added — bullet list with paths
3) How to verify — step-by-step manual test
4) Notes/Risks — only if needed
