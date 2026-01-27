import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../app/navigation/HomeStack';
import { useHabitsStore } from '../state/useHabitsStore';
import HabitCard from '../components/HabitCard';
import { toISODate } from '../domain/dates';
import { subDays } from 'date-fns';
import { Habit } from '../domain/models';

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
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('HabitForm')}
      >
        <Text style={styles.createButtonText}>Create habit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.header}>HabitGrid</Text>
      {habits.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('HabitForm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitCard}
        ListHeaderComponent={renderHeader}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  list: {
    padding: 20,
  },
  emptyList: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
