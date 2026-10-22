/**
 * Экран выбора языка (ТЗ v1.3, раздел 8 «Выбор языка»). Пакет архитектора v0.2, адаптация под expo-router.
 * Правила:
 *  - каждый язык написан на самом себе (эндоним) — первой строкой; БЕЗ флагов стран (флаг — страна, а не язык);
 *  - второй строкой — варианты произношения, если их больше одного; второй шаг — выбор произношения;
 *  - первый запуск: язык системы предлагается сверху (автоопределение) — подтвердить одной кнопкой;
 *  - блок «Предлагаем» (v1.1.1, решение владельца 22.10.2026): язык телефона + варианты страны телефона
 *    (страна — из настроек телефона, колонка «Страны» листа ЯЗЫКИ; без геолокации и сети), только переведённые
 *    (готовые и черновики, не «готовится»), без повторов; ниже — полный список;
 *  - варианты со статусом ЧЕРНОВИК (лист ЯЗЫКИ) — служебная метка мелко; без перевода — «готовится» и неактивны;
 *  - письмо справа налево на телефоне включается только после перезапуска — экран «перезапустимся».
 * Все подписи — ключи мастер-таблицы (ui.lang_*, ui.voice_*, ui.restart_*), в коде строк нет.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FalconMark } from '../components/Icons';
import { Btn, Card, H, P, Screen, Tag } from '../components/ui';
import {
  byCode,
  isDraft,
  languageDisplayName,
  LANGUAGES,
  restartApp,
  suggestedLocales,
  translatedCount,
  type LanguageVariant,
} from '../i18n';
import { isScriptFontLoaded } from '../i18n/fonts';
import type { Group } from '../i18n/languages';
import { useGame } from '../state/game';

const GROUP_ORDER: Group[] = ['russia', 'world', 'china', 'india', 'arab'];

interface Props {
  /** язык выбран и применён; needsRestart уже обработан на этом экране */
  onDone: () => void;
  /** «назад» (когда экран открыт из «О проекте») */
  onBack?: () => void;
}

export default function LanguageSelectScreen({ onDone, onBack }: Props) {
  const { pal, f, t, lang, voice, langChosen, setLang, dir } = useGame();
  const [picked, setPicked] = useState<LanguageVariant | null>(null);
  const [restart, setRestart] = useState(false);
  // язык системы и названия языков знает только устройство — считаем после первого кадра
  // (веб-страница собирается заранее на сервере, и первый кадр должен с ней совпасть)
  const [mounted, setMounted] = useState(false);
  const [suggestions, setSuggestions] = useState<LanguageVariant[]>([]);
  useEffect(() => {
    setSuggestions(suggestedLocales((c) => translatedCount(c) > 0).map((c) => byCode(c)!).filter(Boolean));
    setMounted(true);
  }, []);
  const suggested = suggestions[0] ?? null;

  const available = (l: LanguageVariant) => translatedCount(l.code) > 0;

  async function choose(l: LanguageVariant) {
    if (!available(l)) return;
    if (l.voices.length > 1) {
      setPicked(l); // шаг 2: произношение
      return;
    }
    await apply(l, l.voices[0]?.code ?? l.code);
  }

  async function apply(l: LanguageVariant, voiceCode: string) {
    const needsRestart = await setLang(l.code, voiceCode);
    if (needsRestart) setRestart(true);
    else onDone();
  }

  const endonymFont = (l: LanguageVariant) =>
    mounted && l.fontFamily !== 'brand' && isScriptFontLoaded(l.fontFamily) ? { fontFamily: l.fontFamily } : null;

  // ── экран «перезапустимся» (письмо справа налево на телефоне)
  if (restart) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', marginTop: 40, gap: 12 }} testID="restart-rtl">
          <FalconMark size={44} />
          <P style={{ textAlign: 'center', fontSize: 16 }}>{t('ui.restart_rtl')}</P>
          <Btn testID="restart-btn" label={t('ui.restart_btn')} onPress={() => restartApp()} />
        </View>
      </Screen>
    );
  }

  // ── шаг 2: выбор произношения
  if (picked) {
    return (
      <Screen>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ui.lang_choose')}
          onPress={() => setPicked(null)}
          style={{ minHeight: 48, justifyContent: 'center', marginTop: 8 }}
        >
          <Text style={{ fontSize: 22, color: pal.ink }}>{dir.back}</Text>
        </Pressable>
        <H size={26} style={endonymFont(picked)}>
          {picked.endonym}
        </H>
        <H style={{ marginTop: 10 }}>{t('ui.voice_choose')}</H>
        <P muted style={{ fontSize: 13.5, marginTop: 4 }}>
          {t('ui.voice_hint')}
        </P>
        <View style={{ gap: 8, marginTop: 12 }}>
          {picked.voices.map((v, i) => {
            const sel = picked.code === lang && v.code === voice;
            return (
              <Pressable
                key={v.code}
                testID={`voice-${v.code}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                onPress={() => apply(picked, v.code)}
                style={rowStyle(pal, sel)}
              >
                <Text style={[{ flex: 1, color: pal.ink, fontSize: 17 }, endonymFont(picked)]}>{v.endonym}</Text>
                <Text style={{ color: pal.muted, fontSize: 12, fontFamily: f.body }}>{v.code}</Text>
                {i === 0 ? <Text style={{ color: pal.gold, fontSize: 14 }}>★</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </Screen>
    );
  }

  // ── шаг 1: список языков
  return (
    <Screen>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} style={{ minHeight: 48, justifyContent: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 22, color: pal.ink }}>{dir.back}</Text>
        </Pressable>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <FalconMark size={40} />
        </View>
      )}
      <H size={24} style={{ marginTop: 8 }} testID="lang-title">
        {t('ui.lang_choose')}
      </H>
      <P muted style={{ fontSize: 13.5, marginTop: 2 }}>
        {t('ui.lang_endonyms')}
      </P>

      {suggested ? (
        <Card style={{ borderColor: pal.gold, borderWidth: 1.5 }}>
          <View testID="lang-suggest">
            <P muted style={{ fontSize: 13 }}>{t('ui.lang_suggest_title')}</P>
            {!langChosen ? (
              <>
                {/* первый запуск: язык телефона — крупно и одной кнопкой */}
                <P muted style={{ fontSize: 12, marginTop: 6 }}>{t('ui.lang_suggested')}</P>
                <Text testID={`sugg-${suggested.code}`} style={[{ fontSize: 22, color: pal.ink, marginTop: 2 }, endonymFont(suggested)]}>
                  {suggested.endonym}
                </Text>
                <Btn testID="lang-continue" label={t('ui.lang_continue')} onPress={() => choose(suggested)} style={{ marginTop: 12 }} />
              </>
            ) : null}
            <View style={{ gap: 8, marginTop: 10 }}>
              {(langChosen ? suggestions : suggestions.slice(1)).map((l) => (
                <Pressable
                  key={l.code}
                  testID={`sugg-${l.code}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: langChosen && l.code === lang }}
                  onPress={() => choose(l)}
                  style={rowStyle(pal, langChosen && l.code === lang)}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[{ color: pal.ink, fontSize: 18 }, endonymFont(l)]}>{l.endonym}</Text>
                    {isDraft(l.code) ? (
                      <Text style={{ color: pal.muted, fontSize: 10.5, marginTop: 2, fontFamily: f.body }}>{t('ui.lang_draft_badge')}</Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>
      ) : null}

      {GROUP_ORDER.map((g) => (
        <View key={g} style={{ marginTop: 14, gap: 8, borderTopWidth: 1, borderColor: pal.line, paddingTop: 12 }}>
          {LANGUAGES.filter((l) => l.group === g).map((l) => {
            const sel = langChosen && l.code === lang;
            const ok = available(l);
            // подсказка на языке интерфейса (средствами системы); в русском интерфейсе — русское имя из реестра
            // (у своего языка подсказки нет; «имя-код» вроде «chm» система выдаёт для незнакомых ей языков — не показываем)
            const sys = mounted && l.code !== lang ? languageDisplayName(l.code, lang) : undefined;
            const named = sys && !/^[a-z]{2,3}([-_][A-Za-z0-9]+)*$/.test(sys) ? sys : mounted && lang === 'ru-RU' && l.code !== lang ? l.nameRu : undefined;
            const hint = named && named.toLowerCase() !== l.endonym.toLowerCase() ? named : undefined;
            return (
              <Pressable
                key={l.code}
                testID={`lang-${l.code}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel, disabled: !ok }}
                disabled={!ok}
                onPress={() => choose(l)}
                style={[rowStyle(pal, sel), { opacity: ok ? 1 : 0.55 }]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[{ color: pal.ink, fontSize: 18 }, endonymFont(l)]}>{l.endonym}</Text>
                  {l.voices.length > 1 ? (
                    <Text numberOfLines={1} style={{ color: pal.muted, fontSize: 12, marginTop: 2 }}>
                      {l.voices.map((v) => v.endonym).join(' · ')}
                    </Text>
                  ) : null}
                  {ok && isDraft(l.code) ? (
                    <Text testID={`draft-${l.code}`} style={{ color: pal.muted, fontSize: 10.5, marginTop: 2, fontFamily: f.body }}>
                      {t('ui.lang_draft_badge')}
                    </Text>
                  ) : null}
                </View>
                {hint ? <Text style={{ color: pal.muted, fontSize: 12, fontFamily: f.body }}>{hint}</Text> : null}
                {!ok ? <Tag label={t('ui.soon')} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

function rowStyle(pal: ReturnType<typeof useGame>['pal'], sel: boolean) {
  return {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: sel ? pal.gold : pal.line,
    backgroundColor: sel ? (pal.dark ? '#2A2410' : '#F4EBD6') : pal.panel,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  };
}
