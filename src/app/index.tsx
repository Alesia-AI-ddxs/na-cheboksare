// Стартовая развилка: первый запуск → пролог, иначе → маршрут.
import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useGame } from '../state/game';

export default function Index() {
  const { ready, p, pal } = useGame();
  if (!ready) return <View style={{ flex: 1, backgroundColor: pal.paper }} />;
  return <Redirect href={p.started ? '/route' : '/prologue'} />;
}
