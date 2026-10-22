// Верхняя полоса экрана точки/финала: «назад», название, очки.
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useGame } from '../state/game';
import { MAX_W } from '../theme';

export function TopBar({ title, backLabel, onBack }: { title: string; backLabel: string; onBack?: () => void }) {
  const { pal, f, p, dir, num } = useGame();
  return (
    <View style={{ borderBottomWidth: 1, borderColor: pal.line, backgroundColor: pal.paper }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          minHeight: 52,
          width: '100%',
          maxWidth: MAX_W,
          alignSelf: 'center',
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/route'))}
          style={{ minHeight: 48, justifyContent: 'center', paddingEnd: 4, maxWidth: '38%' }}
        >
          <Text numberOfLines={1} style={{ color: pal.ink, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700', fontSize: 14 }}>
            {dir.back} {backLabel}
          </Text>
        </Pressable>
        <Text numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontFamily: f.display, fontSize: 15, color: pal.ink }}>
          {title}
        </Text>
        <Text style={{ color: pal.gold, fontWeight: '700', fontSize: 14, fontVariant: ['tabular-nums'] }} accessibilityLabel={`${num(p.score)} ★`}>
          {num(p.score)} ★
        </Text>
      </View>
    </View>
  );
}
