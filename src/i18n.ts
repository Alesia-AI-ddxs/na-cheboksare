// Переводы. Все строки интерфейса лежат в content.json → ui.
// Правило поиска: выбранный язык → русский → (запасная строка, если передана) → сам ключ.
import { content, DEFAULT_LANG, Localized } from './content';

function pick(entry: Localized | undefined, lang: string): string | undefined {
  if (!entry) return undefined;
  const v = entry[lang];
  if (v && v.trim()) return v;
  const ru = entry[DEFAULT_LANG];
  if (ru && ru.trim()) return ru;
  return undefined;
}

/** Строка интерфейса по ключу. lastResort — только для редких аварийных случаев. */
export function t(key: string, lang: string, lastResort?: string): string {
  return pick(content.ui[key], lang) ?? lastResort ?? key;
}

/** То же, но возвращает undefined, если строки нет ни на одном языке (чтобы элемент можно было скрыть). */
export function tOpt(key: string | null | undefined, lang: string): string | undefined {
  if (!key) return undefined;
  return pick(content.ui[key], lang);
}

/** Первая найденная строка из списка ключей; если нет ни одной — сам первый ключ. */
export function tFirst(keys: string[], lang: string, lastResort?: string): string {
  for (const k of keys) {
    const v = tOpt(k, lang);
    if (v) return v;
  }
  return lastResort ?? keys[0];
}

/** Есть ли ключ в интерфейсе хотя бы на одном языке. */
export function hasUi(key: string | null | undefined): boolean {
  return !!key && !!content.ui[key] && Object.values(content.ui[key]).some((v) => !!v && v.trim() !== '');
}

/** Текст рассказа (texts) или предания (legends) на нужном языке. */
export function storyText(key: string, lang: string): string | undefined {
  const e = content.texts[key] ?? content.legends[key];
  return pick(e?.text, lang);
}

/** Разбить многоабзацный текст на абзацы. */
export function paragraphs(s: string): string[] {
  return s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Есть ли на этом языке «настоящий» перевод (а не русский запасной). */
export function isReadyLang(code: string): boolean {
  return content.languages.some((l) => l.code === code && l.ready);
}

/** Угадать язык устройства среди готовых языков (без лишних библиотек). */
export function guessDeviceLang(): string {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const ready = content.languages.filter((l) => l.ready);
    const exact = ready.find((l) => l.code.toLowerCase() === loc.toLowerCase());
    if (exact) return exact.code;
    const base = loc.split('-')[0].toLowerCase();
    if (base === 'zh') return ready.find((l) => l.code.startsWith('zh'))?.code ?? DEFAULT_LANG;
    const byBase = ready.find((l) => l.code.split('-')[0].toLowerCase() === base);
    if (byBase) return byBase.code;
  } catch {
    // ничего страшного — останемся на русском
  }
  return DEFAULT_LANG;
}

/**
 * Звания по очкам. Сначала ищем ключи ui.rank_1/2/3 в content.json.
 * Если их там ещё нет — берём русские названия из веб-прототипа (единственный запасной словарь).
 * Переводы званий на другие языки придут в content.json — здесь их не выдумываем.
 */
const RANK_FALLBACK: Record<string, [string, string, string]> = {
  'ru-RU': ['Летописец Чебоксар', 'Краевед', 'Добрый гость города'],
};
export function rankTitle(score: number, lang: string): string {
  const idx = score >= 350 ? 0 : score >= 220 ? 1 : 2;
  const key = `ui.rank_${idx + 1}`;
  const fromJson = tOpt(key, lang);
  if (fromJson) return fromJson;
  const local = RANK_FALLBACK[lang] ?? RANK_FALLBACK[DEFAULT_LANG];
  return local[idx];
}

/** Римская цифра этапа (не языковая строка — просто номер). */
export function roman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  let x = n;
  for (const [v, s] of map) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}
