import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HabitDetailsScreen from '../../screens/HabitDetailsScreen';
import HabitFormScreen from '../../screens/HabitFormScreen';
import HomeScreen from '../../screens/HomeScreen';
import { colors } from '../../theme/tokens';

export type HomeStackParamList = {
  Home: undefined;
  HabitForm: { habitId?: string } | undefined;
  HabitDetails: { habitId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function getTabBarVisibility(route: any): boolean {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  const hideOnScreens = ['HabitForm', 'HabitDetails'];
  return !hideOnScreens.includes(routeName);
}

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HabitForm" 
        component={HabitFormScreen}
        options={{
          title: 'New Habit',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="HabitDetails" 
        component={HabitDetailsScreen}
        options={{ title: 'Habit Details' }}
      />
    </Stack.Navigator>
  );
}
