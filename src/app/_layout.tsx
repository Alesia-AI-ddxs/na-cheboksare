// Корневой макет: шрифты, состояние игры, стек экранов.
// Первым импортом — метка старта для «Лаборатории замеров» (две цифры в памяти, на работу не влияет).
import { markFirstScreen } from '../lab/startup';
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
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => undefined);
    requestAnimationFrame(() => markFirstScreen()); // первый экран показан — для замера холодного старта
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
  // Фирменная пара (латиница + кириллица всех языков реестра). Файлы берём поштучно — без лишних начертаний.
  // Шрифты остальных письменностей грузятся только для выбранного языка (src/i18n/fonts.ts).
  const [loaded, error] = useFonts({
    Prata_400Regular: require('@expo-google-fonts/prata/400Regular/Prata_400Regular.ttf'),
    PTSans_400Regular: require('@expo-google-fonts/pt-sans/400Regular/PTSans_400Regular.ttf'),
    PTSans_700Bold: require('@expo-google-fonts/pt-sans/700Bold/PTSans_700Bold.ttf'),
  });
  return (
    <SafeAreaProvider>
      <GameProvider fontsLoaded={loaded && !error}>
        <Shell />
      </GameProvider>
    </SafeAreaProvider>
  );
}
