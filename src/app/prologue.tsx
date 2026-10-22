// Пролог / первый запуск: название, цитата летописи, выбор языка, режим игры, код, «Начать».
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Btn, Card, H, P, Screen, Tag } from '../components/ui';
import { CodeBox } from '../components/CodeBox';
import { FalconMark, HomeIcon, WalkIcon } from '../components/Icons';
import { Vignette } from '../components/Vignette';
import { content } from '../content';
import { paragraphs } from '../i18n';
import { Mode, useGame } from '../state/game';

export default function Prologue() {
  const { pal, f, t, p, setLang, setMode, start } = useGame();
  const quote = paragraphs(t('ui.splash_quote'));

  const onStart = () => {
    start();
    router.replace('/route');
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 18 }}>
        <FalconMark size={44} />
        <H size={30} style={{ marginTop: 8, textAlign: 'center', letterSpacing: 1 }} testID="title">
          {t('ui.title')}
        </H>
      </View>

      <Vignette kind="night" />

      <Card>
        {quote.map((line, i) => (
          <P
            key={i}
            style={
              i === quote.length - 1 && quote.length > 1
                ? { marginTop: 6, color: pal.muted, fontSize: 13, textAlign: 'right' }
                : { fontFamily: f.display, fontSize: 17, lineHeight: 26 }
            }
          >
            {line}
          </P>
        ))}
      </Card>

      {/* язык */}
      <Card>
        <H>{t('ui.lang_question')}</H>
        <View style={{ marginTop: 10, gap: 8 }}>
          {content.languages.map((l) => {
            const sel = p.lang === l.code;
            return (
              <Pressable
                key={l.code}
                testID={`lang-${l.code}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel, disabled: !l.ready }}
                disabled={!l.ready}
                onPress={() => setLang(l.code)}
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: sel ? pal.gold : pal.line,
                  backgroundColor: sel ? (pal.dark ? '#2A2410' : '#F4EBD6') : 'transparent',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  opacity: l.ready ? 1 : 0.55,
                }}
              >
                <Text style={{ flex: 1, color: pal.ink, fontFamily: sel ? f.bold : f.body, fontWeight: sel && !f.bold ? '700' : undefined, fontSize: 15 }}>
                  {l.name}
                </Text>
                <Text style={{ color: pal.muted, fontSize: 12, fontFamily: f.body }}>{l.code}</Text>
                {!l.ready ? <Tag label={t('ui.soon')} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* режим и код */}
      <Card>
        <H>{t('ui.mode_question')}</H>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          {(['here', 'remote'] as Mode[]).map((m) => {
            const sel = p.mode === m;
            return (
              <Pressable
                key={m}
                testID={`mode-${m}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                onPress={() => setMode(m)}
                style={{
                  flex: 1,
                  minHeight: 88,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: sel ? pal.gold : pal.line,
                  backgroundColor: sel ? (pal.dark ? '#2A2410' : '#F4EBD6') : pal.panel,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  gap: 6,
                }}
              >
                {m === 'here' ? <WalkIcon /> : <HomeIcon />}
                <Text style={{ color: pal.ink, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700', fontSize: 15, textAlign: 'center' }}>
                  {t(m === 'here' ? 'ui.here' : 'ui.remote')}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <CodeBox />
        <Btn testID="start" label={t('ui.start')} onPress={onStart} style={{ marginTop: 12 }} />
      </Card>
    </Screen>
  );
}
