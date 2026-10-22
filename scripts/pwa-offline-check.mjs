// Проверка PWA: ставится ли веб-версия «как приложение» и работает ли без интернета.
// Что делает: поднимает маленький сервер (как nginx) для папки сборки, открывает Chromium (Playwright),
//  1) ждёт, пока установится сервис-воркер и скачает все файлы;
//  2) проверяет манифест и иконку для iPhone;
//  3) ВЫКЛЮЧАЕТ интернет и перезагружает /route, затем открывает страницы, где ещё не были (/finds, /point/3);
//  4) проверяет подсказку «установить на iPhone» во вкладке «О проекте»;
//  5) языковой пакет: после выбора китайского его шрифт сохранён и работает без интернета.
// Снимки: qa/screens/20_pwa_offline.png (и для подпапки — 21_pwa_offline_<папка>.png), 22_about_pwa_hint.png.
// Перед запуском: npm run web:export (и/или npm run web:export:turizm)
// Запуск: node scripts/pwa-offline-check.mjs [--dir dist] [--base /]
//         node scripts/pwa-offline-check.mjs --dir dist_turizm_app --base /turizm/app
// Проверка настоящего сервера (например, nginx): --url http://127.0.0.1:8090 --stop-cmd "команда, которая его остановит"
//   (так имитируем пропажу интернета; сервер после проверки нужно запустить снова)
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const DIR_NAME = arg('dir', 'dist');
const DIR = join(root, DIR_NAME);
let BASE = arg('base', '/');
if (!BASE.startsWith('/')) BASE = '/' + BASE;
BASE = BASE.replace(/\/+$/, '');
const OUT = join(root, 'qa/screens');
const PORT = Number(process.env.QA_PORT || 8098);
const EXTERNAL = arg('url'); // внешний сервер вместо встроенного
const STOP_CMD = arg('stop-cmd');
const ORIGIN = EXTERNAL ? EXTERNAL.replace(/\/+$/, '') : `http://127.0.0.1:${PORT}`;
const SITE = `${ORIGIN}${BASE}`;
const shotName = BASE ? `21_pwa_offline_${DIR_NAME.replace(/^dist_?/, '') || 'base'}.png` : '20_pwa_offline.png';

if (!existsSync(join(DIR, 'sw.js'))) {
  console.error(`Нет ${DIR_NAME}/sw.js. Сначала: npm run web:export (или web:export:turizm)`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

// --- сервер, ведёт себя как nginx: try_files $uri $uri.html $uri/index.html ---
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};
let served = 0;
let networkDown = false; // «интернет выключен»: сервер обрывает любое соединение
let attemptsWhileDown = 0;
const server = createServer((req, res) => {
  if (networkDown) {
    attemptsWhileDown++;
    req.socket.destroy();
    return;
  }
  served++;
  let path = decodeURIComponent((req.url || '/').split('?')[0]);
  if (BASE && !path.startsWith(BASE + '/')) {
    res.writeHead(404).end('not found');
    return;
  }
  path = path.slice(BASE.length) || '/';
  const cands = [join(DIR, path), join(DIR, path + '.html'), join(DIR, path, 'index.html')];
  const f = cands.find((c) => existsSync(c) && statSync(c).isFile());
  if (!f) {
    res.writeHead(404, { 'content-type': TYPES['.html'] }).end('not found');
    return;
  }
  const headers = { 'content-type': TYPES[extname(f)] || 'application/octet-stream' };
  if (f.endsWith('sw.js')) headers['cache-control'] = 'no-cache';
  res.writeHead(200, headers).end(readFileSync(f));
});
if (!EXTERNAL) await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const executablePath = process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const results = [];
const ok = (name, pass, info = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'ДА ' : 'НЕТ'} | ${name}${info ? ' — ' + info : ''}`);
};

const waitRendered = (page) =>
  page.waitForFunction(() => (document.getElementById('root')?.innerText || '').trim().length > 20, null, { timeout: 15000 });

try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU' });
  const page = await ctx.newPage();

  // 1. первое открытие с интернетом
  await page.goto(`${SITE}/`);
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  ok('сервис-воркер установлен (navigator.serviceWorker.ready)', !!scope, scope);

  const precacheCount = (readFileSync(join(DIR, 'sw.js'), 'utf8').match(/const PRECACHE = (\[.*\]);/) || [])[1];
  const expected = precacheCount ? JSON.parse(precacheCount).length : 0;
  await page.waitForFunction(
    async (n) => {
      const keys = await caches.keys();
      const k = keys.find((x) => x.startsWith('na-cheboksare-'));
      if (!k) return false;
      return (await (await caches.open(k)).keys()).length >= n;
    },
    expected,
    { timeout: 30000, polling: 300 },
  );
  ok('все файлы сайта скачаны в кэш', true, `${expected} файлов`);

  // 2. манифест и иконка
  const man = await page.evaluate(async () => {
    const href = document.querySelector('link[rel="manifest"]')?.getAttribute('href');
    const r = await fetch(href);
    const j = await r.json();
    const icon = document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href');
    const ri = await fetch(icon);
    return { href, name: j.name, display: j.display, icons: j.icons.length, icon, iconStatus: ri.status, type: r.headers.get('content-type') };
  });
  ok('манифест читается', man.name === 'На Чебоксаре' && man.display === 'standalone', `${man.href}, иконок: ${man.icons}`);
  ok('иконка для iPhone (apple-touch-icon)', man.iconStatus === 200, man.icon);

  // открываем /route с интернетом — страница теперь под управлением воркера
  await page.goto(`${SITE}/route`);
  await waitRendered(page);
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  ok('страница под управлением воркера', controlled);

  // 2б. языковой пакет: выбираем китайский — его шрифт (с 1.1.1 подмножество ≈0,3 МБ, кэшируется заранее) есть в кэше
  await page.goto(`${SITE}/language?from=pwa`);
  await page.waitForTimeout(800);
  await page.locator('[data-testid="lang-zh-Hans"]').click();
  await page.locator('[data-testid="voice-zh-CN"]').click();
  await page.waitForTimeout(500);
  const zhCached = await page
    .waitForFunction(
      async () => {
        const k = (await caches.keys()).find((x) => x.startsWith('na-cheboksare-'));
        return !!k && (await (await caches.open(k)).keys()).some((r) => /NotoSansSC[._]/.test(r.url));
      },
      null,
      { timeout: 30000, polling: 300 },
    )
    .then(() => true)
    .catch(() => false);
  ok('языковой пакет: шрифт китайского сохранён после выбора языка', zhCached);
  await page.goto(`${SITE}/route`);
  await waitRendered(page);

  // 3. выключаем интернет: и в браузере, и на сервере (сервер обрывает соединения)
  await ctx.setOffline(true);
  networkDown = true;
  if (EXTERNAL && STOP_CMD) {
    execSync(STOP_CMD, { stdio: 'inherit' });
    console.log('внешний сервер остановлен — сети «нет»');
  }
  const before = served;
  const r1 = await page.reload();
  await waitRendered(page);
  ok('без интернета: перезагрузка /route', r1?.status() === 200, `статус ${r1?.status()}, из воркера: ${r1?.fromServiceWorker()}`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, shotName) });
  console.log('снимок:', join(OUT, shotName));

  for (const p of ['/finds', '/point/3', '/point/6', '/finish/1', '/prologue', '/about']) {
    const r = await page.goto(`${SITE}${p}`);
    await waitRendered(page);
    ok(`без интернета: ${p} (ещё не открывали)`, r?.status() === 200, `статус ${r?.status()}`);
  }

  // 3б. без интернета китайский шрифт берётся из кэша (тофу нет, вид тот же)
  await page.goto(`${SITE}/route`);
  await waitRendered(page);
  const zhFont = await page
    .waitForFunction(() => [...document.fonts].some((f) => f.family.replace(/["']/g, '') === 'NotoSansSC' && f.status === 'loaded'), null, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  ok('без интернета: выбранный китайский — со своим шрифтом', zhFont);
  await page.goto(`${SITE}/about`);
  await waitRendered(page);

  // 4. подсказка «установить на iPhone» на вкладке «О проекте» (мы в браузере, не «как приложение»)
  const hint = page.locator('[data-testid="pwa-hint"]').first();
  await hint.waitFor({ timeout: 5000 }).catch(() => undefined);
  const hintVisible = await hint.isVisible().catch(() => false);
  ok('подсказка «установить на iPhone» видна в браузере', hintVisible);
  if (hintVisible && !BASE) {
    await hint.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, '22_about_pwa_hint.png') });
    console.log('снимок:', join(OUT, '22_about_pwa_hint.png'));
  }
  if (!EXTERNAL) ok('без интернета ни один файл не пришёл с сервера', served === before, `попыток выйти в сеть: ${attemptsWhileDown}, все оборваны`);
  await ctx.close();
} catch (e) {
  ok('сценарий прошёл без сбоев', false, e.message.split('\n')[0]);
} finally {
  await browser.close();
  if (!EXTERNAL) server.close();
}

const failed = results.filter((r) => !r.pass).length;
console.log(`\nИтог (${DIR_NAME}, путь ${BASE || '/'}): ${results.length - failed} из ${results.length} проверок пройдено.`);
process.exit(failed ? 1 : 0);
