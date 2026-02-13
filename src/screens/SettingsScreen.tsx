import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedSection from '../components/AnimatedSection';
import GlassSurface from '../components/ui/GlassSurface';
import { pickBackupFile, readBackupFromFile, shareFile, writeBackupToFile } from '../data/backupFile';
import * as backupRepo from '../db/backupRepo';
import { useHabitsStore } from '../state/useHabitsStore';
import { colors } from '../theme/tokens';
import { hapticSuccess, hapticWarning } from '../utils/haptics';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = await backupRepo.exportBackup();
      const { uri } = await writeBackupToFile(backup);
      await shareFile(uri);
      hapticSuccess();
    } catch (e: any) {
      Alert.alert('Export failed', e.message || 'An unexpected error occurred.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const uri = await pickBackupFile();
      if (!uri) return;

      let backup;
      try {
        backup = await readBackupFromFile(uri);
      } catch (e: any) {
        Alert.alert('Invalid backup', e.message || 'Could not read the backup file.');
        return;
      }

      hapticWarning();
      Alert.alert(
        'Import backup?',
        `This will replace your current habits and history. This can't be undone.\n\n${backup.habits.length} habits, ${backup.completions.length} completions`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              setIsImporting(true);
              try {
                await backupRepo.importBackupReplace(backup);
                await useHabitsStore.getState().refresh();
                hapticSuccess();
                Alert.alert('Import complete', 'Your data has been restored.');
              } catch (e: any) {
                Alert.alert('Import failed', e.message || 'An unexpected error occurred.');
              } finally {
                setIsImporting(false);
              }
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Import failed', e.message || 'An unexpected error occurred.');
    }
  };

  const isBusy = isExporting || isImporting;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <AnimatedSection index={0}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <View style={styles.appIcon}>
            <Ionicons name="grid" size={32} color={colors.accentA} />
          </View>
          <Text style={styles.appName}>HabitGrid</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
        </AnimatedSection>

        <AnimatedSection index={1}>
        <GlassSurface style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Dark</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </TouchableOpacity>
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={2}>
        <GlassSurface style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleExport}
            disabled={isBusy}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.accentA} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color={colors.textSecondary} />
            )}
            <Text style={[styles.settingLabel, isBusy && styles.settingLabelDisabled]}>
              Export data
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingRow, styles.lastRow]}
            onPress={handleImport}
            disabled={isBusy}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={colors.accentA} />
            ) : (
              <Ionicons name="cloud-download-outline" size={20} color={colors.textSecondary} />
            )}
            <Text style={[styles.settingLabel, isBusy && styles.settingLabelDisabled]}>
              Import data
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </TouchableOpacity>
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={3}>
        <GlassSurface style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Built with Expo + React Native</Text>
          </View>
          <View style={[styles.settingRow, styles.lastRow]}>
            <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Local-first, no account required</Text>
          </View>
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={4}>
        <Text style={styles.footer}>
          Track your habits, build streaks, achieve your goals.
        </Text>
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.accentA + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  appVersion: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  settingLabelDisabled: {
    opacity: 0.4,
  },
  settingValue: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  footer: {
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    paddingTop: 40,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
});
