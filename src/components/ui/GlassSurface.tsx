import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, shadowLight } from '../../theme/tokens';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassSurface({ children, style }: GlassSurfaceProps) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.bgCard,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.card,
    ...shadowLight,
  },
});
