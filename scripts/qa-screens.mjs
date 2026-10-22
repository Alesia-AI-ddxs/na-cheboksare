// Снимки экранов веб-версии для проверки (QA).
// Что делает: поднимает маленький сервер для папки dist/, открывает Chromium (Playwright)
// в размере телефона 390×844, проходит сценарий и сохраняет PNG в qa/screens/.
// Перед запуском: npm run web:export
// Запуск: npm run qa:screens
// Браузер: берётся из PW_CHROMIUM или /opt/pw-browsers/chromium (playwright install НЕ нужен).
import fs from 'node:fs';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const OUT = join(root, 'qa/screens');
const PORT = Number(process.env.QA_PORT || 8099);
const BASE = `http://127.0.0.1:${PORT}`;
const VIEW = { width: 390, height: 844 };

if (!existsSync(DIST)) {
  console.error('Нет папки dist/. Сначала: npm run web:export');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const cands = [join(DIST, clean), join(DIST, clean + '.html'), join(DIST, clean, 'index.html')];
  for (const c of cands) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
}
const server = createServer((req, res) => {
  const f = resolveFile(req.url || '/');
  if (!f) {
    const nf = join(DIST, '+not-found.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end(existsSync(nf) ? readFileSync(nf) : 'not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const executablePath = process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const shots = [];
const errors = [];

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2, locale: 'ru-RU', reducedMotion: 'reduce', ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return { ctx, page };
}
const byId = (page, id) => page.locator(`[data-testid="${id}"]`).first();
async function shot(page, name) {
  await page.waitForTimeout(500);
  const path = join(OUT, name);
  await page.screenshot({ path });
  shots.push(path);
  console.log('снимок:', path);
}
async function scrollTo(page, id) {
  await byId(page, id).evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
}

try {
  // 1. Пролог (ru)
  {
    const { ctx, page } = await newPage();
    await page.goto(`${BASE}/prologue`);
    await byId(page, 'title').waitFor();
    await byId(page, 'lang-ru-RU').click();
    await shot(page, '01_prologue_ru.png');

    // 2. Маршрут, этап I
    await scrollTo(page, 'mode-here');
    await byId(page, 'mode-here').click();
    await byId(page, 'start').click();
    await page.waitForURL(/\/route/);
    await byId(page, 'stage-1').waitFor();
    await shot(page, '02_route_stage1_ru.png');

    // точка 0 (пролог без задания): «Дальше» засчитывает точку и ведёт к точке 1
    await byId(page, 'point-row-0').click();
    await page.waitForURL(/\/point\/0/);
    await scrollTo(page, 'continue');
    await byId(page, 'continue').click();
    await byId(page, 'next').waitFor();
    await byId(page, 'next').click();
    await page.waitForURL(/\/point\/1/);

    // 3. Точка 1: верх (портрет Олеария) и задание с верным ответом
    await page.waitForTimeout(400);
    await shot(page, '03a_point1_top_ru.png');
    await scrollTo(page, 'quiz-question');
    await byId(page, 'opt-0').click(); // сначала неверно (−попытка)
    await byId(page, 'opt-1').click(); // верно → 60 очков
    await scrollTo(page, 'quiz-question');
    await shot(page, '03_point1_quiz_correct_ru.png');
    await scrollTo(page, 'next');
    await shot(page, '03b_point1_find_ru.png');

    // точки 2, 3, 8 — верный ответ берём из content.json, затем финал этапа I
    const content = JSON.parse(fs.readFileSync(new URL('../src/content/content.json', import.meta.url), 'utf8'));
    const correctOf = (id) => content.points.find((p) => p.id === id)?.quiz?.correct;
    for (const id of [2, 3, 8]) {
      await byId(page, 'next').click();
      await page.waitForURL(new RegExp(`/point/${id}`));
      const c = correctOf(id);
      if (c === undefined) {
        await scrollTo(page, 'continue');
        await byId(page, 'continue').click();
      } else {
        await scrollTo(page, `opt-${c}`);
        await byId(page, `opt-${c}`).click();
      }
      if (id === 8) {
        await page.waitForTimeout(300);
        await shot(page, '06a_point8_quiz_ru.png');
      }
    }
    await byId(page, 'next').click();
    await page.waitForURL(/\/finish\/1/);
    await byId(page, 'finish-title').waitFor();
    await shot(page, '06_finish_stage1_ru.png');

    // 4. Находки
    await page.goto(`${BASE}/finds`);
    await byId(page, 'art-A1_KRESALO').waitFor();
    await shot(page, '04_finds_ru.png');

    // 5. О проекте
    await page.goto(`${BASE}/about`);
    await page.waitForTimeout(800);
    await shot(page, '05_about_ru.png');

    // этап II: точки 4–7 — верх сцены, верный ответ, финал этапа II
    for (const id of [4, 5, 6, 7]) {
      await page.goto(`${BASE}/point/${id}`);
      await page.waitForTimeout(700);
      await shot(page, `11_point${id}_scene_ru.png`);
      const c = correctOf(id);
      if (c === undefined) {
        await scrollTo(page, 'continue');
        await byId(page, 'continue').click();
      } else {
        await scrollTo(page, `opt-${c}`);
        await byId(page, `opt-${c}`).click();
      }
      await byId(page, 'next').waitFor();
      if (id === 7) {
        await scrollTo(page, 'next');
        await shot(page, '12_point7_find_ru.png');
        await byId(page, 'next').click();
        await page.waitForURL(/\/finish\/2/);
        await byId(page, 'finish-title').waitFor();
        await shot(page, '13_finish_stage2_ru.png');
      }
    }

    // маршрут после этапа I (этап II открыт)
    await page.goto(`${BASE}/route`);
    await byId(page, 'stage-2').waitFor();
    await shot(page, '07_route_stage2_unlocked_ru.png');
    await ctx.close();
  }

  // 6. Пролог на английском (en-GB)
  {
    const { ctx, page } = await newPage({ locale: 'en-GB' });
    await page.goto(`${BASE}/prologue`);
    await byId(page, 'title').waitFor();
    await byId(page, 'lang-en-GB').click();
    await shot(page, '08_prologue_en-GB.png');
    await ctx.close();
  }

  // 7. Тёмная тема: маршрут
  {
    const { ctx, page } = await newPage({ colorScheme: 'dark' });
    await page.goto(`${BASE}/prologue`);
    await byId(page, 'title').waitFor();
    await byId(page, 'start').click();
    await page.waitForURL(/\/route/);
    await byId(page, 'stage-1').waitFor();
    await shot(page, '09_route_dark_ru.png');
    await page.goto(`${BASE}/point/2`);
    await page.waitForTimeout(800);
    await shot(page, '10_point2_dark_ru.png');
    await ctx.close();
  }
} catch (e) {
  console.error('СЦЕНАРИЙ ПРЕРВАН:', e.message);
  errors.push('scenario: ' + e.message);
} finally {
  await browser.close();
  server.close();
}

console.log(`\nСнимков: ${shots.length}. Папка: ${OUT}`);
if (errors.length) {
  console.log('Ошибки в консоли браузера:');
  for (const e of [...new Set(errors)]) console.log(' -', e.slice(0, 300));
}
process.exit(errors.some((e) => e.startsWith('scenario')) ? 1 : 0);
