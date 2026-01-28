import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStack from './HomeStack';
import SettingsScreen from '../../screens/SettingsScreen';
import { colors } from '../../theme/tokens';
import LiquidTabs from '../../components/LiquidTabs';

export type RootTabParamList = {
  HomeTab: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function LiquidTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index].name;

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 8 }]}>
      <LiquidTabs.Root
        value={currentRoute}
        onValueChange={(value) => {
          const event = navigation.emit({
            type: 'tabPress',
            target: value,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            navigation.navigate(value);
          }
        }}
        variant="dark"
      >
        <LiquidTabs.List style={styles.tabList}>
          <LiquidTabs.Trigger
            value="HomeTab"
            icon={<Ionicons name={currentRoute === 'HomeTab' ? 'home' : 'home-outline'} size={18} color="inherit" />}
          >
            Home
          </LiquidTabs.Trigger>
          <LiquidTabs.Trigger
            value="Settings"
            icon={<Ionicons name={currentRoute === 'Settings' ? 'settings' : 'settings-outline'} size={18} color="inherit" />}
          >
            Settings
          </LiquidTabs.Trigger>
        </LiquidTabs.List>
      </LiquidTabs.Root>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <LiquidTabBar {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bg,
          },
          headerTintColor: colors.text,
        }}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack}
          options={{ 
            title: 'Home',
            headerShown: false 
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Settings',
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  tabList: {
    alignSelf: 'center',
  },
});
