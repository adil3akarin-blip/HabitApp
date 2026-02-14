import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { subDays } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import AnimatedListItem from '../components/AnimatedListItem';
import AnimatedSection from '../components/AnimatedSection';
import HabitCard from '../components/HabitCard';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import GlassHeader from '../components/ui/GlassHeader';
import GlassSurface from '../components/ui/GlassSurface';
import { toISODate, todayISO } from '../domain/dates';
import { Habit } from '../domain/models';
import { useHabitsStore } from '../state/useHabitsStore';
import { colors, radii } from '../theme/tokens';
import { hapticSuccess } from '../utils/haptics';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { habits, isLoading, refresh, toggleToday, incrementToday, resetTodayCount, completionsByHabitId, countsByHabitId, gridRangeDays, seedSampleHabits } = useHabitsStore();
  const [isSeeding, setIsSeeding] = useState(false);

  const { startISO, endISO } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, gridRangeDays);
    return {
      startISO: toISODate(start),
      endISO: toISODate(end),
    };
  }, [gridRangeDays]);

  const { todaySummary, todayDone } = useMemo(() => {
    const today = todayISO();
    let done = 0;
    habits.forEach((h) => {
      const isDailyMulti = h.goalPeriod === 'day' && h.goalTarget > 1;
      if (isDailyMulti) {
        const count = countsByHabitId[h.id]?.[today] || 0;
        if (count >= h.goalTarget) done++;
      } else {
        const completions = completionsByHabitId[h.id];
        if (completions?.has(today)) done++;
      }
    });
    const allDone = done === habits.length && habits.length > 0;
    const summary = allDone
      ? 'All done! Great job today.'
      : `${habits.length - done} remaining today`;
    return { todaySummary: summary, todayDone: done };
  }, [habits, completionsByHabitId, countsByHabitId]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Late night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const renderHabitCard = useCallback(
    ({ item: habit, index }: { item: Habit; index: number }) => {
      const completions = completionsByHabitId[habit.id] || new Set<string>();
      const counts = countsByHabitId[habit.id] || {};
      const today = todayISO();
      return (
        <AnimatedListItem index={index}>
          <HabitCard
            habit={habit}
            completions={completions}
            counts={counts}
            todayCount={counts[today] || 0}
            startISO={startISO}
            endISO={endISO}
            onToggleToday={() => toggleToday(habit.id)}
            onIncrementToday={() => incrementToday(habit.id)}
            onResetToday={() => resetTodayCount(habit.id)}
            onPress={() => navigation.navigate('HabitDetails', { habitId: habit.id })}
            onLongPress={() => navigation.navigate('HabitForm', { habitId: habit.id })}
          />
        </AnimatedListItem>
      );
    },
    [completionsByHabitId, countsByHabitId, startISO, endISO, toggleToday, incrementToday, resetTodayCount, navigation]
  );

  const handleSeedSamples = async () => {
    setIsSeeding(true);
    try {
      await seedSampleHabits();
      hapticSuccess();
    } finally {
      setIsSeeding(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AnimatedSection index={0} style={{ width: '100%' }}>
      <GlassSurface style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="leaf-outline" size={28} color={colors.accentA} />
        </View>
        <Text style={styles.emptyTitle}>No habits yet</Text>
        <Text style={styles.emptySubtitle}>
          Start building consistency.{'\n'}Create your first habit in seconds.
        </Text>
        
        <AnimatedPressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('HabitForm')}
          scaleValue={0.98}
        >
          <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Create habit</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.secondaryButton}
          onPress={handleSeedSamples}
          scaleValue={0.98}
          disabled={isSeeding}
        >
          {isSeeding ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <>
              <Ionicons name="flash-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.secondaryButtonText}>Add sample habits</Text>
            </>
          )}
        </AnimatedPressable>
      </GlassSurface>
      </AnimatedSection>
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
      <GlassHeader
        title={greeting}
        subtitle={habits.length > 0 ? todaySummary : undefined}
        progressDone={habits.length > 0 ? todayDone : undefined}
        progressTotal={habits.length > 0 ? habits.length : undefined}
        progressColor={colors.accentA}
        rightAction={
          <AnimatedPressable
            style={styles.addButton}
            onPress={() => navigation.navigate('HabitForm')}
            scaleValue={0.9}
          >
            <Ionicons name="add" size={22} color={colors.bg} />
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
    paddingHorizontal: 24,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentA + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentA,
    borderRadius: radii.button,
    paddingVertical: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentA,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
