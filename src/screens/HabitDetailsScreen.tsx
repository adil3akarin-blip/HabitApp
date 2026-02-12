import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addMonths, format, subMonths } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import CalendarMonth from '../components/CalendarMonth';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import GlassSurface from '../components/ui/GlassSurface';
import Pill from '../components/ui/Pill';
import { todayISO } from '../domain/dates';
import { cancelHabitReminder } from '../domain/notifications';
import { computeLongestStreak, computeStreak } from '../domain/streaks';
import { useHabitsStore } from '../state/useHabitsStore';
import { colors, radii } from '../theme/tokens';
import { springGentle } from '../ui/motion';
import { hapticSelection, hapticWarning } from '../utils/haptics';
import { getStreakMessage } from '../utils/microcopy';

type HabitDetailsScreenProps = {
  route: RouteProp<HomeStackParamList, 'HabitDetails'>;
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HabitDetails'>;
};

export default function HabitDetailsScreen({ route, navigation }: HabitDetailsScreenProps) {
  const { habitId } = route.params;
  const { habits, completionsByHabitId, toggleDate, archiveHabit, deleteHabit } = useHabitsStore();
  
  const habit = habits.find((h) => h.id === habitId);
  const completions = completionsByHabitId[habitId] || new Set<string>();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(16);
  const calendarOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withSpring(0, springGentle);

    statsOpacity.value = withDelay(150, withTiming(1, { duration: 300 }));
    statsTranslateY.value = withDelay(150, withSpring(0, springGentle));

    calendarOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));

  const calendarStyle = useAnimatedStyle(() => ({
    opacity: calendarOpacity.value,
  }));

  useLayoutEffect(() => {
    if (habit) {
      navigation.setOptions({
        title: habit.name,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('HabitForm', { habitId })}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={20} color={colors.accentB} />
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
    hapticSelection();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    hapticSelection();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleToggleDate = (dateISO: string) => {
    toggleDate(habitId, dateISO);
  };

  const currentStreak = useMemo(() => {
    return computeStreak(habit, completions, todayISO());
  }, [habit, completions]);

  const longestStreak = useMemo(() => {
    return computeLongestStreak(completions);
  }, [completions]);

  const streakMessage = useMemo(() => {
    return getStreakMessage(currentStreak);
  }, [currentStreak]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.bg, '#0D1117', colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={headerStyle}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
              <View style={[styles.iconGlow, { backgroundColor: habit.color + '10' }]} />
              <Ionicons
                name={habit.icon as keyof typeof Ionicons.glyphMap}
                size={32}
                color={habit.color}
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              {habit.description ? (
                <Text style={styles.habitDescription}>{habit.description}</Text>
              ) : null}
              {streakMessage ? (
                <Text style={[styles.streakMessage, { color: habit.color }]}>
                  {streakMessage}
                </Text>
              ) : null}
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.pillsRow, statsStyle]}>
          <Pill
            label="streak"
            value={currentStreak}
            icon={<Ionicons name="flame" size={14} color={colors.accentA} />}
          />
          <Pill
            label="best"
            value={longestStreak}
            icon={<Ionicons name="trophy" size={14} color={colors.accentB} />}
          />
          <Pill
            label="total"
            value={completions.size}
            icon={<Ionicons name="checkmark-circle" size={14} color={habit.color} />}
          />
        </Animated.View>

        <Animated.View style={calendarStyle}>
          <GlassSurface style={styles.calendarSection}>
            <View style={styles.monthHeader}>
              <AnimatedPressable onPress={handlePrevMonth} style={styles.monthButton} scaleValue={0.85} haptic={false}>
                <Ionicons name="chevron-back" size={24} color={colors.accentB} />
              </AnimatedPressable>
              <Text style={styles.monthTitle}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <AnimatedPressable onPress={handleNextMonth} style={styles.monthButton} scaleValue={0.85} haptic={false}>
                <Ionicons name="chevron-forward" size={24} color={colors.accentB} />
              </AnimatedPressable>
            </View>

            <CalendarMonth
              month={currentMonth}
              activeDates={completions}
              color={habit.color}
              onToggleDate={handleToggleDate}
            />
          </GlassSurface>

          <Text style={styles.hint}>Tap any day to toggle completion</Text>
        </Animated.View>

        <AnimatedPressable
          style={styles.archiveButton}
          onPress={() => {
            Alert.alert(
              'Archive Habit',
              'Are you sure you want to archive this habit? It will be hidden from your Home screen.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Archive',
                  style: 'destructive',
                  onPress: async () => {
                    hapticWarning();
                    await archiveHabit(habitId);
                    navigation.goBack();
                  },
                },
              ]
            );
          }}
          scaleValue={0.98}
        >
          <Ionicons name="archive-outline" size={20} color={colors.danger} />
          <Text style={styles.archiveButtonText}>Archive Habit</Text>
        </AnimatedPressable>

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
                      if (habit.reminderNotifId) {
                        await cancelHabitReminder(habit.reminderNotifId);
                      }
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
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Habit</Text>
        </AnimatedPressable>
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
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  headerInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  habitDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  streakMessage: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
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
    borderRadius: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: radii.card,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  archiveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.danger,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.danger,
  },
});
