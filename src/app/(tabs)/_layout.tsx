// Нижние вкладки: Маршрут · Находки · Сетнер · О проекте.
// Подписи — из content.json (ui.tab_*), при отсутствии — запасные ключи.
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { TabIcon } from '../../components/Icons';
import { useGame } from '../../state/game';
import { tFirst } from '../../i18n';

export default function TabsLayout() {
  const { pal, f, lang } = useGame();
  const label = (keys: string[]) => tFirst(keys, lang);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: pal.gold,
        tabBarInactiveTintColor: pal.muted,
        tabBarStyle: { backgroundColor: pal.panel, borderTopColor: pal.line, minHeight: 60 },
        tabBarLabelStyle: { fontFamily: f.body, fontSize: 11.5 },
        sceneStyle: { backgroundColor: pal.paper },
      }}
    >
      <Tabs.Screen
        name="route"
        options={{
          title: label(['ui.tab_route', 'ui.map']),
          tabBarIcon: ({ color }) => <TabIcon name="route" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="finds"
        options={{
          title: label(['ui.tab_finds', 'ui.collection']),
          tabBarIcon: ({ color }) => <TabIcon name="finds" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="setner"
        options={{
          title: label(['ui.tab_setner', 'spk.setner']),
          tabBarIcon: ({ color }) => <TabIcon name="setner" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: label(['ui.tab_about', 'ui.about']),
          tabBarIcon: ({ color }) => <TabIcon name="about" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
