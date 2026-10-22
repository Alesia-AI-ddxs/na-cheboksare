// Корневой макет: шрифты, состояние игры, стек экранов.
import { Prata_400Regular } from '@expo-google-fonts/prata';
import { PTSans_400Regular, PTSans_700Bold } from '@expo-google-fonts/pt-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGame } from '../state/game';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Shell() {
  const { pal, ready } = useGame();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  return (
    <View style={{ flex: 1, backgroundColor: pal.paper }}>
      <StatusBar style={pal.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: pal.paper } }} />
    </View>
  );
}

export default function RootLayout() {
  // Если шрифты не загрузятся — приложение всё равно работает на системных.
  const [loaded, error] = useFonts({ Prata_400Regular, PTSans_400Regular, PTSans_700Bold });
  return (
    <SafeAreaProvider>
      <GameProvider fontsLoaded={loaded && !error}>
        <Shell />
      </GameProvider>
    </SafeAreaProvider>
  );
}
