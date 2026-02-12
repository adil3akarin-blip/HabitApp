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
import { springBounce } from '../ui/motion';
import { hapticSelection } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

const ColorDot = React.memo(function ColorDot({
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
    hapticSelection();
    scale.value = withSequence(
      withTiming(0.8, { duration: 80 }),
      withSpring(1, springBounce),
    );
    onSelect();
  };

  return (
    <AnimatedPressable
      style={[
        styles.colorButton,
        { backgroundColor: color },
        isSelected && [styles.selected, { shadowColor: color }],
        animatedStyle,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Color ${color}`}
      accessibilityState={{ selected: isSelected }}
    >
      {isSelected && (
        <Ionicons name="checkmark" size={20} color="#fff" />
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
        <ColorDot
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
    gap: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
});
