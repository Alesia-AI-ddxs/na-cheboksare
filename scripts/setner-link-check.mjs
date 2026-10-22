// Проверка формата ссылки на Сетнера (решение владельца 22.10.2026): npm run qa:setner
// Telegram передаёт боту только start: start=<код>_<письменный>[_<голосовой>], латиница/цифры/«_»/«-», не длиннее 64.
// Берём настоящий код приложения (src/setnerLink.ts), переводим его из TypeScript в JS (пакет typescript, уже в проекте)
// и прогоняем случаи: обычные, с другим произношением, длинные коды, недопустимые знаки, без кода.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/setnerLink.ts'), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const { setnerLink, setnerStart, START_MAX } = mod;

const BOT = 'https://t.me/Setner_Cheboksary_bot';
const long = (n) => 'ND-' + 'X'.repeat(n - 3);
const cases = [
  ['арабский, голос = письмо по умолчанию (ar-SA ≠ ar → голос пишем)', ['ND-9EXU', 'ar', 'ar-SA'], 'ND-9EXU_ar_ar-SA'],
  ['один голос, совпадает с письменным → без третьего поля', ['ND-9EXU', 'ru-RU', 'ru-RU'], 'ND-9EXU_ru-RU'],
  ['без голоса', ['ND-9EXU', 'ar', undefined], 'ND-9EXU_ar'],
  ['английский британский письменно, американское произношение', ['ND-9EXU', 'en-GB', 'en-US'], 'ND-9EXU_en-GB_en-US'],
  ['китайский упрощённый, кантонское произношение', ['ND-9EXU', 'zh-Hans', 'yue-HK'], 'ND-9EXU_zh-Hans_yue-HK'],
  ['длинный код: голос не помещается → отбрасываем голос', [long(START_MAX - 9), 'zh-Hans', 'zh-CN-sichuan'], `${long(START_MAX - 9)}_zh-Hans`],
  ['ещё длиннее: не помещается и язык → только код', [long(START_MAX - 3), 'zh-Hans', 'zh-CN-sichuan'], long(START_MAX - 3)],
  ['код ровно 64 знака → только код', [long(64), 'ar', 'ar-EG'], long(64)],
  ['недопустимый знак в голосе (точка) → голос отбрасываем', ['ND-9EXU', 'de-DE', 'de.CH'], 'ND-9EXU_de-DE'],
  ['кода нет → ссылка без start', ['', 'ar', 'ar-SA'], undefined],
  ['код ещё не загружен (ND-····) → ссылка без start', ['ND-····', 'ru-RU', 'ru-RU'], undefined],
];

let ok = 0;
const fail = [];
for (const [name, args, want] of cases) {
  const got = setnerStart(...args);
  const url = setnerLink(BOT, ...args);
  const wantUrl = want ? `${BOT}?start=${want}` : BOT;
  const rules = got === undefined || (got.length <= START_MAX && /^[A-Za-z0-9_-]+$/.test(got) && got.startsWith(args[0]));
  const pass = got === want && url === wantUrl && rules;
  console.log(`${pass ? 'ДА ' : 'НЕТ'} | ${name}: ${url}`);
  if (pass) ok++;
  else fail.push(`${name}: ждали start=${want}, получили ${got} (${url})`);
}
// старых параметров &lang= &voice= быть не должно нигде
const extra = setnerLink(BOT, 'ND-9EXU', 'en-GB', 'en-IE');
if (/[&?](lang|voice)=/.test(extra)) fail.push(`в ссылке остались параметры lang/voice: ${extra}`);
else ok++;
console.log(`${/[&?](lang|voice)=/.test(extra) ? 'НЕТ' : 'ДА '} | нет отдельных параметров &lang= &voice=: ${extra}`);
// ссылка на бота строится только в src/setnerLink.ts
const total = cases.length + 1;
console.log(`\nИтог: ${ok} из ${total} случаев пройдено.`);
for (const f of fail) console.error('ОШИБКА:', f);
process.exit(fail.length ? 1 : 0);
