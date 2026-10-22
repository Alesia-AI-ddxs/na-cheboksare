/**
 * Ссылка на бота Сетнера (Telegram) — ЕДИНСТВЕННОЕ место, где она строится (решение владельца 22.10.2026).
 *
 * Telegram передаёт боту только значение start (в команде /start), поэтому язык едет внутри него:
 *   start=<код прохождения>_<письменный вариант>                 — ND-9EXU_ar, ND-9EXU_ru-RU
 *   start=<код прохождения>_<письменный>_<голосовой>             — если произношение отличается от письменного варианта:
 *                                                                  ND-9EXU_en-GB_en-US, ND-9EXU_zh-Hans_yue-HK
 * Правила Telegram для start: только латиница, цифры, «_» и «-», длина не больше 64.
 * Если не помещается или в поле недопустимые знаки — сначала отбрасываем голос, потом язык.
 * Код прохождения не теряется никогда (если и он не по правилам — ссылка без start, бот спросит код сам).
 * Как боту разобрать: split('_') → [код, письменный?, голосовой?]; коды языков сами «_» не содержат.
 * Проверка формата: npm run qa:setner (scripts/setner-link-check.mjs).
 */

export const START_MAX = 64;
const SAFE = /^[A-Za-z0-9_-]+$/;
const FIELD = /^[A-Za-z0-9-]+$/; // внутри поля «_» нельзя — это разделитель

/** Значение start: код + язык (+ голос, если отличается). undefined — кода нет или он не по правилам Telegram. */
export function setnerStart(code: string | undefined | null, lang?: string | null, voice?: string | null): string | undefined {
  const c = (code ?? '').trim();
  if (!c || !SAFE.test(c) || c.length > START_MAX) return undefined;
  const l = (lang ?? '').trim();
  const v = (voice ?? '').trim();
  const candidates: string[] = [];
  if (l && FIELD.test(l)) {
    if (v && FIELD.test(v) && v !== l) candidates.push(`${c}_${l}_${v}`);
    candidates.push(`${c}_${l}`);
  }
  candidates.push(c);
  return candidates.find((s) => s.length <= START_MAX && SAFE.test(s));
}

/** Полная ссылка на бота: base (https://t.me/<бот>) + ?start=… ; без кода — просто ссылка на бота. */
export function setnerLink(base: string | undefined | null, code: string | undefined | null, lang?: string | null, voice?: string | null): string | undefined {
  if (!base) return undefined;
  const start = setnerStart(code, lang, voice);
  if (!start) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}start=${start}`;
}
