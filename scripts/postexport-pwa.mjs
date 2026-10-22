// Шаг после веб-сборки: превращает папку dist/ в «устанавливаемое приложение» (PWA), которое работает без интернета.
// Что делает:
//  1) находит все файлы сайта в папке сборки и записывает их список в sw.js (чтобы скачать их заранее);
//  2) ставит в sw.js номер версии (меняется, если поменялся хоть один файл — тогда телефоны получат обновление);
//  3) проверяет, что в каждой странице есть ссылки на манифест и иконку с правильным путём сайта
//     (для корня «/» или для подпапки, например «/turizm/app»), и чинит их, если путь не тот;
//  4) проверяет, что манифест и иконки на месте.
// Запуск: node scripts/postexport-pwa.mjs [--dir dist] [--base /turizm/app]
// Путь сайта берётся так: --base → переменная PWA_BASE → app.json (experiments.baseUrl) → «/».
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function normBase(b) {
  let s = String(b ?? '/').trim();
  if (!s.startsWith('/')) s = '/' + s;
  s = s.replace(/\/+$/, '');
  return s; // '' для корня, '/turizm/app' для подпапки
}

function baseFromAppJson() {
  try {
    const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
    return app?.expo?.experiments?.baseUrl;
  } catch {
    return undefined;
  }
}

const DIR = join(root, arg('dir') ?? 'dist');
const BASE = normBase(arg('base') ?? process.env.PWA_BASE ?? baseFromAppJson() ?? '/');

if (!existsSync(DIR)) {
  console.error(`ОШИБКА: нет папки ${DIR}. Сначала соберите веб-версию.`);
  process.exit(1);
}

// --- 1. список файлов для заранее скачанного кэша ---
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const SKIP = [
  /^sw\.js$/, // сам воркер
  /\.map$/, // карты исходников
  /^_expo\/\.routes\.json$/, // служебный файл
  /^_sitemap\.html$/, // служебная страница Expo
  /^\(tabs\)\//, // дубли страниц вкладок (адреса /route и т.п. ведут на route.html)
  /\[/, // шаблоны страниц вида [id].html — все реальные страницы уже собраны отдельно
  /(^|\/)\./, // скрытые файлы
];
const files = walk(DIR)
  .map((f) => relative(DIR, f).split(sep).join('/'))
  .filter((rel) => !SKIP.some((re) => re.test(rel)))
  .sort();

const hash = createHash('sha256');
for (const rel of files) {
  hash.update(rel);
  hash.update(readFileSync(join(DIR, rel)));
}
const VERSION = hash.digest('hex').slice(0, 12);
const totalBytes = files.reduce((s, rel) => s + statSync(join(DIR, rel)).size, 0);

// --- 2. заполняем шаблон sw.js ---
const tplPath = join(root, 'public/sw.js');
let sw = readFileSync(tplPath, 'utf8');
const fill = (marker, line) => {
  const re = new RegExp(`^.*// ${marker}$`, 'm');
  if (!re.test(sw)) {
    console.error(`ОШИБКА: в public/sw.js нет строки с меткой ${marker}`);
    process.exit(1);
  }
  sw = sw.replace(re, () => line);
};
fill('__BUILT__', 'const BUILT = true; // собрано scripts/postexport-pwa.mjs');
fill('__VERSION__', `const VERSION = '${VERSION}'; // путь сайта: ${BASE || '/'}`);
fill('__PRECACHE__', `const PRECACHE = ${JSON.stringify(files, null, 0)};`);
writeFileSync(join(DIR, 'sw.js'), sw);

// --- 3. проверяем и при необходимости чиним ссылки в страницах ---
const need = [
  ['rel="manifest"', `href="${BASE}/manifest.webmanifest"`, /href="[^"]*\/manifest\.webmanifest"/g, `href="${BASE}/manifest.webmanifest"`],
  ['rel="apple-touch-icon"', `href="${BASE}/apple-touch-icon.png"`, /href="[^"]*\/apple-touch-icon\.png"/g, `href="${BASE}/apple-touch-icon.png"`],
  ['serviceWorker', `'${BASE}/sw.js'`, /'[^']*\/sw\.js', \{ scope: '[^']*' \}/g, `'${BASE}/sw.js', { scope: '${BASE}/' }`],
];
const htmls = files.filter((f) => f.endsWith('.html'));
let fixed = 0;
const missing = [];
for (const rel of htmls) {
  const p = join(DIR, rel);
  let html = readFileSync(p, 'utf8');
  let changed = false;
  for (const [marker, expected, re, repl] of need) {
    if (!html.includes(marker)) {
      missing.push(`${rel}: нет ${marker}`);
      continue;
    }
    if (!html.includes(expected)) {
      html = html.replace(re, repl);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(p, html);
    fixed++;
  }
}

// --- 4. манифест и иконки на месте ---
const mustExist = ['manifest.webmanifest', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'index.html'];
const absent = mustExist.filter((f) => !existsSync(join(DIR, f)));

console.log('PWA: готово');
console.log(`  папка:            ${relative(root, DIR) || '.'}`);
console.log(`  путь сайта:       ${BASE || '/'}`);
console.log(`  версия кэша:      ${VERSION}`);
console.log(`  файлов в кэше:    ${files.length} (${(totalBytes / 1024 / 1024).toFixed(1)} МБ)`);
console.log(`  страниц проверено: ${htmls.length}, исправлено путей: ${fixed}`);
if (missing.length) {
  console.error('ОШИБКА: в страницах нет PWA-ссылок (проверьте src/app/+html.tsx):');
  for (const m of missing.slice(0, 10)) console.error('  -', m);
}
if (absent.length) console.error('ОШИБКА: нет файлов:', absent.join(', '), '(проверьте папку public/ и npm run icons)');
process.exit(missing.length || absent.length ? 1 : 0);
