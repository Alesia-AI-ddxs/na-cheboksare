// Пролог / первый запуск: название, цитата летописи, текущий язык (смена — экран /language), режим игры, код, «Начать».
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Btn, Card, H, P, Screen } from '../components/ui';
import { CodeBox } from '../components/CodeBox';
import { FalconMark, HomeIcon, WalkIcon } from '../components/Icons';
import { Vignette } from '../components/Vignette';
import { byCode, isDraft, paragraphs } from '../i18n';
import { Mode, useGame } from '../state/game';

export default function Prologue() {
  const { pal, f, t, p, lang, setMode, start, dir } = useGame();
  const cur = byCode(lang);
  const quote = paragraphs(t('ui.splash_quote'));

  const onStart = () => {
    start();
    router.replace('/route');
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 18 }}>
        <FalconMark size={44} />
        <H size={30} style={{ marginTop: 8, textAlign: 'center', letterSpacing: f.spacing ? 1 : 0 }} testID="title">
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
                ? { marginTop: 6, color: pal.muted, fontSize: 13, textAlign: dir.end }
                : { fontFamily: f.display, fontSize: 17, lineHeight: 26 }
            }
          >
            {line}
          </P>
        ))}
      </Card>

      {/* язык: текущий вариант (эндоним) и переход к экрану выбора */}
      <Card>
        <H>{t('ui.lang_choose')}</H>
        <Pressable
          testID="open-language"
          accessibilityRole="button"
          accessibilityLabel={t('ui.lang_short')}
          onPress={() => router.push('/language?from=prologue')}
          style={{
            marginTop: 10,
            minHeight: 52,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: pal.gold,
            backgroundColor: pal.dark ? '#2A2410' : '#F4EBD6',
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text testID="current-lang" style={{ color: pal.ink, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700', fontSize: 16 }}>
              {cur?.endonym ?? lang}
            </Text>
            {isDraft(lang) ? <Text style={{ color: pal.muted, fontSize: 10.5, fontFamily: f.body }}>{t('ui.lang_draft_badge')}</Text> : null}
          </View>
          <Text style={{ color: pal.muted, fontSize: 13, fontFamily: f.body }}>{t('ui.lang_short')}</Text>
          <Text style={{ color: pal.ink, fontSize: 16 }}>{dir.fwd}</Text>
        </Pressable>
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
