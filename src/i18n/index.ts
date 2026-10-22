/**
 * ЯЗЫКОВОЙ МОДУЛЬ — переводы (i18next + ICU) для Expo/React Native и веба. ТЗ v1.3, раздел 8.
 *
 * Как устроено:
 *  - строки лежат в locales/<код>.json — их пишет tools/content_build.py из мастер-таблицы (в коде строк нет);
 *  - ключ строки = ID из таблицы (ui.*, pt.*, T…, L…);
 *  - нет строки в выбранном варианте → лестница фолбэка (закон 6): точный вариант → старший → en-GB → ru-RU;
 *  - числа и склонения — ICU MessageFormat («{count, plural, one {…} few {…} …}»), правила — по языку,
 *    на котором реально найдена строка (иначе «5 находок» склонялись бы по чужим правилам);
 *  - выбор языка и произношения хранится только на устройстве (AsyncStorage / localStorage в браузере).
 * Инициализация синхронная — чтобы веб-страницы собирались заранее (static export) уже с текстом.
 */
import '@formatjs/intl-pluralrules/polyfill.js'; // Hermes (Android) не знает Intl.PluralRules — ставим, только если его нет
import '@formatjs/intl-pluralrules/locale-data/ar.js';
import '@formatjs/intl-pluralrules/locale-data/cv.js';
import '@formatjs/intl-pluralrules/locale-data/de.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/es.js';
import '@formatjs/intl-pluralrules/locale-data/fa.js';
import '@formatjs/intl-pluralrules/locale-data/fr.js';
import '@formatjs/intl-pluralrules/locale-data/hi.js';
import '@formatjs/intl-pluralrules/locale-data/mr.js';
import '@formatjs/intl-pluralrules/locale-data/ru.js';
import '@formatjs/intl-pluralrules/locale-data/tr.js';
import '@formatjs/intl-pluralrules/locale-data/yue.js';
import '@formatjs/intl-pluralrules/locale-data/zh.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';
import { BUNDLED_LOCALES, LOCALE_META } from '../../locales';
import { byCode, CODE_ALIASES, DEFAULT_LOCALE, defaultVoice, fallbackChain, LANGUAGES } from './languages';

export { LANGUAGES, DEFAULT_LOCALE, byCode, fallbackChain, defaultVoice } from './languages';
export type { LanguageVariant, VoiceVariant } from './languages';

const STORAGE_KEY = 'nacheboksare.locale'; // выбранный письменный вариант
const STORAGE_VOICE_KEY = 'nacheboksare.voice'; // выбранный голосовой вариант
const PACK_PREFIX = 'nacheboksare.pack.'; // кэш скачанных языковых пакетов

/** Правила множественного числа: если движок не знает язык (марийский, мокшанский…), берём старший из цепочки */
function pluralLocale(lng: string): string {
  for (const c of fallbackChain(lng)) {
    try {
      if (Intl.PluralRules.supportedLocalesOf([c]).length) return c;
    } catch {
      // нет Intl — оставим как есть
    }
  }
  return DEFAULT_LOCALE;
}

const resources: Record<string, { translation: Record<string, string> }> = {};
for (const l of LANGUAGES) {
  const pack = BUNDLED_LOCALES[l.code];
  if (pack && l.bundled) resources[l.code] = { translation: pack };
}

i18n
  .use(new ICU({ parseLngForICU: pluralLocale }))
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: (code: string) => fallbackChain(code).slice(1), // лестница подстраховки (закон 6)
    load: 'currentOnly',
    keySeparator: false, // ключи из таблицы содержат точки: «ui.title» — это один ключ
    nsSeparator: false,
    interpolation: { escapeValue: false },
    returnEmptyString: false, // пустая ячейка таблицы = идём по цепочке, а не молчим
    returnNull: false,
    initAsync: false, // синхронно: тексты есть уже на первом кадре и в заранее собранных веб-страницах
    react: { useSuspense: false },
  });

export default i18n;

// ───────────────────────────────────────── поиск строки по лестнице

type Vars = Record<string, string | number>;

/** На каком варианте из цепочки реально есть строка (или undefined, если нигде) */
export function resolvedLocale(key: string, lang: string): string | undefined {
  for (const c of fallbackChain(lang)) {
    const v = i18n.getResource(c, 'translation', key);
    if (typeof v === 'string' && v.trim() !== '') return c;
  }
  return undefined;
}

/** Строка по ключу или undefined, если её нет ни на одном языке цепочки (элемент тогда можно скрыть) */
export function tOpt(key: string | null | undefined, lang: string, vars?: Vars): string | undefined {
  if (!key) return undefined;
  const used = resolvedLocale(key, lang);
  if (!used) return undefined;
  // форматируем на том языке, где строка найдена: правила ICU (склонения) совпадают с текстом
  return String(i18n.t(key, { ...(vars ?? {}), lng: used, fallbackLng: false }));
}

/** Строка по ключу. Если её нет нигде — сам ключ (так пропуск сразу виден на проверке; npm run check его ловит). */
export function t(key: string, lang: string, vars?: Vars): string {
  return tOpt(key, lang, vars) ?? key;
}

/** Первая найденная строка из списка ключей; если нет ни одной — сам первый ключ. */
export function tFirst(keys: string[], lang: string): string {
  for (const k of keys) {
    const v = tOpt(k, lang);
    if (v) return v;
  }
  return keys[0];
}

/** Есть ли ключ хотя бы на одном языке (обычно — в ru-RU, он полный). */
export function hasKey(key: string | null | undefined): boolean {
  return !!key && !!resolvedLocale(key, DEFAULT_LOCALE);
}

/** Текст рассказа (T…) или предания (L…) на нужном языке, с фолбэком. */
export function storyText(key: string, lang: string): string | undefined {
  return tOpt(key, lang);
}

// ───────────────────────────────────────── метаданные из таблицы (лист ЯЗЫКИ → locales/_meta.json)

/** Вариант помечен в таблице как ЧЕРНОВИК (служебная метка в приложении) */
export function isDraft(code: string): boolean {
  const m = LOCALE_META.variants[byCode(code)?.code ?? code];
  return !!m && m.status.toUpperCase().startsWith('ЧЕРНОВИК');
}
/** Сколько строк варианта переведено (0 — перевода пока нет, показываем «готовится») */
export function translatedCount(code: string): number {
  return LOCALE_META.variants[byCode(code)?.code ?? code]?.strings ?? 0;
}
/** Тест-строка «тофу» из листа ЯЗЫКИ (для проверки шрифта) */
export function tofuTestString(code: string): string {
  return LOCALE_META.variants[byCode(code)?.code ?? code]?.testString ?? '';
}

// ───────────────────────────────────────── выбор языка: автоопределение, сохранение, RTL

/** Автоопределение: язык системы → ближайший письменный вариант из реестра */
export function detectLocale(): string {
  let sys: Localization.Locale | undefined;
  try {
    sys = Localization.getLocales()[0];
  } catch {
    sys = undefined;
  }
  if (!sys) return DEFAULT_LOCALE;
  const tag = sys.languageTag ?? ''; // напр. "en-GB", "zh-Hans-CN", "ar-EG"
  if (byCode(tag)) return byCode(tag)!.code;
  const lc = (sys.languageCode ?? tag.split('-')[0]).toLowerCase();
  if (lc === 'zh') {
    const hk = /-(HK|MO)\b/i.test(tag) || sys.regionCode === 'HK' || sys.regionCode === 'MO';
    if (hk) return 'yue-Hant';
    return sys.languageScriptCode === 'Hant' || /Hant|TW/.test(tag) ? 'zh-Hant' : 'zh-Hans';
  }
  if (lc === 'yue') return 'yue-Hant';
  if (lc === 'ar') return 'ar';
  if (lc === 'fa') return 'fa-IR';
  if (lc === 'en') return /US|PR|UM/.test(sys.regionCode ?? '') ? 'en-US' : 'en-GB';
  if (lc === 'es') return sys.regionCode === 'ES' || !sys.regionCode ? 'es-ES' : 'es-419';
  const hit = LANGUAGES.find((l) => l.code === lc || l.code.startsWith(lc + '-'));
  return hit ? hit.code : DEFAULT_LOCALE;
}

export type SavedLocale = { locale: string; voice: string; chosen: boolean };

/**
 * Чтение сохранённого выбора. chosen=false — первый запуск (показываем экран выбора языка).
 * legacyLang — язык, сохранённый версией 1.0 в прогрессе игры (чтобы не спрашивать заново).
 */
export async function loadSavedLocale(legacyLang?: string | null, legacyStarted?: boolean): Promise<SavedLocale> {
  const [saved, voice] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY).catch(() => null),
    AsyncStorage.getItem(STORAGE_VOICE_KEY).catch(() => null),
  ]);
  let locale = byCode(saved)?.code;
  let chosen = !!locale;
  if (!locale && legacyLang && legacyStarted && byCode(legacyLang)) {
    locale = byCode(legacyLang)!.code; // пользователь 1.0 уже выбирал язык
    chosen = true;
  }
  if (!locale) locale = detectLocale();
  if (!i18n.hasResourceBundle(locale, 'translation')) await ensurePack(locale);
  await i18n.changeLanguage(locale);
  const lang = byCode(locale)!;
  const v = voice && lang.voices.some((x) => x.code === voice) ? voice : defaultVoice(locale);
  return { locale, voice: v, chosen };
}

/** Смена письменного варианта. Возвращает true, если на телефоне нужен перезапуск (смена направления письма). */
export async function setLocale(code: string, voice?: string): Promise<boolean> {
  const lang = byCode(code);
  if (!lang) return false;
  await AsyncStorage.setItem(STORAGE_KEY, lang.code).catch(() => undefined);
  await AsyncStorage.setItem(STORAGE_VOICE_KEY, voice ?? defaultVoice(lang.code)).catch(() => undefined);
  if (!i18n.hasResourceBundle(lang.code, 'translation')) await ensurePack(lang.code);
  await i18n.changeLanguage(lang.code);
  return applyDirection(lang.code);
}

export async function setVoice(code: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_VOICE_KEY, code).catch(() => undefined);
}

/** Письмо справа налево у варианта (арабский, фарси) */
export function isRtlLocale(code: string): boolean {
  return !!byCode(code)?.rtl;
}

/**
 * Направление письма.
 *  - Веб: document.dir — страница зеркалится сразу, без перезапуска.
 *  - Телефон: I18nManager.forceRTL применяется только после перезапуска. Возвращает true — тогда
 *    экран выбора языка показывает «перезапустимся» и вызывает restartApp().
 */
export function applyDirection(code: string): boolean {
  const rtl = isRtlLocale(code);
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = byCode(code)?.code ?? code;
    }
    return false;
  }
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}

/** Нужен ли перезапуск, чтобы направление интерфейса совпало с языком (только телефон) */
export function directionMismatch(code: string): boolean {
  return Platform.OS !== 'web' && I18nManager.isRTL !== isRtlLocale(code);
}

/** Перезапуск после смены направления письма: expo-updates, а если он выключен — штатный перезапуск Expo */
export async function restartApp(): Promise<void> {
  try {
    const Updates = await import('expo-updates');
    await Updates.reloadAsync();
    return;
  } catch {
    // expo-updates выключен (нет адреса обновлений) или режим разработки — пробуем штатный способ
  }
  try {
    const { reloadAppAsync } = await import('expo');
    await reloadAppAsync('RTL');
  } catch {
    // не вышло — экран остаётся с текстом ui.restart_rtl: приложение можно перезапустить вручную
  }
}

// ───────────────────────────────────────── скачиваемые языковые пакеты (разъём)

/**
 * ТЗ р.8 «Языковые пакеты». Адрес сервера — переменная для админа: app.json → extra.langPackBaseUrl
 * (пусто = только вшитые пакеты + фолбэк; сейчас вшиты все 22). Скачанное хранится на устройстве и дальше
 * работает без интернета. Без адреса приложение в сеть не ходит.
 */
async function ensurePack(code: string): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(PACK_PREFIX + code);
    let pack: Record<string, string> | null = cached ? JSON.parse(cached) : null;
    if (!pack) {
      const base = String(Constants.expoConfig?.extra?.langPackBaseUrl ?? '').replace(/\/+$/, '');
      if (!base) return false; // сервера нет — живём на фолбэке
      const res = await fetch(`${base}/locales/${code}.json`);
      if (!res.ok) return false;
      pack = (await res.json()) as Record<string, string>;
      await AsyncStorage.setItem(PACK_PREFIX + code, JSON.stringify(pack));
    }
    i18n.addResourceBundle(code, 'translation', pack, true, true);
    return true;
  } catch {
    return false; // любой сбой = фолбэк-цепочка, пустых экранов не бывает (закон 6)
  }
}

// ───────────────────────────────────────── числа и даты средствами локали (ТЗ р.5)

function intlLocales(lang: string): string[] {
  const l = byCode(lang)?.code ?? lang;
  const out = [l];
  if (CODE_ALIASES[l]) out.push(CODE_ALIASES[l]);
  out.push(DEFAULT_LOCALE);
  return out;
}

export function formatNumber(n: number, lang: string): string {
  try {
    return new Intl.NumberFormat(intlLocales(lang)).format(n);
  } catch {
    return String(n);
  }
}

export function formatDate(d: Date, lang: string): string {
  try {
    return new Intl.DateTimeFormat(intlLocales(lang), { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** Название языка на текущем языке интерфейса (средствами системы); нет — undefined */
export function languageDisplayName(code: string, uiLang: string): string | undefined {
  try {
    const DN = (Intl as unknown as { DisplayNames?: new (l: string[], o: { type: 'language' }) => { of(c: string): string | undefined } })
      .DisplayNames;
    if (!DN) return undefined;
    const name = new DN(intlLocales(uiLang), { type: 'language' }).of(code);
    return name && name !== code ? name : undefined;
  } catch {
    return undefined;
  }
}

export { paragraphs, rankKey, roman } from './compat';
