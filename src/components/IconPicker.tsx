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
import { colors } from '../theme/tokens';
import { hapticTap } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'star',
  'heart',
  'fitness',
  'water',
  'book',
  'musical-notes',
  'code-slash',
  'walk',
  'bicycle',
  'bed',
  'cafe',
  'restaurant',
  'leaf',
  'flash',
  'bulb',
  'trophy',
  'medal',
  'ribbon',
  'rocket',
  'airplane',
  'car',
  'home',
  'briefcase',
  'school',
  'library',
  'calculator',
  'pencil',
  'brush',
  'camera',
  'game-controller',
  'headset',
  'mic',
  'call',
  'mail',
  'chatbubble',
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
  color: string;
}

const IconSwatch = React.memo(function IconSwatch({
  icon,
  isSelected,
  color,
  onSelect,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  color: string;
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
        styles.iconButton,
        isSelected && { backgroundColor: color, borderColor: color },
        animatedStyle,
      ]}
      onPress={handlePress}
    >
      <Ionicons
        name={icon}
        size={24}
        color={isSelected ? '#fff' : colors.textSecondary}
      />
    </AnimatedPressable>
  );
});

function IconPicker({ selectedIcon, onSelect, color }: IconPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ICONS.map((icon) => (
        <IconSwatch
          key={icon}
          icon={icon}
          isSelected={selectedIcon === icon}
          color={color}
          onSelect={() => onSelect(icon)}
        />
      ))}
    </ScrollView>
  );
}

export default React.memo(IconPicker);

export { ICONS };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.glassStrong,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
