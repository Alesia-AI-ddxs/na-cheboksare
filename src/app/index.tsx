// Стартовая развилка: язык ещё не выбран → экран выбора языка; первый запуск → пролог; иначе → маршрут.
import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useGame } from '../state/game';

export default function Index() {
  const { ready, p, pal, langChosen } = useGame();
  if (!ready) return <View style={{ flex: 1, backgroundColor: pal.paper }} />;
  if (!langChosen) return <Redirect href="/language" />;
  return <Redirect href={p.started ? '/route' : '/prologue'} />;
}
