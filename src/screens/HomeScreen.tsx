import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import { useHabitsStore } from '../state/useHabitsStore';
import HabitCard from '../components/HabitCard';
import { toISODate, todayISO } from '../domain/dates';
import { subDays } from 'date-fns';
import { Habit } from '../domain/models';
import { colors } from '../theme/tokens';
import GlassHeader from '../components/ui/GlassHeader';
import AnimatedPressable from '../components/ui/AnimatedPressable';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { habits, isLoading, refresh, toggleToday, completionsByHabitId, gridRangeDays } = useHabitsStore();

  const { startISO, endISO } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, gridRangeDays);
    return {
      startISO: toISODate(start),
      endISO: toISODate(end),
    };
  }, [gridRangeDays]);

  const todaySummary = useMemo(() => {
    const today = todayISO();
    let done = 0;
    habits.forEach((h) => {
      const completions = completionsByHabitId[h.id];
      if (completions?.has(today)) done++;
    });
    return `${done}/${habits.length} done today`;
  }, [habits, completionsByHabitId]);

  useEffect(() => {
    refresh();
  }, []);

  const renderHabitCard = useCallback(
    ({ item: habit }: { item: Habit }) => {
      const completions = completionsByHabitId[habit.id] || new Set<string>();
      return (
        <HabitCard
          habit={habit}
          completions={completions}
          startISO={startISO}
          endISO={endISO}
          onToggleToday={() => toggleToday(habit.id)}
          onPress={() => navigation.navigate('HabitDetails', { habitId: habit.id })}
          onLongPress={() => navigation.navigate('HabitForm', { habitId: habit.id })}
        />
      );
    },
    [completionsByHabitId, startISO, endISO, toggleToday, navigation]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No habits yet</Text>
      <Text style={styles.emptySubtext}>Tap the + button to create your first habit</Text>
    </View>
  );

  if (isLoading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentA} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.bg, '#0D1117', colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <GlassHeader
        title="Habits"
        subtitle={habits.length > 0 ? todaySummary : undefined}
        rightAction={
          <AnimatedPressable
            style={styles.addButton}
            onPress={() => navigation.navigate('HabitForm')}
            scaleValue={0.9}
          >
            <LinearGradient
              colors={[colors.accentA, colors.accentB]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </LinearGradient>
          </AnimatedPressable>
        }
      />
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitCard}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={habits.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  addButton: {
    shadowColor: colors.accentA,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
