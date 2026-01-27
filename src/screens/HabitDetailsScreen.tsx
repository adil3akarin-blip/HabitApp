import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../app/navigation/HomeStack';

type HabitDetailsScreenProps = {
  route: RouteProp<HomeStackParamList, 'HabitDetails'>;
};

export default function HabitDetailsScreen({ route }: HabitDetailsScreenProps) {
  const { habitId } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Details</Text>
      <Text style={styles.placeholder}>Details for habit: {habitId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
  },
});
