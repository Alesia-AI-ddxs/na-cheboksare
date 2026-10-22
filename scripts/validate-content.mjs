// Проверка файла контента src/content/content.json и языковых пакетов locales/*.json.
// 1) Структурные ошибки (неизвестная находка, ссылка на несуществующий этап, повтор номера точки) → выход с кодом 1.
// 2) Недостающие тексты/строки — НЕ ошибка: печатаем таблицу «точка — готова/не готова — чего не хватает».
// 3) Языковые пакеты (языковой модуль, ТЗ мультиязычности р.8) — ошибка, если:
//    - для варианта из реестра src/i18n/languages.ts нет файла locales/<код>.json (или есть лишний файл);
//    - ru-RU неполный (в каком-то пакете есть ключ, которого нет в ru-RU);
//    - строка не читается как ICU MessageFormat (непарные скобки {…}, битый plural);
//    - ключа, который использует код (t('…'), tOpt('…'), tFirst([…]) и список ниже), нет в ru-RU.
// Запуск: node scripts/validate-content.mjs   (входит в npm run check)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'src/content/content.json');
let c;
try {
  c = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error('ОШИБКА: не удалось прочитать content.json —', e.message);
  process.exit(1);
}

const errors = [];
const has = (obj, k) => !!obj && Object.prototype.hasOwnProperty.call(obj, k);
const uiHas = (k) => !!k && has(c.ui, k) && Object.values(c.ui[k]).some((v) => typeof v === 'string' && v.trim() !== '');

for (const sec of ['languages', 'stages', 'points', 'texts', 'legends', 'artifacts', 'ui']) {
  if (!has(c, sec)) errors.push(`нет раздела «${sec}»`);
}
const points = c.points ?? [];
const stages = c.stages ?? [];
const artifacts = c.artifacts ?? {};

// повторы номеров точек
const seen = new Set();
for (const p of points) {
  if (seen.has(p.id)) errors.push(`точка ${p.id}: номер повторяется`);
  seen.add(p.id);
}
// этапы
const stageIds = new Set(stages.map((s) => s.id));
for (const s of stages) {
  for (const pid of s.points ?? []) {
    if (!seen.has(pid)) errors.push(`этап ${s.id}: ссылается на несуществующую точку ${pid}`);
  }
  if (s.finishArtifact && !has(artifacts, s.finishArtifact)) errors.push(`этап ${s.id}: неизвестная финальная находка ${s.finishArtifact}`);
}
for (const p of points) {
  if (!stageIds.has(p.stage)) errors.push(`точка ${p.id}: неизвестный этап ${p.stage}`);
  if (!stages.some((s) => (s.points ?? []).includes(p.id))) errors.push(`точка ${p.id}: не входит ни в один этап`);
  for (const a of p.artifacts ?? []) if (!has(artifacts, a)) errors.push(`точка ${p.id}: неизвестная находка ${a}`);
  if (p.stageFinish && !has(artifacts, p.stageFinish)) errors.push(`точка ${p.id}: неизвестная находка этапа ${p.stageFinish}`);
  if (p.quiz) {
    if (!Array.isArray(p.quiz.options) || p.quiz.options.length < 2) errors.push(`точка ${p.id}: в задании меньше двух вариантов`);
    else if (!(p.quiz.correct >= 0 && p.quiz.correct < p.quiz.options.length)) errors.push(`точка ${p.id}: номер верного ответа вне вариантов`);
  }
  for (const b of [...(p.beats ?? []), ...(p.legends ?? [])]) {
    if (!['doc', 'sci', 'leg'].includes(b.layer)) errors.push(`точка ${p.id}: неизвестный слой «${b.layer}» у ${b.key}`);
  }
}
for (const [id, a] of Object.entries(artifacts)) {
  if (a.id && a.id !== id) errors.push(`находка ${id}: id внутри (${a.id}) не совпадает с ключом`);
}

// отчёт по готовности
const rows = [];
for (const s of stages) {
  for (const pid of s.points ?? []) {
    const p = points.find((x) => x.id === pid);
    if (!p) continue;
    const miss = [];
    for (const b of p.beats ?? []) {
      if (!has(c.texts, b.key)) miss.push(b.key);
      if (!uiHas(b.speaker)) miss.push(b.speaker);
    }
    for (const b of p.legends ?? []) {
      if (!has(c.legends, b.key)) miss.push(b.key);
      if (!uiHas(b.speaker)) miss.push(b.speaker);
    }
    if (p.quiz) for (const k of [p.quiz.q, p.quiz.r]) if (!uiHas(k)) miss.push(k);
    for (const k of [p.nameKey, p.hintKey, p.todayKey]) if (k && !uiHas(k)) miss.push(k);
    for (const a of p.artifacts ?? []) {
      const art = artifacts[a];
      if (art) for (const k of [art.nameKey, art.descKey]) if (!uiHas(k)) miss.push(k);
    }
    rows.push({ id: p.id, stage: s.id, ready: miss.length === 0, miss: [...new Set(miss)] });
  }
}

// строки интерфейса, которые приложение умеет показывать (обязательные ключи; нет в ru-RU — ошибка)
const APP_UI_KEYS = [
  'ui.title', 'ui.splash_quote', 'ui.lang_question', 'ui.lang_short', 'ui.mode_question', 'ui.here', 'ui.remote',
  'ui.code', 'ui.start', 'ui.soon', 'ui.back', 'ui.close', 'ui.continue', 'ui.next', 'ui.task', 'ui.wrong',
  'ui.today', 'ui.source', 'ui.legend', 'layer.doc', 'layer.sci', 'ui.portrait', 'ui.reconstruction',
  'ui.new_find', 'ui.found', 'ui.not_found_yet', 'ui.collection', 'ui.points', 'ui.finish_title', 'ui.finish_text',
  'ui.finish_btn', 'ui.to_bot', 'ui.share', 'ui.share_text', 'ui.voice_soon', 'spk.setner',
  'ui.tab_route', 'ui.tab_finds', 'ui.tab_setner', 'ui.tab_about', 'ui.about', 'ui.about_title', 'ui.about_text',
  'ui.setner_intro', 'ui.done', 'ui.you_are_here', 'ui.ahead', 'ui.privacy', 'ui.reset', 'ui.pwa_hint',
  'ui.rank_1', 'ui.rank_2', 'ui.rank_3', 'ui.kind_museum', 'ui.kind_evidence', 'ui.kind_game',
  // языковой модуль (v1.1.0, таблица v2.7)
  'ui.lang_choose', 'ui.lang_endonyms', 'ui.lang_suggested', 'ui.lang_continue', 'ui.voice_choose', 'ui.voice_hint',
  'ui.lang_draft_badge', 'ui.restart_rtl', 'ui.restart_btn', 'ui.listen', 'finds.count', 'finds.you_found',
  ...stages.map((s) => s.nameKey),
];

// ─────────────────────────────── языковые пакеты locales/
const LOC = join(root, 'locales');
const regSrc = readFileSync(join(root, 'src/i18n/languages.ts'), 'utf8');
// письменные варианты реестра (у голосовых нет поля script)
const registry = [...new Set([...regSrc.matchAll(/\{ code: '([^']+)', endonym: '[^']*', nameRu: '[^']*', script:/g)].map((m) => m[1]))];
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
if (!existsSync(LOC)) errors.push('нет папки locales/ — запустите tools/content_build.py');
const files = existsSync(LOC) ? readdirSync(LOC).filter((f) => f.endsWith('.json') && f !== '_meta.json') : [];
const packs = {};
for (const f of files) packs[f.replace(/\.json$/, '')] = readJson(join(LOC, f));
const meta = existsSync(join(LOC, '_meta.json')) ? readJson(join(LOC, '_meta.json')) : { variants: {}, total: 0 };
for (const code of registry) if (!packs[code]) errors.push(`нет пакета locales/${code}.json для варианта из реестра`);
for (const code of Object.keys(packs)) if (!registry.includes(code)) errors.push(`пакет locales/${code}.json — варианта нет в реестре src/i18n/languages.ts`);
const ru = packs['ru-RU'] ?? {};
const allKeys = new Set(Object.values(packs).flatMap((p) => Object.keys(p)));
const notInRu = [...allKeys].filter((k) => !(k in ru));
if (notInRu.length) errors.push(`ru-RU неполный: нет ключей ${notInRu.slice(0, 10).join(', ')}${notInRu.length > 10 ? '…' : ''}`);
if (meta.total && Object.keys(ru).length !== meta.total) errors.push(`ru-RU: ${Object.keys(ru).length} строк, а в таблице ${meta.total}`);

// ICU: каждая строка каждого пакета должна разбираться (иначе вместо фразы на экране будет «сырой» текст)
let icuChecked = 0;
const PLURAL_LOCALE = (code) => {
  for (const c of [code, ...(code.includes('-') ? [code.split('-')[0]] : []), 'ru']) {
    try { if (Intl.PluralRules.supportedLocalesOf([c]).length) return c; } catch { /* нет */ }
  }
  return 'ru';
};
for (const [code, pack] of Object.entries(packs)) {
  for (const [k, v] of Object.entries(pack)) {
    icuChecked++;
    let depth = 0, bad = false;
    for (const ch of v) { if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth < 0) bad = true; } }
    if (bad || depth !== 0) { errors.push(`ICU: непарные скобки {…} — ${code} / ${k}`); continue; }
    try {
      const mf = new IntlMessageFormat(v, PLURAL_LOCALE(code), undefined, { ignoreTag: true });
      if (v.includes('{')) mf.format({ count: 2 });
    } catch (e) {
      errors.push(`ICU: строка не читается — ${code} / ${k}: ${String(e.message).split('\n')[0]}`);
    }
  }
}

// ключи, которые использует код (поиск по исходникам) — все должны быть в ru-RU
function walk(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...walk(f));
    else if (/\.(tsx?|jsx?)$/.test(n)) out.push(f);
  }
  return out;
}
const codeKeys = new Set();
for (const f of walk(join(root, 'src'))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt(?:Opt)?\(\s*'([a-z]+\.[A-Za-z0-9_.]+)'/g)) codeKeys.add(m[1]);
  for (const m of src.matchAll(/\btFirst\(\s*\[([^\]]*)\]/g)) for (const k of m[1].matchAll(/'([a-z]+\.[A-Za-z0-9_.]+)'/g)) codeKeys.add(k[1]);
}
const required = [...new Set([...APP_UI_KEYS, ...codeKeys])];
const missingUi = required.filter((k) => !(k in ru));
// ключи с запасными вариантами (tFirst): достаточно одного из списка — проверяем отдельно
const tFirstGroups = [];
for (const f of walk(join(root, 'src'))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\btFirst\(\s*\[([^\]]*)\]/g)) tFirstGroups.push([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}
const optional = new Set(tFirstGroups.filter((g) => g.some((k) => k in ru)).flat());
const missingHard = missingUi.filter((k) => !optional.has(k));
for (const k of missingHard) errors.push(`ключа «${k}» нет в locales/ru-RU.json (его использует приложение) — добавьте строку в лист «Интерфейс»`);

console.log(`Контент: ${c.contentVersion ?? '(версия не указана)'}`);
console.log(`Источник: ${c.generatedFrom ?? '-'}`);
const uiKeys = Object.keys(c.ui ?? {});
console.log(`Точек: ${points.length} · этапов: ${stages.length} · находок: ${Object.keys(artifacts).length} · строк интерфейса: ${uiKeys.length} · строк в пакете: ${meta.total}`);
console.log('');
console.log('точка | этап | статус      | чего не хватает');
console.log('------+------+-------------+----------------');
for (const r of rows) {
  console.log(`${String(r.id).padEnd(5)} | ${String(r.stage).padEnd(4)} | ${(r.ready ? 'готова' : 'не готова').padEnd(11)} | ${r.miss.join(', ') || '—'}`);
}
console.log('');
console.log(`Языковые пакеты (${registry.length} вариантов в реестре; строк ICU проверено: ${icuChecked}; ключей из кода: ${codeKeys.size}):`);
for (const code of registry) {
  const n = Object.keys(packs[code] ?? {}).length;
  const st = meta.variants?.[code]?.status ?? '';
  const pct = meta.total ? Math.round((100 * n) / meta.total) : 0;
  console.log(`  ${code.padEnd(9)} ${String(n).padStart(4)}/${meta.total} (${String(pct).padStart(3)}%) ${st}${n === 0 ? ' — пока фолбэк (готовится)' : ''}`);
}
console.log(`Строки интерфейса, которых нет в ru-RU: ${missingUi.length ? missingUi.join(', ') : '—'}`);

if (errors.length) {
  console.log('');
  for (const e of errors) console.error('ОШИБКА СТРУКТУРЫ:', e);
  process.exit(1);
}
console.log('');
console.log('Структура в порядке. Недостающие тексты не мешают сборке — в приложении они помечены «готовится».');
