import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  icon: {
    marginRight: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
