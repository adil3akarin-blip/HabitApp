import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { spring, timing } from '../motion/tokens';
import { colors, glowShadow } from '../theme/tokens';
import { hapticTap } from '../utils/haptics';

const COLORS = [
  '#007AFF',
  '#34C759',
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#AF52DE',
  '#5856D6',
  '#00C7BE',
  '#FF2D55',
  '#A2845E',
  '#8E8E93',
  '#30B0C7',
  '#32ADE6',
  '#64D2FF',
  '#BF5AF2',
  '#FF6482',
];

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ColorSwatch = React.memo(function ColorSwatch({
  color,
  isSelected,
  onSelect,
}: {
  color: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    hapticTap();
    scale.value = withSequence(
      withTiming(0.8, timing.snappy),
      withSpring(1, spring.bouncy),
    );
    onSelect();
  };

  return (
    <AnimatedPressable
      style={[
        styles.colorButton,
        { backgroundColor: color },
        isSelected && [styles.selected, glowShadow(color, 10, 0.5)],
        animatedStyle,
      ]}
      onPress={handlePress}
    >
      {isSelected && (
        <Ionicons name="checkmark" size={18} color="#fff" />
      )}
    </AnimatedPressable>
  );
});

function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {COLORS.map((color) => (
        <ColorSwatch
          key={color}
          color={color}
          isSelected={selectedColor === color}
          onSelect={() => onSelect(color)}
        />
      ))}
    </ScrollView>
  );
}

export default React.memo(ColorPicker);

export { COLORS };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 2.5,
    borderColor: colors.text,
  },
});
