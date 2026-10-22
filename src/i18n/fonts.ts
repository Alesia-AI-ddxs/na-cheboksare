/**
 * ЯЗЫКОВОЙ МОДУЛЬ — шрифты письменностей (ТЗ v1.3, раздел 6). Лицензия SIL OFL 1.1: assets/fonts/LICENSE_OFL.txt.
 *
 * Грузим ТОЛЬКО шрифт письма выбранного языка — чтобы не раздувать старт:
 *  - латиница и кириллица — фирменная пара Prata + PT Sans (грузится всегда, _layout.tsx);
 *  - китайский (упрощ. / традиц. / гонконгский), деванагари, арабское письмо — Noto из npm по требованию.
 * Файлы берём поштучно (только нужное начертание), а не из index.js пакета — иначе в сборку попали бы все
 * 9 начертаний (у китайского это ≈95 МБ). Для китайских — одно начертание Regular (жирный рисует система),
 * для деванагари и арабского — Regular + Bold (они лёгкие).
 * В веб-версии файл шрифта скачивается в момент выбора языка и дальше живёт в кэше (работает офлайн).
 * Следующий шаг (не сделан): подмножества (subset) — в сборку только символы реальных строк.
 */
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Platform } from 'react-native';
import { byCode, type FontFamily } from './languages';

type Real = Exclude<FontFamily, 'brand'>;

/* eslint-disable @typescript-eslint/no-require-imports */
const SOURCES: Record<Real, Record<string, number>> = {
  NotoSansSC: { NotoSansSC: require('@expo-google-fonts/noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf') },
  NotoSansTC: { NotoSansTC: require('@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf') },
  NotoSansHK: { NotoSansHK: require('@expo-google-fonts/noto-sans-hk/400Regular/NotoSansHK_400Regular.ttf') },
  NotoSansDevanagari: {
    NotoSansDevanagari: require('@expo-google-fonts/noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf'),
    NotoSansDevanagari_Bold: require('@expo-google-fonts/noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf'),
  },
  NotoNaskhArabic: {
    NotoNaskhArabic: require('@expo-google-fonts/noto-naskh-arabic/400Regular/NotoNaskhArabic_400Regular.ttf'),
    NotoNaskhArabic_Bold: require('@expo-google-fonts/noto-naskh-arabic/700Bold/NotoNaskhArabic_700Bold.ttf'),
  },
};
/* eslint-enable @typescript-eslint/no-require-imports */

/** Имена загруженных начертаний: обычное и жирное (если жирного файла нет — обычное) */
export function familyNames(family: FontFamily): { regular: string; bold: string } | null {
  if (family === 'brand') return null;
  const names = Object.keys(SOURCES[family]);
  return { regular: names[0], bold: names[1] ?? names[0] };
}

export function isScriptFontLoaded(family: FontFamily): boolean {
  if (family === 'brand') return true;
  return Object.keys(SOURCES[family]).every((n) => Font.isLoaded(n));
}

/** Загрузить шрифт письма для языка. true — шрифт готов (или не нужен). Ошибка = остаёмся на системном шрифте. */
export async function loadFontFor(lang: string): Promise<boolean> {
  const family = byCode(lang)?.fontFamily ?? 'brand';
  if (family === 'brand' || isScriptFontLoaded(family)) return true;
  try {
    await Font.loadAsync(SOURCES[family]);
    if (Platform.OS === 'web') keepOffline(Object.values(SOURCES[family]));
    return true;
  } catch {
    return false;
  }
}

/**
 * Веб-версия: попросить сервис-воркер сохранить файлы шрифта (public/sw.js, сообщение 'cache-urls') —
 * так выбранный язык работает без интернета («языковой пакет»). Ошибки не мешают работе.
 */
function keepOffline(modules: number[]): void {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const urls = modules.map((m) => Asset.fromModule(m).uri).filter(Boolean);
    navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: 'cache-urls', urls }))
      .catch(() => undefined);
  } catch {
    // нет воркера (режим разработки) — ничего страшного
  }
}
