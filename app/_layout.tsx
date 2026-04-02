import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { logger, installGlobalErrorHandler } from '../lib/logger';
import FeedbackWidget from '../components/FeedbackWidget';

export default function RootLayout() {
  useEffect(() => {
    installGlobalErrorHandler();
    logger.info('App started');
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="prompt-editor"
          options={{
            presentation: 'modal',
            title: 'Edit Prompt',
            headerStyle: { backgroundColor: '#fafafa' },
          }}
        />
        <Stack.Screen
          name="schema-viewer"
          options={{
            presentation: 'modal',
            title: 'Schema',
            headerStyle: { backgroundColor: '#fafafa' },
          }}
        />
      </Stack>
      <FeedbackWidget />
    </View>
  );
}
