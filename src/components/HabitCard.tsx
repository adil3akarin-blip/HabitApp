import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../domain/models';
import HabitGrid from './HabitGrid';
import { todayISO } from '../domain/dates';
import { colors, radii, shadow } from '../theme/tokens';
import { hapticTap } from '../utils/haptics';
import AnimatedPressable from './ui/AnimatedPressable';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

interface HabitCardProps {
  habit: Habit;
  completions: Set<string>;
  startISO: string;
  endISO: string;
  onToggleToday: () => void;
  onPress: () => void;
  onLongPress?: () => void;
}

function HabitCard({
  habit,
  completions,
  startISO,
  endISO,
  onToggleToday,
  onPress,
  onLongPress,
}: HabitCardProps) {
  const today = todayISO();
  const isCompletedToday = completions.has(today);
  
  const toggleScale = useSharedValue(1);

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleScale.value }],
  }));

  const handleTogglePress = () => {
    hapticTap();
    toggleScale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    onToggleToday();
  };

  return (
    <AnimatedPressable
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleValue={0.98}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={habit.icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={habit.color}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{habit.name}</Text>
          {habit.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {habit.description}
            </Text>
          ) : null}
        </View>
        <AnimatedPressableView
          style={[
            styles.toggleButton,
            isCompletedToday && {
              backgroundColor: habit.color,
              shadowColor: habit.color,
              shadowOpacity: 0.6,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            },
            toggleAnimatedStyle,
          ]}
          onPress={handleTogglePress}
        >
          <Ionicons
            name={isCompletedToday ? 'checkmark' : 'add'}
            size={20}
            color={isCompletedToday ? '#fff' : colors.textMuted}
          />
        </AnimatedPressableView>
      </View>
      <View style={styles.gridContainer}>
        <HabitGrid
          startISO={startISO}
          endISO={endISO}
          activeDates={completions}
          color={habit.color}
          cellSize={8}
          cellGap={2}
        />
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(HabitCard);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.glass,
    borderRadius: radii.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    marginTop: 12,
    overflow: 'hidden',
  },
});
