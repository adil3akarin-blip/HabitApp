import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/app/navigation/AppNavigator';
import { runMigrations } from './src/db/migrations';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await runMigrations();
        setIsReady(true);
      } catch (error) {
        console.error('Migration error:', error);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
