import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { logger, installGlobalErrorHandler } from '../lib/logger';

export default function RootLayout() {
  useEffect(() => {
    installGlobalErrorHandler();
    logger.info('App started');
  }, []);

  return (
    <>
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
    </>
  );
}
