import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { todayISO } from '../domain/dates';
import { Habit } from '../domain/models';
import { computeStreak } from '../domain/streaks';
import { colors, radii, shadow } from '../theme/tokens';
import { springBounce, springPress } from '../ui/motion';
import { hapticMedium, hapticSelection } from '../utils/haptics';
import HabitGrid from './HabitGrid';
import AnimatedPressable from './ui/AnimatedPressable';
import StreakBadge from './ui/StreakBadge';
import SuccessConfetti from './ui/SuccessConfetti';

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
  const [showConfetti, setShowConfetti] = useState(false);
  
  const toggleScale = useSharedValue(1);
  const glowOpacity = useSharedValue(isCompletedToday ? 0.15 : 0);
  const checkRotation = useSharedValue(isCompletedToday ? 0 : -90);

  const streak = useMemo(() => {
    return computeStreak(habit, completions, today);
  }, [habit, completions, today]);

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${checkRotation.value}deg` }],
  }));

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const handleTogglePress = () => {
    const willComplete = !isCompletedToday;

    if (willComplete) {
      hapticMedium();
      toggleScale.value = withSequence(
        withTiming(0.75, { duration: 80 }),
        withSpring(1.1, springBounce),
        withSpring(1, springPress),
      );
      glowOpacity.value = withTiming(0.15, { duration: 300 });
      checkRotation.value = withSequence(
        withTiming(-90, { duration: 0 }),
        withSpring(0, { damping: 14, stiffness: 200 }),
      );
      runOnJS(triggerConfetti)();
    } else {
      hapticSelection();
      toggleScale.value = withSequence(
        withTiming(0.85, { duration: 80 }),
        withSpring(1, springBounce),
      );
      glowOpacity.value = withTiming(0, { duration: 200 });
    }

    onToggleToday();
  };

  return (
    <AnimatedPressable
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleValue={0.98}
    >
      {/* Glow overlay on completion */}
      <Animated.View
        style={[
          styles.glowOverlay,
          { backgroundColor: habit.color },
          glowStyle,
        ]}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: habit.color + '18' }]}>
          <Ionicons
            name={habit.icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={habit.color}
          />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{habit.name}</Text>
            <StreakBadge streak={streak} color={habit.color} />
          </View>
          {habit.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {habit.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.toggleWrapper}>
          <AnimatedPressableView
            style={[
              styles.toggleButton,
              isCompletedToday && {
                backgroundColor: habit.color,
                shadowColor: habit.color,
                shadowOpacity: 0.6,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
              },
              toggleAnimatedStyle,
            ]}
            onPress={handleTogglePress}
            accessibilityRole="button"
            accessibilityLabel={`${isCompletedToday ? 'Unmark' : 'Mark'} ${habit.name} as done`}
          >
            <Animated.View style={checkStyle}>
              <Ionicons
                name={isCompletedToday ? 'checkmark' : 'add'}
                size={20}
                color={isCompletedToday ? '#fff' : colors.textMuted}
              />
            </Animated.View>
          </AnimatedPressableView>
          <SuccessConfetti
            active={showConfetti}
            color={habit.color}
            onComplete={() => setShowConfetti(false)}
          />
        </View>
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
    overflow: 'hidden',
    ...shadow,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  toggleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
