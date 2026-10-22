// Блок с кодом прохождения ND-XXXX и кнопкой «скопировать» (значок, без текста).
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useGame } from '../state/game';
import { CheckIcon, CopyIcon } from './Icons';

export function CodeBox() {
  const { pal, f, p, t } = useGame();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(p.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <View
      style={{
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: pal.line,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: pal.muted, fontSize: 13.5, fontFamily: f.body, flexShrink: 1 }}>{t('ui.code')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text testID="game-code" selectable style={{ fontSize: 17, fontWeight: '700', color: pal.ink, letterSpacing: 1.6, fontVariant: ['tabular-nums'] }}>
          {p.code}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ui.code')}
          onPress={copy}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Pressable>
      </View>
    </View>
  );
}
