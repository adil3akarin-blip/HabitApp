import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import AnimatedSection from '../components/AnimatedSection';
import CalendarMonth from '../components/CalendarMonth';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import GlassSurface from '../components/ui/GlassSurface';
import Pill from '../components/ui/Pill';
import { todayISO, toISODate } from '../domain/dates';
import { computeGoalProgress } from '../domain/goals';
import { computeLongestStreak, computeStreak } from '../domain/streaks';
import { useHabitsStore } from '../state/useHabitsStore';
import { colors, glowShadow, radii } from '../theme/tokens';
import PressFeedback from '../ui/press/PressFeedback';
import StreakFlame from '../ui/svg/StreakFlame';
import { hapticSuccess, hapticTap, hapticWarning } from '../utils/haptics';

const MILESTONE_STREAKS = [
  { days: 7, label: '🔥 7 Day Streak!' },
  { days: 30, label: '💪 30 Day Warrior!' },
  { days: 100, label: '💎 100 Day Legend!' },
  { days: 365, label: '👑 365 Day Champion!' },
];

type HabitDetailsScreenProps = {
  route: RouteProp<HomeStackParamList, 'HabitDetails'>;
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HabitDetails'>;
};

export default function HabitDetailsScreen({ route, navigation }: HabitDetailsScreenProps) {
  const { habitId } = route.params;
  const { habits, completionsByHabitId, countsByHabitId, toggleDate, deleteHabit } = useHabitsStore();
  
  const habit = habits.find((h) => h.id === habitId);
  const completions = completionsByHabitId[habitId] || new Set<string>();
  const counts = countsByHabitId[habitId] || {};
  const todayCountValue = counts[todayISO()] || 0;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDailyMulti = habit ? habit.goalPeriod === 'day' && habit.goalTarget > 1 : false;

  const calendarActiveDates = useMemo(() => {
    if (!isDailyMulti || !habit) return completions;
    const filtered = new Set<string>();
    for (const dateISO of completions) {
      if ((counts[dateISO] || 0) >= habit.goalTarget) {
        filtered.add(dateISO);
      }
    }
    return filtered;
  }, [completions, counts, isDailyMulti, habit?.goalTarget]);

  const currentStreak = useMemo(() => {
    if (!habit) return 0;
    return computeStreak(habit, calendarActiveDates, todayISO());
  }, [habit, calendarActiveDates]);

  const milestoneData = MILESTONE_STREAKS.find(m => m.days === currentStreak);
  const isMilestoneStreak = !!milestoneData;

  useEffect(() => {
    if (isMilestoneStreak) {
      const timer = setTimeout(() => {
        hapticSuccess();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isMilestoneStreak]);

  const longestStreak = useMemo(() => {
    return computeLongestStreak(calendarActiveDates);
  }, [calendarActiveDates]);

  const goalProgress = useMemo(() => {
    if (!habit) return { done: 0, target: 1, isComplete: false, periodLabel: 'today' };
    return computeGoalProgress(habit, completions, todayISO(), todayCountValue);
  }, [habit, completions, todayCountValue]);

  const progressPercent = Math.min(goalProgress.done / goalProgress.target, 1);
  const progressWidth = useSharedValue(progressPercent);

  useEffect(() => {
    progressWidth.value = withTiming(progressPercent, { duration: 600 });
  }, [progressPercent]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const goalLabel = useMemo(() => {
    if (!habit) return '';
    if (habit.goalTarget === 1 && habit.goalPeriod === 'day') return 'Goal: daily';
    const periodMap = { day: 'day', week: 'week', month: 'month' };
    return `Goal: ${habit.goalTarget}× per ${periodMap[habit.goalPeriod]}`;
  }, [habit?.goalTarget, habit?.goalPeriod]);

  const statusText = useMemo(() => {
    if (goalProgress.isComplete) {
      const bonus = goalProgress.done - goalProgress.target;
      if (bonus > 0) return `✓ Goal reached! (+${bonus} bonus)`;
      return '✓ Goal reached!';
    }
    return `${goalProgress.done} done ${goalProgress.periodLabel}`;
  }, [goalProgress]);

  const hasCompletionsInMonth = useMemo(() => {
    const monthStart = toISODate(startOfMonth(currentMonth));
    const monthEnd = toISODate(endOfMonth(currentMonth));
    for (const dateISO of calendarActiveDates) {
      if (dateISO >= monthStart && dateISO <= monthEnd) {
        return true;
      }
    }
    return false;
  }, [calendarActiveDates, currentMonth]);

  useLayoutEffect(() => {
    if (habit) {
      navigation.setOptions({
        title: habit.name,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('HabitForm', { habitId })}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={18} color={colors.accentA} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, habit, habitId]);

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }

  const handlePrevMonth = () => {
    hapticTap();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    hapticTap();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleToggleDate = (dateISO: string) => {
    toggleDate(habitId, dateISO);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <AnimatedSection index={0}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color + '18' }, glowShadow(habit.color, 12, 0.25)]}>
              <Ionicons name={habit.icon as any} size={28} color={habit.color} />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.habitName}>{habit.name}</Text>
                {isMilestoneStreak && milestoneData && (
                  <View style={[styles.milestoneBadge, { backgroundColor: habit.color + '20', borderColor: habit.color + '40' }]}>
                    <Text style={[styles.milestoneBadgeText, { color: habit.color }]}>
                      {milestoneData.label}
                    </Text>
                  </View>
                )}
              </View>
              {habit.description ? (
                <Text style={styles.habitDescription}>{habit.description}</Text>
              ) : null}
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection index={1}>
        <View style={styles.pillsRow}>
          <Pill
            label="streak"
            value={currentStreak}
            icon={<StreakFlame streak={currentStreak} size={18} />}
          />
          <Pill
            label="best"
            value={longestStreak}
            icon={<Ionicons name="trophy" size={14} color={colors.accentA} />}
          />
          <Pill
            label="total"
            value={calendarActiveDates.size}
            icon={<Ionicons name="checkmark-circle" size={14} color={colors.success} />}
          />
        </View>
        </AnimatedSection>

        <AnimatedSection index={2}>
        <GlassSurface style={styles.goalSection}>
          <Text style={styles.goalLabel}>{goalLabel}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: habit.color },
                  progressBarStyle,
                ]}
              />
            </View>
            <Text style={styles.progressCount}>
              {goalProgress.done}/{goalProgress.target}
            </Text>
          </View>
          <Text
            style={[
              styles.goalStatus,
              goalProgress.isComplete && { color: habit.color },
            ]}
          >
            {statusText}
          </Text>
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={3}>
        <GlassSurface style={styles.calendarSection}>
          <View style={styles.monthHeader}>
            <PressFeedback onPress={handlePrevMonth} style={styles.monthButton} depth={0.85} haptic>
              <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
            </PressFeedback>
            <Text style={styles.monthTitle}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <PressFeedback onPress={handleNextMonth} style={styles.monthButton} depth={0.85} haptic>
              <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
            </PressFeedback>
          </View>

          <CalendarMonth
            month={currentMonth}
            activeDates={calendarActiveDates}
            color={habit.color}
            onToggleDate={handleToggleDate}
          />
        </GlassSurface>
        </AnimatedSection>

        <AnimatedSection index={4}>
        {!hasCompletionsInMonth ? (
          <Text style={styles.hint}>Tip: Tap a day to mark it done.</Text>
        ) : <View style={{ height: 12 }} />}

        <AnimatedPressable
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete habit?',
              "This will permanently delete the habit and all history. This can't be undone.",
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    hapticWarning();
                    try {
                      await deleteHabit(habitId);
                      navigation.goBack();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete habit');
                    }
                  },
                },
              ]
            );
          }}
          scaleValue={0.98}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Habit</Text>
        </AnimatedPressable>
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  habitName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  milestoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  milestoneBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  habitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  goalSection: {
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: -0.1,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.glassStrong,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    minWidth: 2,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    minWidth: 30,
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textFaint,
    marginTop: 8,
  },
  calendarSection: {
    marginHorizontal: 16,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: radii.card,
    backgroundColor: colors.danger + '12',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.danger,
  },
});
