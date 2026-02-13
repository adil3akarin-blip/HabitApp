import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { BackupV1, validateBackup } from "../domain/backup";

function formatDateForFilename(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function writeBackupToFile(
  backup: BackupV1,
): Promise<{ uri: string; filename: string }> {
  const filename = `habitgrid-backup-${formatDateForFilename()}.habitgrid.json`;
  const file = new File(Paths.cache, filename);
  file.write(JSON.stringify(backup));
  return { uri: file.uri, filename };
}

export async function shareFile(uri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/json",
      UTI: "public.json",
    });
  } else {
    Alert.alert("Sharing not available", `Backup saved to:\n${uri}`);
  }
}

export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "*/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

export async function readBackupFromFile(uri: string): Promise<BackupV1> {
  const file = new File(uri);
  const content = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }

  return validateBackup(parsed);
}
