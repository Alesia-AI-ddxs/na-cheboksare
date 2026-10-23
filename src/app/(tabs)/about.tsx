// Вкладка «О проекте»: что это, три слоя достоверности, источники, факты по точкам, версия контента,
// приватность, ссылки, смена языка и сброс прогресса.
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { FalconMark } from '../../components/Icons';
import { Btn, Card, Expander, H, LayerChip, P, Screen } from '../../components/ui';
import { content, Fact } from '../../content';
import { LAB_CONFIG } from '../../lab/config';
import { byCode, formatDate, paragraphs } from '../../i18n';
import { setnerLink } from '../../setnerLink';
import { openUrl } from '../../share';
import { useGame } from '../../state/game';

export default function AboutTab() {
  const { pal, f, t, tOpt, reset, lang, voice, p } = useGame();
  const [confirm, setConfirm] = useState(false);
  // Подсказка «установить на iPhone»: только в браузере и только если сайт ещё не открыт как приложение.
  // Проверяем после загрузки страницы (на этапе сборки окна браузера нет).
  const [showPwaHint, setShowPwaHint] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const standalone =
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setShowPwaHint(!standalone);
  }, []);
  // скрытый вход в «Лабораторию замеров» (для владельца и тестировщиков): 7 касаний подряд по строке версии содержания
  const taps = useRef({ n: 0, at: 0 });
  const onVersionTap = () => {
    const nowMs = Date.now();
    const r = taps.current;
    r.n = nowMs - r.at <= LAB_CONFIG.entryTapGapMs ? r.n + 1 : 1;
    r.at = nowMs;
    if (r.n >= LAB_CONFIG.entryTaps) {
      r.n = 0;
      router.push('/lab');
    }
  };
  const aboutTitle = tOpt('ui.about_title') ?? t('ui.title');
  const aboutText = tOpt('ui.about_text');

  // факты по точкам, в порядке маршрута
  const byPoint = new Map<string, Fact[]>();
  content.facts.forEach((fc) => {
    const k = String(fc.point);
    byPoint.set(k, [...(byPoint.get(k) ?? []), fc]);
  });
  const orderedPointIds = content.stages.flatMap((s) => s.points.map(String));
  const factKeys = [...orderedPointIds.filter((k) => byPoint.has(k)), ...[...byPoint.keys()].filter((k) => !orderedPointIds.includes(k))];

  // версия содержания на языке гостя: номер и дата — из мастер-таблицы, дату пишет язык (ui.content_version, ICU)
  const [cy, cm, cd] = (content.contentDate ?? '').split('-').map(Number);
  const versionLine =
    content.contentVersionNumber && cy
      ? tOpt('ui.content_version', { version: content.contentVersionNumber, date: formatDate(new Date(cy, cm - 1, cd, 12), lang) })
      : undefined;

  const link = (url?: string, open?: string) =>
    url ? (
      <Pressable onPress={() => openUrl(open ?? url)} accessibilityRole="link" style={{ minHeight: 32, justifyContent: 'center' }}>
        <Text style={{ color: pal.volga, fontSize: 13, textDecorationLine: 'underline', fontFamily: f.body }} numberOfLines={2}>
          {url}
        </Text>
      </Pressable>
    ) : null;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <FalconMark size={40} />
        <H size={22} style={{ flex: 1 }}>
          {aboutTitle}
        </H>
      </View>
      <Card>
        {aboutText ? paragraphs(aboutText).map((x, i) => <P key={i} style={{ marginBottom: 6 }}>{x}</P>) : null}
        {versionLine ? (
          <Pressable testID="lab-tap" accessible={false} onPress={onVersionTap}>
            <P muted style={{ fontSize: 13 }} testID="content-version">
              {versionLine}
            </P>
          </Pressable>
        ) : null}
      </Card>

      {/* веб-версия: как поставить на экран «Домой» */}
      {showPwaHint ? (
        <Card>
          <View testID="pwa-hint">
            <P style={{ fontSize: 14 }}>{t('ui.pwa_hint')}</P>
          </View>
        </Card>
      ) : null}

      {/* слои достоверности */}
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <LayerChip layer="doc" label={t('layer.doc')} />
          <LayerChip layer="sci" label={t('layer.sci')} />
          <LayerChip layer="leg" label={t('ui.legend')} />
        </View>
      </Card>

      {/* язык: экран выбора (эндонимы, произношение); выбор запоминается */}
      <Btn
        testID="about-lang"
        kind="ghost"
        label={`${t('ui.lang_short')} · ${byCode(lang)?.endonym ?? lang}`}
        onPress={() => router.push('/language?from=about')}
        style={{ marginTop: 12 }}
      />

      {/* источники (на русском, как в мастер-таблице) */}
      <Card>
        <H>{t('ui.source')}</H>
        <Expander title={`${t('ui.source')} · ${content.sources.length}`}>
          <View style={{ gap: 10 }}>
            {content.sources.map((s) => (
              <View key={String(s.n)} style={{ borderTopWidth: 1, borderColor: pal.line, paddingTop: 8 }}>
                <Text style={{ color: pal.ink, fontSize: 13.5, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700' }}>
                  {s.n}. {s.title}
                </Text>
                {s.gives ? <Text style={{ color: pal.muted, fontSize: 12.5, marginTop: 2, fontFamily: f.body }}>{s.gives}</Text> : null}
                {s.status ? <Text style={{ color: pal.varya, fontSize: 12, marginTop: 2, fontFamily: f.body }}>{s.status}</Text> : null}
                {link(s.link)}
              </View>
            ))}
          </View>
        </Expander>
      </Card>

      {/* факты по точкам */}
      <Card>
        <H>{t('layer.doc')} · {t('layer.sci')}</H>
        {factKeys.map((k) => {
          const pt = content.points.find((x) => String(x.id) === k);
          const title = pt ? `${tOpt(pt.nameKey) ?? t('ui.soon')} · ${pt.era === 'today' ? t('ui.today') : pt.era}` : k;
          const list = byPoint.get(k) ?? [];
          return (
            <Expander key={k} title={`${title} · ${list.length}`}>
              <View style={{ gap: 10 }}>
                {list.map((fc) => (
                  <View key={String(fc.n)} style={{ borderTopWidth: 1, borderColor: pal.line, paddingTop: 8 }}>
                    <Text style={{ color: pal.muted, fontSize: 12, fontFamily: f.body }}>
                      {fc.year} · {fc.topic} · {fc.layer}
                    </Text>
                    <Text style={{ color: pal.ink, fontSize: 13.5, marginTop: 2, fontFamily: f.body, lineHeight: 19 }}>{fc.text}</Text>
                    <Text style={{ color: pal.muted, fontSize: 11.5, marginTop: 2, fontFamily: f.body }}>{fc.source}</Text>
                    {link(fc.link)}
                  </View>
                ))}
              </View>
            </Expander>
          );
        })}
      </Card>

      {/* приватность и ссылки */}
      <Card>
        <P style={{ fontSize: 14 }}>{t('ui.privacy')}</P>
        <View style={{ marginTop: 6 }}>
          {link(content.links.web)}
          {link(content.links.webGame)}
          {link(content.links.setnerTelegram, setnerLink(content.links.setnerTelegram, p.code, lang, voice))}
        </View>
      </Card>

      {/* сброс прогресса */}
      {!confirm ? (
        <Btn kind="ghost" label={t('ui.reset')} onPress={() => setConfirm(true)} style={{ marginTop: 14 }} />
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Btn
            label={`✓ ${t('ui.reset')}`}
            style={{ flex: 1, backgroundColor: pal.bad }}
            onPress={() => {
              reset();
              setConfirm(false);
              router.replace('/prologue');
            }}
          />
          <Btn kind="ghost" label={t('ui.close')} style={{ flex: 1 }} onPress={() => setConfirm(false)} />
        </View>
      )}
    </Screen>
  );
}
