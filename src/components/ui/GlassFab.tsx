import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';
import AnimatedPressable from './AnimatedPressable';

interface GlassFabProps {
  onPress: () => void;
}

export default function GlassFab({ onPress }: GlassFabProps) {
  return (
    <AnimatedPressable style={styles.container} onPress={onPress} scaleValue={0.9}>
      <View style={styles.button}>
        <Ionicons name="add" size={26} color="#fff" />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    shadowColor: colors.accentA,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentA,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
