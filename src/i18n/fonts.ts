/**
 * ЯЗЫКОВОЙ МОДУЛЬ — шрифты письменностей (ТЗ v1.3, раздел 6). Лицензия SIL OFL 1.1: assets/fonts/LICENSE_OFL.txt.
 *
 * Грузим ТОЛЬКО шрифт письма выбранного языка — чтобы не раздувать старт:
 *  - латиница и кириллица — фирменная пара Prata + PT Sans (грузится всегда, _layout.tsx);
 *  - китайский, деванагари, арабское письмо — Noto по требованию.
 * С версии 1.1.1 это ПОДМНОЖЕСТВА (assets/fonts/subset/): в файле только буквы из строк мастер-таблицы
 * (+ цифры, латиница, знаки; у арабского и деванагари — весь блок письма). Их собирает генератор
 * (tools/content_build.py → tools/font_subset.py), список — src/i18n/fontFiles.ts (создаётся автоматически).
 * Китайский шрифт вместо ≈10 МБ весит ≈0,3 МБ. Письма без переведённых языков (сейчас традиционный китайский
 * и кантонский) в сборку не входят вовсе: такой вариант «готовится» и не выбирается; появятся тексты в таблице —
 * генератор сам создаст подмножество и допишет его в fontFiles.ts.
 * В веб-версии файл шрифта сохраняется в кэше и работает без интернета.
 */
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Platform } from 'react-native';
import { SUBSET_FONTS } from './fontFiles';
import { byCode, type FontFamily } from './languages';

type Real = Exclude<FontFamily, 'brand'>;

/** Файлы начертаний письма (обычное, жирное) — только те письма, для которых генератор создал подмножество */
const SOURCES = SUBSET_FONTS as Partial<Record<Real, Record<string, number>>>;

/** Есть ли в сборке шрифт этого письма (нет — рисует системный шрифт; вариант без текстов всё равно «готовится») */
export function hasScriptFont(family: FontFamily): boolean {
  return family === 'brand' || !!SOURCES[family];
}

/** Имена загруженных начертаний: обычное и жирное (если жирного файла нет — обычное) */
export function familyNames(family: FontFamily): { regular: string; bold: string } | null {
  if (family === 'brand') return null;
  const src = SOURCES[family];
  if (!src) return null;
  const names = Object.keys(src);
  return { regular: names[0], bold: names[1] ?? names[0] };
}

export function isScriptFontLoaded(family: FontFamily): boolean {
  if (family === 'brand') return true;
  const src = SOURCES[family];
  return !!src && Object.keys(src).every((n) => Font.isLoaded(n));
}

/** Загрузить шрифт письма для языка. true — шрифт готов (или не нужен). Ошибка = остаёмся на системном шрифте. */
export async function loadFontFor(lang: string): Promise<boolean> {
  const family = byCode(lang)?.fontFamily ?? 'brand';
  if (family === 'brand' || isScriptFontLoaded(family)) return true;
  const src = SOURCES[family];
  if (!src) return false; // шрифта письма в сборке нет — системный шрифт
  try {
    await Font.loadAsync(src);
    if (Platform.OS === 'web') keepOffline(Object.values(src));
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
