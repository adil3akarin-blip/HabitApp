import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { todayISO } from '../domain/dates';
import { Habit } from '../domain/models';
import { computeLongestStreak, computeStreak } from '../domain/streaks';
import { press, spring, timing } from '../motion/tokens';
import { colors, glowShadow, radii } from '../theme/tokens';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import HabitGrid from './HabitGrid';
import AnimatedPressable from './ui/AnimatedPressable';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

interface HabitCardProps {
  habit: Habit;
  completions: Set<string>;
  counts?: Record<string, number>;
  todayCount?: number;
  startISO: string;
  endISO: string;
  onToggleToday: () => void;
  onIncrementToday?: () => void;
  onResetToday?: () => void;
  onPress: () => void;
  onLongPress?: () => void;
}

const TOGGLE_SIZE = 45;
const RING_WIDTH = 3;

function HabitCard({
  habit,
  completions,
  counts = {},
  todayCount = 0,
  startISO,
  endISO,
  onToggleToday,
  onIncrementToday,
  onResetToday,
  onPress,
  onLongPress,
}: HabitCardProps) {
  const today = todayISO();
  const isDailyMulti = habit.goalPeriod === 'day' && habit.goalTarget > 1;
  const isCompletedToday = isDailyMulti
    ? todayCount >= habit.goalTarget
    : completions.has(today);

  const gridActiveDates = useMemo(() => {
    if (!isDailyMulti) return completions;
    const filtered = new Set<string>();
    for (const dateISO of completions) {
      if ((counts[dateISO] || 0) >= habit.goalTarget) {
        filtered.add(dateISO);
      }
    }
    return filtered;
  }, [completions, counts, isDailyMulti, habit.goalTarget]);

  const fillPercent = isDailyMulti
    ? Math.min(todayCount / habit.goalTarget, 1)
    : 0;

  const streak = useMemo(() => computeStreak(habit, gridActiveDates, today), [habit, gridActiveDates, today]);
  const best = useMemo(() => computeLongestStreak(gridActiveDates), [gridActiveDates]);
  const total = gridActiveDates.size;

  const toggleScale = useSharedValue(1);
  const fillHeight = useSharedValue(fillPercent);

  // Animate fill height when fillPercent changes
  React.useEffect(() => {
    fillHeight.value = withTiming(fillPercent, timing.standard);
  }, [fillPercent]);

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleScale.value }],
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value * 100}%`,
  }));

  const handleTogglePress = () => {
    const willComplete = isDailyMulti && (todayCount + 1 >= habit.goalTarget) && !isCompletedToday;
    const willToggleOn = !isDailyMulti && !isCompletedToday;

    if (willComplete || willToggleOn) {
      hapticSuccess();
      // Celebration: compress → overshoot → settle
      toggleScale.value = withSequence(
        withTiming(press.scaleTiny, timing.snappy),
        withSpring(1.15, spring.bouncy),
        withSpring(1, spring.tight),
      );
    } else {
      hapticTap();
      // Standard: compress → spring back
      toggleScale.value = withSequence(
        withTiming(press.scaleTiny, timing.snappy),
        withSpring(1, spring.snappy),
      );
    }

    if (isDailyMulti && isCompletedToday && onResetToday) {
      onResetToday();
    } else if (isDailyMulti && onIncrementToday) {
      onIncrementToday();
    } else {
      onToggleToday();
    }
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        isCompletedToday && {
          borderColor: habit.color + '30',
          ...glowShadow(habit.color, 8, 0.15),
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleValue={0.98}
    >
      <View style={[styles.accentStrip, { backgroundColor: habit.color, opacity: isCompletedToday ? 1 : 0.2 }]} />
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: habit.color + '18' }]}>
          <Ionicons
            name={habit.icon as keyof typeof Ionicons.glyphMap}
            size={20}
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
            isDailyMulti && !isCompletedToday && { backgroundColor: 'transparent', borderWidth: RING_WIDTH, borderColor: colors.glassStrong },
            isCompletedToday && { backgroundColor: habit.color },
            toggleAnimatedStyle,
          ]}
          onPress={handleTogglePress}
        >
          <Animated.View style={[styles.fillOverlay, { backgroundColor: habit.color }, fillAnimatedStyle]} />
          <Ionicons
            name={isCompletedToday ? 'checkmark' : 'add'}
            size={20}
            color={isCompletedToday ? '#fff' : colors.textSecondary}
            style={{ zIndex: 1 }}
          />
        </AnimatedPressableView>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.statsColumn}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={12} color={colors.danger} style={styles.glowWrap} />
            <Text style={[styles.statValue, { color: colors.danger }]}>{streak}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={12} color={colors.accentA} />
            <Text style={styles.statValue}>{best}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={12} color={habit.color} />
            <Text style={styles.statValue}>{total}</Text>
          </View>
        </View>
        <View style={styles.gridContainer}>
          <HabitGrid
            startISO={startISO}
            endISO={endISO}
            activeDates={gridActiveDates}
            color={habit.color}
            cellSize={8}
            cellGap={2}
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(HabitCard);

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    backgroundColor: colors.bgCard,
    borderRadius: radii.card,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: radii.card,
    borderBottomLeftRadius: radii.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleButton: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: TOGGLE_SIZE / 2,
    backgroundColor: colors.glassStrong,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  fillOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: TOGGLE_SIZE / 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
    zIndex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 14,
    gap: 14,
  },
  statsColumn: {
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  gridContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  glowWrap: {
    // iOS glow
    shadowColor: colors.danger,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },

    // Android glow (more limited)
    elevation: 16,

    borderRadius: 20,
  }
});
