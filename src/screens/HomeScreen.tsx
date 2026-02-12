import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { subDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import HabitCard from '../components/HabitCard';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import EmptyState from '../components/ui/EmptyState';
import GlassHeader from '../components/ui/GlassHeader';
import ProgressRing from '../components/ui/ProgressRing';
import { toISODate, todayISO } from '../domain/dates';
import { Habit } from '../domain/models';
import { useHabitsStore } from '../state/useHabitsStore';
import { colors } from '../theme/tokens';
import { STAGGER_DELAY, springGentle } from '../ui/motion';
import { getGreeting, getProgressMessage } from '../utils/microcopy';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

function StaggerItem({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(
      index * STAGGER_DELAY,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      index * STAGGER_DELAY,
      withSpring(0, springGentle),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

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

  const { done, total } = useMemo(() => {
    const today = todayISO();
    let d = 0;
    habits.forEach((h) => {
      const completions = completionsByHabitId[h.id];
      if (completions?.has(today)) d++;
    });
    return { done: d, total: habits.length };
  }, [habits, completionsByHabitId]);

  const greeting = useMemo(() => getGreeting(), []);
  const progressMsg = useMemo(() => getProgressMessage(done, total), [done, total]);

  useEffect(() => {
    refresh();
  }, []);

  const renderHabitCard = useCallback(
    ({ item: habit, index }: { item: Habit; index: number }) => {
      const completions = completionsByHabitId[habit.id] || new Set<string>();
      return (
        <StaggerItem index={index}>
          <HabitCard
            habit={habit}
            completions={completions}
            startISO={startISO}
            endISO={endISO}
            onToggleToday={() => toggleToday(habit.id)}
            onPress={() => navigation.navigate('HabitDetails', { habitId: habit.id })}
            onLongPress={() => navigation.navigate('HabitForm', { habitId: habit.id })}
          />
        </StaggerItem>
      );
    },
    [completionsByHabitId, startISO, endISO, toggleToday, navigation]
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="sparkles"
      title="Your journey starts here"
      subtitle="Create your first habit and start building the life you want, one day at a time."
    />
  );

  if (isLoading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.bg, '#0D1117', colors.bg]}
          style={StyleSheet.absoluteFill}
        />
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
        title={greeting}
        subtitle={habits.length > 0 ? progressMsg : undefined}
        rightAction={
          <View style={styles.headerRight}>
            {habits.length > 0 && (
              <ProgressRing done={done} total={total} />
            )}
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
          </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
