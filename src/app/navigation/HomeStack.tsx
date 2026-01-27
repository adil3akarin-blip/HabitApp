import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreen';
import HabitFormScreen from '../../screens/HabitFormScreen';
import HabitDetailsScreen from '../../screens/HabitDetailsScreen';

export type HomeStackParamList = {
  Home: undefined;
  HabitForm: { habitId?: string } | undefined;
  HabitDetails: { habitId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HabitForm" 
        component={HabitFormScreen}
        options={{ title: 'New Habit' }}
      />
      <Stack.Screen 
        name="HabitDetails" 
        component={HabitDetailsScreen}
        options={{ title: 'Habit Details' }}
      />
    </Stack.Navigator>
  );
}
