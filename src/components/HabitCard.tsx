import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../domain/models';
import HabitGrid from './HabitGrid';
import { todayISO } from '../domain/dates';

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

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: habit.color }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={habit.icon as keyof typeof Ionicons.glyphMap}
            size={24}
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
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: isCompletedToday ? habit.color : '#E5E5E5' },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleToday();
          }}
        >
          <Text style={styles.toggleText}>
            {isCompletedToday ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
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
    </TouchableOpacity>
  );
}

export default React.memo(HabitCard);

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
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
    color: '#1a1a1a',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  gridContainer: {
    marginTop: 12,
    overflow: 'hidden',
  },
});
