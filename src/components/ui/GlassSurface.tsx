import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, radii, shadow } from '../../theme/tokens';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassSurface({ children, style }: GlassSurfaceProps) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.card,
    ...shadow,
  },
});
