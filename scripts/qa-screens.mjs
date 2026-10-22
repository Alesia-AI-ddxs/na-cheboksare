// Снимки экранов веб-версии для проверки (QA).
// Что делает: поднимает маленький сервер для папки dist/, открывает Chromium (Playwright)
// в размере телефона 390×844, проходит сценарии и сохраняет PNG в qa/screens/.
// Языковой модуль (v1.1.0, приёмка этапа 1, ТЗ мультиязычности р.10):
//  - первый запуск → экран выбора языка (автоопределение по языку браузера);
//  - полный проход «выбор языка → пролог → маршрут → точка с заданием → находка → финал → находки → о проекте → Сетнер»
//    на трёх показательных локалях: en-GB, ar (справа налево — с проверкой зеркальности), zh-Hans;
//  - «тофу»: шрифт письма загружен (document.fonts) + тест-строки из листа ЯЗЫКИ нарисованы на снимках;
//  - смена языка на лету и после перезагрузки (выбор запоминается в браузере);
//  - ссылка на Сетнера несёт lang/voice.
// Итог проверок — qa/qa_report.json (ДА/НЕТ по каждому пункту).
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
const checks = [];
const check = (name, pass, info = '') => {
  checks.push({ name, pass: !!pass, info: String(info ?? '') });
  console.log(`${pass ? 'ДА ' : 'НЕТ'} | ${name}${info !== '' && info !== undefined ? ' — ' + info : ''}`);
};
const META = JSON.parse(fs.readFileSync(new URL('../locales/_meta.json', import.meta.url), 'utf8'));
const LOCALE = (code) => JSON.parse(fs.readFileSync(new URL(`../locales/${code}.json`, import.meta.url), 'utf8'));
// какой шрифт у письма (зеркало src/i18n/languages.ts → fontFamily; brand = PT Sans/Prata)
const FONT_OF = { ar: 'NotoNaskhArabic', 'fa-IR': 'NotoNaskhArabic', 'zh-Hans': 'NotoSansSC', 'zh-Hant': 'NotoSansTC', 'yue-Hant': 'NotoSansHK', 'hi-IN': 'NotoSansDevanagari', 'mr-IN': 'NotoSansDevanagari' };
const FIRST_VOICE = { 'en-GB': 'en-GB', 'zh-Hans': 'zh-CN', ar: 'ar-SA', 'de-DE': 'de-DE', 'fr-FR': 'fr-FR' };

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
const fontLoaded = (page, family) =>
  page.evaluate(
    (fam) => [...document.fonts].some((f) => f.family.replace(/["']/g, '') === fam && f.status === 'loaded'),
    family,
  );
async function waitFont(page, family) {
  try {
    await page.waitForFunction(
      (fam) => [...document.fonts].some((f) => f.family.replace(/["']/g, '') === fam && f.status === 'loaded'),
      family,
      { timeout: 30000 },
    );
    return true;
  } catch {
    return false;
  }
}
/** Выбрать язык на экране /language (и произношение, если вариантов несколько) */
async function pickLanguage(page, code) {
  await page.waitForTimeout(500); // первый кадр страницы собран заранее — ждём, пока она «оживёт»
  await byId(page, `lang-${code}`).scrollIntoViewIfNeeded();
  await byId(page, `lang-${code}`).click();
  const v = FIRST_VOICE[code];
  if (v) {
    await byId(page, `voice-${v}`).waitFor();
    return true; // остались на шаге «произношение»
  }
  return false;
}
/** Нарисовать тест-строки «тофу» поверх страницы (шрифтом письма) и снять */
async function tofuOverlay(page, items, name) {
  await page.evaluate((list) => {
    const box = document.createElement('div');
    box.id = 'qa-tofu';
    box.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99999;padding:16px;overflow:auto;font-size:19px;line-height:1.5;color:#111';
    for (const it of list) {
      const row = document.createElement('div');
      row.style.cssText = 'margin:0 0 10px;border-bottom:1px solid #ddd;padding-bottom:6px';
      const cap = document.createElement('div');
      cap.style.cssText = 'font:11px monospace;color:#666';
      cap.textContent = `${it.code} · ${it.family}`;
      const txt = document.createElement('div');
      txt.style.fontFamily = `"${it.family}"`;
      txt.dir = 'auto';
      txt.textContent = it.text;
      row.append(cap, txt);
      box.append(row);
    }
    document.body.append(box);
  }, items);
  await page.waitForTimeout(600);
  await shot(page, name);
  await page.evaluate(() => document.getElementById('qa-tofu')?.remove());
}

try {
  // 1. Пролог (ru)
  {
    const { ctx, page } = await newPage();
    await page.goto(`${BASE}/prologue`);
    await byId(page, 'title').waitFor();
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

  // 6. Первый запуск: экран выбора языка (браузер на русском → предложен «Русский»)
  {
    const { ctx, page } = await newPage();
    await page.goto(`${BASE}/`);
    await page.waitForURL(/\/language/);
    await byId(page, 'lang-title').waitFor();
    await shot(page, '00_language_first_run_ru.png');
    check('первый запуск ведёт на экран выбора языка', page.url().includes('/language'), page.url());
    const sug = await byId(page, 'lang-continue').isVisible().catch(() => false);
    check('автоопределение: предложен язык системы (кнопка «Продолжить»)', sug);
    const flags = await page.evaluate(() => /[\u{1F1E6}-\u{1F1FF}]/u.test(document.body.innerText));
    check('на экране выбора языка нет флагов стран', !flags);
    const draftShown = await byId(page, 'draft-en-GB').isVisible().catch(() => false);
    check('метка «черновик» у варианта со статусом ЧЕРНОВИК (en-GB)', draftShown);
    const soon = await byId(page, 'lang-cv').getAttribute('aria-disabled');
    check('вариант без перевода (cv) — «готовится», выбрать нельзя (фолбэк)', soon === 'true', `aria-disabled=${soon}`);
    await ctx.close();
  }

  // 7. Три показательные локали этапа 1: полный проход
  const content = JSON.parse(fs.readFileSync(new URL('../src/content/content.json', import.meta.url), 'utf8'));
  const correctOf = (id) => content.points.find((p) => p.id === id)?.quiz?.correct;
  for (const [code, browserLocale] of [['en-GB', 'en-GB'], ['ar', 'ar'], ['zh-Hans', 'zh-CN']]) {
    const L = LOCALE(code);
    const tag = `3${['en-GB', 'ar', 'zh-Hans'].indexOf(code)}_${code}`;
    const { ctx, page } = await newPage({ locale: browserLocale });
    await page.goto(`${BASE}/`);
    await page.waitForURL(/\/language/);
    await byId(page, 'lang-title').waitFor();
    // автоопределение должно предложить именно этот вариант
    const suggested = await page.evaluate(() => document.body.innerText);
    check(`${code}: автоопределение по языку браузера (${browserLocale})`, suggested.includes(L['ui.lang_suggested'] ?? '@@'), '');
    await shot(page, `${tag}_01_language.png`);
    if (await pickLanguage(page, code)) {
      await shot(page, `${tag}_02_voice.png`);
      await byId(page, `voice-${FIRST_VOICE[code]}`).click();
    }
    await page.waitForURL(/\/prologue/);
    await byId(page, 'title').waitFor();
    const fam = FONT_OF[code];
    if (fam) {
      const ok = await waitFont(page, fam);
      check(`${code}: шрифт письма ${fam} загружен (document.fonts)`, ok);
      const chk = await page.evaluate(([f, s]) => document.fonts.check(`16px "${f}"`, s), [fam, META.variants[code].testString]);
      check(`${code}: document.fonts.check(тест-строка) = true`, chk);
    }
    await page.waitForTimeout(500);
    const titleTxt = await byId(page, 'title').innerText();
    check(`${code}: пролог на выбранном языке (ui.title)`, titleTxt.trim() === L['ui.title'].trim(), titleTxt);
    const dir = await page.evaluate(() => document.documentElement.dir);
    check(`${code}: направление письма ${code === 'ar' ? 'rtl' : 'ltr'}`, dir === (code === 'ar' ? 'rtl' : 'ltr'), dir);
    await shot(page, `${tag}_03_prologue.png`);
    // тест-строка «тофу» шрифтом письма
    await tofuOverlay(page, [{ code, family: fam ?? 'PTSans_400Regular', text: META.variants[code].testString }, ...(fam ? [] : [{ code, family: 'Prata_400Regular', text: META.variants[code].testString }])], `${tag}_00_tofu.png`);

    await scrollTo(page, 'mode-here');
    await byId(page, 'mode-here').click();
    await byId(page, 'start').click();
    await page.waitForURL(/\/route/);
    await byId(page, 'stage-1').waitFor();
    await page.waitForTimeout(400);
    await shot(page, `${tag}_04_route.png`);
    if (code === 'ar') {
      const mirrored = await page.evaluate(() => {
        const row = document.querySelector('[data-testid="point-row-0"]');
        const [num, label] = row.children;
        return num.getBoundingClientRect().left > label.getBoundingClientRect().left;
      });
      check('ar: строка точки зеркальна (номер справа, название слева)', mirrored);
      const tabs = await page.evaluate(([a, b]) => {
        const find = (txt) => [...document.querySelectorAll('div,span')].find((e) => e.childElementCount === 0 && e.textContent === txt);
        const ra = find(a)?.getBoundingClientRect();
        const rb = find(b)?.getBoundingClientRect();
        return ra && rb ? ra.left > rb.left : null;
      }, [L['ui.tab_route'], L['ui.tab_about']]);
      check('ar: вкладки зеркальны («Маршрут» справа, «О проекте» слева)', tabs === true, String(tabs));
    }
    await byId(page, 'point-row-0').click();
    await page.waitForURL(/\/point\/0/);
    if (code === 'ar') {
      await page.waitForTimeout(500);
      const back = await page.evaluate((lbl) => {
        const e = [...document.querySelectorAll('[role="button"]')].find((x) => x.textContent.includes(lbl) && x.getBoundingClientRect().width > 0);
        return e ? e.textContent : '';
      }, L['ui.back']);
      check('ar: стрелка «назад» смотрит вправо (→)', back.trim().startsWith('→'), back);
    }
    await scrollTo(page, 'continue');
    await byId(page, 'continue').click();
    await byId(page, 'next').waitFor();
    await byId(page, 'next').click();
    await page.waitForURL(/\/point\/1/);
    await page.waitForTimeout(500);
    await shot(page, `${tag}_05_point1_top.png`);
    await scrollTo(page, 'quiz-question');
    await shot(page, `${tag}_06_point1_task.png`);
    await byId(page, 'opt-0').click();
    await byId(page, 'opt-1').click();
    await scrollTo(page, 'next');
    await shot(page, `${tag}_07_point1_find.png`);
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
    }
    await byId(page, 'next').click();
    await page.waitForURL(/\/finish\/1/);
    await byId(page, 'finish-title').waitFor();
    await page.waitForTimeout(600);
    await shot(page, `${tag}_08_finish.png`);
    const found = await byId(page, 'finish-found').innerText();
    check(`${code}: финал — «Вы нашли N находок» через ICU`, found.length > 0 && !found.includes('{'), found);
    await page.goto(`${BASE}/finds`);
    await byId(page, 'art-A1_KRESALO').waitFor();
    await page.waitForTimeout(500);
    await shot(page, `${tag}_09_finds.png`);
    const fc = await byId(page, 'finds-count').innerText();
    check(`${code}: вкладка «Находки» — счётчик через ICU`, fc.length > 0 && !fc.includes('{'), fc);
    await page.goto(`${BASE}/about`);
    await page.waitForTimeout(800);
    await shot(page, `${tag}_10_about.png`);
    // Сетнер: ссылка несёт код, письменный вариант и произношение
    await page.goto(`${BASE}/setner`);
    await byId(page, 'to-bot').waitFor();
    await page.waitForTimeout(400);
    await shot(page, `${tag}_11_setner.png`);
    let botUrl = '';
    await page.route('https://t.me/**', (route) => {
      botUrl = route.request().url();
      route.fulfill({ status: 200, contentType: 'text/plain', body: 'telegram' });
    });
    await byId(page, 'to-bot').click();
    await page.waitForTimeout(800);
    const v = FIRST_VOICE[code] ?? code;
    check(`${code}: ссылка на Сетнера с lang/voice`, botUrl.includes(`lang=${encodeURIComponent(code)}`) && botUrl.includes(`voice=${encodeURIComponent(v)}`), botUrl);
    await ctx.close();
  }

  // 8. Хинди: шрифт деванагари + тест-строка
  {
    const { ctx, page } = await newPage({ locale: 'hi-IN' });
    await page.goto(`${BASE}/language`);
    await byId(page, 'lang-title').waitFor();
    await pickLanguage(page, 'hi-IN');
    await page.waitForURL(/\/prologue/);
    const ok = await waitFont(page, 'NotoSansDevanagari');
    check('hi-IN: шрифт письма NotoSansDevanagari загружен (document.fonts)', ok);
    await page.waitForTimeout(500);
    await shot(page, '33_hi-IN_03_prologue.png');
    await tofuOverlay(page, [{ code: 'hi-IN', family: 'NotoSansDevanagari', text: META.variants['hi-IN'].testString }, { code: 'mr-IN', family: 'NotoSansDevanagari', text: META.variants['mr-IN'].testString }], '33_hi-IN_00_tofu.png');
    await ctx.close();
  }

  // 9. Смена языка на лету и после перезагрузки (выбор запоминается)
  {
    const { ctx, page } = await newPage();
    await page.goto(`${BASE}/about`);
    await page.waitForTimeout(800);
    await byId(page, 'about-lang').click();
    await page.waitForURL(/\/language/);
    await pickLanguage(page, 'en-GB');
    await byId(page, 'voice-en-IE').click();
    await page.waitForURL(/\/about/);
    await page.waitForTimeout(600);
    const en = LOCALE('en-GB');
    let txt = await page.evaluate(() => document.body.innerText);
    check('смена языка на лету: «О проекте» сразу по-английски', txt.includes(en['ui.about_title']), en['ui.about_title']);
    await shot(page, '50_switch_en_about.png');
    await page.reload();
    await page.waitForTimeout(1200);
    txt = await page.evaluate(() => document.body.innerText);
    const stored = await page.evaluate(() => [localStorage.getItem('nacheboksare.locale'), localStorage.getItem('nacheboksare.voice')]);
    check('после перезагрузки язык сохранён (en-GB, произношение en-IE)', txt.includes(en['ui.about_title']) && stored[0] === 'en-GB' && stored[1] === 'en-IE', stored.join(' / '));
    await shot(page, '51_after_reload_en.png');
    // на лету в арабский: в браузере зеркалится сразу, без перезапуска
    await byId(page, 'about-lang').click();
    await page.waitForURL(/\/language/);
    await pickLanguage(page, 'ar');
    await byId(page, 'voice-ar-EG').click();
    await page.waitForURL(/\/about/);
    await page.waitForTimeout(800);
    let dir = await page.evaluate(() => document.documentElement.dir);
    check('смена на арабский на лету: страница справа налево без перезапуска', dir === 'rtl', dir);
    await shot(page, '52_switch_ar_about.png');
    await page.reload();
    await page.waitForTimeout(1200);
    dir = await page.evaluate(() => document.documentElement.dir);
    const ar = LOCALE('ar');
    txt = await page.evaluate(() => document.body.innerText);
    check('после перезагрузки: арабский и справа налево', dir === 'rtl' && txt.includes(ar['ui.about_title']), dir);
    await shot(page, '53_after_reload_ar.png');
    // назад на русский — направление возвращается
    await byId(page, 'about-lang').click();
    await page.waitForURL(/\/language/);
    await pickLanguage(page, 'ru-RU');
    await page.waitForURL(/\/about/);
    await page.waitForTimeout(600);
    dir = await page.evaluate(() => document.documentElement.dir);
    check('возврат на русский: слева направо', dir === 'ltr', dir);
    await ctx.close();
  }

  // 10. Лист «тофу»: тест-строки всех 22 вариантов шрифтами приложения
  {
    const { ctx, page } = await newPage();
    await page.goto(`${BASE}/prologue`);
    await byId(page, 'title').waitFor();
    // шрифты письменностей подгружаем так же, как приложение (файлы из сборки)
    const findAsset = (re) => {
      const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
      const f = walk(join(DIST, 'assets')).find((x) => re.test(x));
      return f ? '/' + f.slice(DIST.length + 1).split('\\').join('/') : null;
    };
    const fams = {
      NotoNaskhArabic: findAsset(/NotoNaskhArabic_400Regular\.[0-9a-f]+\.ttf$/),
      NotoSansSC: findAsset(/NotoSansSC_400Regular\.[0-9a-f]+\.ttf$/),
      NotoSansTC: findAsset(/NotoSansTC_400Regular\.[0-9a-f]+\.ttf$/),
      NotoSansHK: findAsset(/NotoSansHK_400Regular\.[0-9a-f]+\.ttf$/),
      NotoSansDevanagari: findAsset(/NotoSansDevanagari_400Regular\.[0-9a-f]+\.ttf$/),
    };
    const loaded = await page.evaluate(async (map) => {
      const out = {};
      for (const [name, url] of Object.entries(map)) {
        try {
          const ff = new FontFace(name, `url(${url})`);
          await ff.load();
          document.fonts.add(ff);
          out[name] = ff.status;
        } catch (e) {
          out[name] = 'error';
        }
      }
      return out;
    }, fams);
    check('лист тофу: шрифты письменностей загрузились из сборки', Object.values(loaded).every((x) => x === 'loaded'), JSON.stringify(loaded));
    const items = Object.entries(META.variants).map(([code, m]) => ({ code, family: FONT_OF[code] ?? 'PTSans_400Regular', text: m.testString }));
    await tofuOverlay(page, items.slice(0, 11), '40_tofu_all_1.png');
    await tofuOverlay(page, items.slice(11), '40_tofu_all_2.png');
    await ctx.close();
  }

  // 11. Тёмная тема: маршрут
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
const failed = checks.filter((c) => !c.pass);
console.log(`Проверок: ${checks.length}, пройдено: ${checks.length - failed.length}`);
fs.writeFileSync(join(root, 'qa/qa_report.json'), JSON.stringify({ date: new Date().toISOString(), shots: shots.length, checks }, null, 1) + '\n');
if (errors.length) {
  console.log('Ошибки в консоли браузера:');
  for (const e of [...new Set(errors)]) console.log(' -', e.slice(0, 300));
}
process.exit(errors.some((e) => e.startsWith('scenario')) || failed.length ? 1 : 0);
