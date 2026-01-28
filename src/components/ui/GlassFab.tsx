import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/tokens';
import AnimatedPressable from './AnimatedPressable';

interface GlassFabProps {
  onPress: () => void;
}

export default function GlassFab({ onPress }: GlassFabProps) {
  return (
    <AnimatedPressable style={styles.container} onPress={onPress} scaleValue={0.9}>
      <LinearGradient
        colors={[colors.accentA, colors.accentB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    shadowColor: colors.accentA,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
