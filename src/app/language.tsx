// Экран выбора языка (языковой модуль). Открывается при первом запуске и из пролога / «О проекте».
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import { useGame } from '../state/game';

export default function LanguageRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { p } = useGame();
  const done = () => {
    if (from && router.canGoBack()) router.back();
    else router.replace(p.started ? '/route' : '/prologue');
  };
  return <LanguageSelectScreen onDone={done} onBack={from ? () => (router.canGoBack() ? router.back() : done()) : undefined} />;
}
