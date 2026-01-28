import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../../theme/tokens';

interface PillProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function Pill({ label, value, icon }: PillProps) {
  return (
    <View style={styles.pill}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  icon: {
    marginRight: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
