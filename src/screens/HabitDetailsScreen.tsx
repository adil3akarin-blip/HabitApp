import React, { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths } from 'date-fns';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import { useHabitsStore } from '../state/useHabitsStore';
import CalendarMonth from '../components/CalendarMonth';
import { computeStreak, computeLongestStreak } from '../domain/streaks';
import { todayISO } from '../domain/dates';
import { cancelHabitReminder } from '../domain/notifications';
import { colors, radii, shadow } from '../theme/tokens';
import GlassSurface from '../components/ui/GlassSurface';
import Pill from '../components/ui/Pill';
import { hapticWarning } from '../utils/haptics';
import AnimatedPressable from '../components/ui/AnimatedPressable';

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
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.bg, '#0D1117', colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: habit.color + '30' }]}>
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
          </View>
        </View>

        <View style={styles.pillsRow}>
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
        </View>

        <GlassSurface style={styles.calendarSection}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
              <Ionicons name="chevron-back" size={24} color={colors.accentB} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
              <Ionicons name="chevron-forward" size={24} color={colors.accentB} />
            </TouchableOpacity>
          </View>

          <CalendarMonth
            month={currentMonth}
            activeDates={completions}
            color={habit.color}
            onToggleDate={handleToggleDate}
          />
        </GlassSurface>

        <Text style={styles.hint}>Tap any day to toggle completion</Text>

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
