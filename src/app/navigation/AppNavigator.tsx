import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidTabs from '../../components/LiquidTabs';
import * as appMetaRepo from '../../db/appMetaRepo';
import OnboardingScreen from '../../screens/OnboardingScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import { colors } from '../../theme/tokens';
import HomeStack, { getTabBarVisibility } from './HomeStack';

export type RootTabParamList = {
  HomeTab: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function LiquidTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index].name;
  
  const homeTabRoute = state.routes.find((r: any) => r.name === 'HomeTab');
  const isTabBarVisible = homeTabRoute ? getTabBarVisibility(homeTabRoute) : true;

  if (!isTabBarVisible) {
    return null;
  }

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
            icon={<Ionicons name={currentRoute === 'HomeTab' ? 'home' : 'home-outline'} size={20} color={currentRoute === 'HomeTab' ? '#F5F0E8' : 'rgba(245,240,232,0.4)'} />}
          >
            Home
          </LiquidTabs.Trigger>
          <LiquidTabs.Trigger
            value="Settings"
            icon={<Ionicons name={currentRoute === 'Settings' ? 'settings' : 'settings-outline'} size={20} color={currentRoute === 'Settings' ? '#F5F0E8' : 'rgba(245,240,232,0.4)'} />}
          >
            Settings
          </LiquidTabs.Trigger>
        </LiquidTabs.List>
      </LiquidTabs.Root>
    </View>
  );
}

function TabsNavigator() {
  return (
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
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await appMetaRepo.getBool('onboardingCompleted');
      setShowOnboarding(!completed);
    } catch (e) {
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentA} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <TabsNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
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
