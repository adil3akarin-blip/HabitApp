import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '../theme/tokens';
import GlassSurface from '../components/ui/GlassSurface';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.bg, '#0D1117', colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.accentA, colors.accentB]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appIcon}
          >
            <Ionicons name="grid" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>HabitGrid</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <GlassSurface style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="moon-outline" size={22} color={colors.textMuted} />
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Dark</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          </TouchableOpacity>
        </GlassSurface>

        <GlassSurface style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="cloud-download-outline" size={22} color={colors.textMuted} />
            <Text style={styles.settingLabel}>Export Data</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          </TouchableOpacity>
        </GlassSurface>

        <GlassSurface style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingRow}>
            <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
            <Text style={styles.settingLabel}>Built with Expo + React Native</Text>
          </View>
          <View style={[styles.settingRow, styles.lastRow]}>
            <Ionicons name="heart-outline" size={22} color={colors.textMuted} />
            <Text style={styles.settingLabel}>Local-first, no account required</Text>
          </View>
        </GlassSurface>

        <Text style={styles.footer}>
          Track your habits, build streaks, achieve your goals.
        </Text>
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
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  settingValue: {
    fontSize: 16,
    color: colors.textMuted,
  },
  footer: {
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    paddingTop: 40,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
});
