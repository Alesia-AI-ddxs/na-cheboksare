// Проверка «Лаборатории замеров» (v1.2.0) на подставных цифрах — без телефона и без браузера.
// 1) Итог go/no-go по правилу владельца (src/lab/thresholds.ts): зелёный / жёлтый / красный / нет данных — 10 случаев,
//    включая ровно-на-пороге и «чуть ниже порога».
// 2) Расчёт кадров (fpsStats): ровные 60 к/с, 30 к/с, рывки — средний, минимальный, доля тяжёлых кадров.
// 3) Отчёт (buildReport): первая строка «LAB na-cheboksare v<версия> <дата>», все строки «ключ: значение»,
//    нет пустых значений (нет данных = «-»), нет имени устройства и прочих личных полей, итог совпадает с правилом.
// 4) Ссылка «вариант Э» (src/unity/appLink.ts): <схема>://scene/<точка>?lang=<язык>&code=<код>; пустая схема — ссылки нет.
// 5) Пороги в одном месте: числа 30 / 24 / 24 есть только в src/lab/thresholds.ts (в остальном коде лаборатории — нет).
// Запуск: npm run qa:lab
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');

// маленький загрузчик: TS → CommonJS в памяти (только относительные импорты внутри src/)
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const src = readFileSync(file, 'utf8');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  cache.set(file, mod);
  const req = (spec) => {
    if (!spec.startsWith('.')) throw new Error(`lab-check: внешний импорт ${spec} в ${file} — модуль должен быть «чистым»`);
    return load(join(dirname(file), spec.endsWith('.ts') ? spec : spec + '.ts'));
  };
  vm.runInThisContext(`(function (exports, require, module) {${out}\n})`, { filename: file })(mod.exports, req, mod);
  return mod.exports;
}
const R = load(join(root, 'src/lab/report.ts'));
const { LAB_THRESHOLDS: T } = load(join(root, 'src/lab/thresholds.ts'));
const { unity3dLink } = load(join(root, 'src/unity/appLink.ts'));

const checks = [];
const check = (name, pass, info = '') => {
  checks.push({ name, pass: !!pass });
  console.log(`${pass ? 'ДА ' : 'НЕТ'} | ${name}${info !== '' ? ' — ' + info : ''}`);
};

// ───────────── 1) итог
console.log(`Пороги: зелёный — с1 ≥ ${T.greenStage1Fps} и с2 ≥ ${T.greenStage2Fps}; жёлтый — с1 ≥ ${T.yellowStage1Fps}; иначе красный\n`);
const CASES = [
  [60, 58, 'green', 'флагман: 60 / 58'],
  [30, 24, 'green', 'ровно на порогах 30 / 24'],
  [45, 23.9, 'yellow', 'с1 быстро, с2 чуть ниже 24'],
  [29.9, 29, 'yellow', 'с1 чуть ниже 30'],
  [24, 10, 'yellow', 'с1 ровно 24'],
  [31, null, 'yellow', 'ступень 2 не замерена'],
  [23.9, 23, 'red', 'с1 чуть ниже 24'],
  [12, 5, 'red', 'слабый телефон 12 / 5'],
  [0, 0, 'red', 'ноль кадров'],
  [null, null, 'none', '3D не запускали'],
  [NaN, 30, 'none', 'битое число'],
];
for (const [s1, s2, want, name] of CASES) {
  const got = R.verdict(s1, s2);
  check(`итог: ${name} → ${want}`, got === want, `получено ${got}`);
}

// ───────────── 2) кадры
const frames = (fps, sec, jitter) => {
  const out = [];
  let t = 1000;
  for (let i = 0; i < fps * sec; i++) {
    out.push(t);
    t += jitter ? jitter(i) : 1000 / fps;
  }
  return out;
};
const s60 = R.fpsStats(frames(60, 10), 500);
check('кадры: ровные 60 к/с → средний ≈ 60, тяжёлых 0 %', Math.abs(s60.avg - 60) < 0.6 && s60.heavyPct === 0 && s60.min >= 59, JSON.stringify(s60));
const s30 = R.fpsStats(frames(30, 10), 500);
check('кадры: ровные 30 к/с → средний ≈ 30, тяжёлых 0 % (33,3 мс — не тяжёлый)', Math.abs(s30.avg - 30) < 0.6 && s30.heavyPct === 0, JSON.stringify(s30));
// каждый 10-й кадр — 100 мс (рывок)
const sj = R.fpsStats(frames(50, 10, (i) => (i % 10 === 9 ? 100 : 16.7)), 500);
check('кадры: рывки каждый 10-й кадр → тяжёлых ≈ 10 %, минимум < среднего', sj.heavyPct > 8 && sj.heavyPct < 12 && sj.min <= sj.avg, JSON.stringify(sj));
// провал в одной секунде: 2 с по 10 к/с внутри 60 к/с — минимум ловит худшую секунду
const dip = [];
let tt = 0;
for (let s = 0; s < 10; s++) for (let i = 0; i < (s === 5 ? 10 : 60); i++) dip.push((tt += 1000 / (s === 5 ? 10 : 60)));
const sd = R.fpsStats(dip, 0);
check('кадры: провал в одну секунду → минимум ≤ 20 к/с при среднем > 50', sd.min <= 20 && sd.avg > 50, JSON.stringify(sd));
check('кадры: меньше 3 кадров → нет данных (null)', R.fpsStats([1, 2], 0) === null);

// ───────────── 3) отчёт
const device = {
  platform: 'android', manufacturer: 'HUAWEI', model: 'P30 lite', os: 'Android 10', apiLevel: 29, ramMb: 3712, yearClass: 2019,
  cpuArch: 'arm64-v8a', cpuCores: null, diskFreeMb: 20480, diskTotalMb: 122880, screenDp: { w: 360, h: 780 }, pixelRatio: 3,
  fontScale: 1, phoneLocale: 'ru-RU', phoneRegion: 'RU',
};
const st = (objects, avg, min) => ({ objects, triangles: objects * 20000, stats: { avg, min, heavyPct: 2.5, frames: 300, seconds: 9.5 }, firstFrameMs: 140, glErrors: 0 });
const mk = (s1, s2, s3) => ({
  appVersion: '1.2.0', contentVersion: '2.9', appLang: 'ru-RU', device,
  start: { jsToScreenMs: 812, originToScreenMs: null },
  r2d: { elements: 40, stats: { avg: 58.2, min: 51, heavyPct: 1.1, frames: 560, seconds: 9.5 } },
  r3d: { available: true, renderer: 'Mali-G51', glVersion: 'OpenGL ES 3.2', canvasPx: { w: 1080, h: 1440 }, textureSize: 2048, trianglesPerObject: 20000, setupMs: 640, setupErrors: 0, errorText: null, stages: [st(1, s1, s1 - 3), st(4, s2, s2 - 4), st(8, s3, s3 - 5)] },
});
const date = new Date(2026, 9, 23, 12);
for (const [s1, s2, s3, want] of [[59, 41, 22, 'green'], [33, 20, 9, 'yellow'], [18, 9, 4, 'red']]) {
  const rep = R.buildReport(mk(s1, s2, s3), date);
  const lines = rep.split('\n');
  const kv = Object.fromEntries(lines.slice(1).map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 2)]));
  check(`отчёт (${want}): первая строка «LAB na-cheboksare v1.2.0 2026-10-23»`, lines[0] === 'LAB na-cheboksare v1.2.0 2026-10-23', lines[0]);
  check(`отчёт (${want}): все строки «ключ: значение», значение не пустое`, lines.slice(1).every((l) => /^[a-z0-9_]+: \S/.test(l)), `${lines.length} строк`);
  check(`отчёт (${want}): verdict = ${want}`, kv.verdict === want, kv.verdict);
  check(`отчёт (${want}): ступени 3D с1–с3 и средние к/с в отчёте`, kv['3d_s1_fps_avg'] === String(s1) && kv['3d_s2_fps_avg'] === String(s2) && kv['3d_s3_objects'] === '8');
}
const rep = R.buildReport(mk(59, 41, 22), date);
check('отчёт: нет личных полей (имя устройства, аккаунт, e-mail, код прохождения)', !/device_name|deviceName|account|e-?mail|@|ND-[A-Z0-9]{4}/i.test(rep));
const empty = R.buildReport({ ...mk(1, 1, 1), r2d: null, r3d: null, start: { jsToScreenMs: null, originToScreenMs: null }, device: { ...device, ramMb: null, model: null } }, date);
check('отчёт без замеров: «-» вместо пустого, verdict none', /\nram_mb: -\n/.test(empty) && /\nmodel: -\n/.test(empty) && /\nverdict: none\n/.test(empty));

// ───────────── 4) ссылка «вариант Э»
check('вариант Э: nacheboksare3d://scene/2?lang=ru-RU&code=ND-9EXU', unity3dLink('nacheboksare3d', 2, 'ru-RU', 'ND-9EXU') === 'nacheboksare3d://scene/2?lang=ru-RU&code=ND-9EXU');
check('вариант Э: без кода — только lang', unity3dLink('nacheboksare3d', 0, 'zh-Hans', undefined) === 'nacheboksare3d://scene/0?lang=zh-Hans');
check('вариант Э: пустая схема — ссылки нет', unity3dLink('', 2, 'ru-RU', 'ND-9EXU') === undefined && unity3dLink(undefined, 2) === undefined);
check('вариант Э: битая схема / код с «·» — схема отвергается, код пропускается',
  unity3dLink('3d app', 1, 'ar') === undefined && unity3dLink('x3d', 1, 'ar', 'ND-····') === 'x3d://scene/1?lang=ar');

// ───────────── 5) пороги в одном месте
const labDir = join(root, 'src/lab');
const files = readdirSync(labDir).filter((f) => /\.tsx?$/.test(f) && f !== 'thresholds.ts');
const leaks = [];
for (const f of [...files.map((x) => join(labDir, x)), join(root, 'src/app/lab.tsx')]) {
  const src = readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '');
  if (/(>=|<=|<|>)\s*(30|24)\b/.test(src)) leaks.push(f.slice(root.length + 1));
}
check('пороги 30 / 24 к/с заданы только в src/lab/thresholds.ts', leaks.length === 0, leaks.join(', '));

const failed = checks.filter((c) => !c.pass);
console.log(`\nПроверок: ${checks.length}, пройдено: ${checks.length - failed.length}`);
process.exit(failed.length ? 1 : 0);
