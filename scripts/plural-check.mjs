// Проверка форм множественного числа (ICU) — приёмка этапа 1 языкового модуля, ТЗ р.10:
// «Строки с числами проверены на значениях 1, 2, 5, 21».
// Что делает: подключает i18next + i18next-icu (как в приложении), берёт пакеты locales/*.json и печатает
// finds.count и finds.you_found для 1 / 2 / 5 / 21 на каждом языке, где эти строки есть (для арабского — ещё 0, 3, 11, 100:
// у него шесть форм). Для ru-RU и ar сверяет с ожидаемыми формами — расхождение = код выхода 1.
// Запуск: npm run qa:plural
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import i18next from 'i18next';
import ICU from 'i18next-icu';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOC = join(root, 'locales');
const resources = {};
for (const f of readdirSync(LOC).filter((x) => x.endsWith('.json') && x !== '_meta.json')) {
  resources[f.replace(/\.json$/, '')] = { translation: JSON.parse(readFileSync(join(LOC, f), 'utf8')) };
}
const pluralLocale = (lng) => {
  for (const c of [lng, lng.split('-')[0], 'ru']) if (Intl.PluralRules.supportedLocalesOf([c]).length) return c;
  return 'ru';
};
await i18next.use(new ICU({ parseLngForICU: pluralLocale })).init({
  resources,
  lng: 'ru-RU',
  fallbackLng: false,
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  initAsync: false,
});

const KEYS = ['finds.count', 'finds.you_found'];
const NUMS = [1, 2, 5, 21];
const out = {};
for (const code of Object.keys(resources).sort()) {
  if (!KEYS.some((k) => resources[code].translation[k])) continue;
  out[code] = {};
  const nums = code === 'ar' ? [0, 1, 2, 3, 5, 11, 21, 100] : NUMS;
  console.log(`\n${code}`);
  for (const k of KEYS) {
    if (!resources[code].translation[k]) continue;
    out[code][k] = {};
    for (const n of nums) {
      const s = i18next.t(k, { lng: code, count: n });
      out[code][k][n] = s;
      console.log(`  ${k.padEnd(16)} ${String(n).padStart(3)} → ${s}`);
    }
  }
}

// ожидаемые формы (по правилам CLDR): русский — one/few/many, арабский — zero/one/two/few/many/other
const nf = (n, l) => new Intl.NumberFormat(l).format(n);
const EXPECT = {
  'ru-RU': {
    'finds.count': { 1: '1 находка', 2: '2 находки', 5: '5 находок', 21: '21 находка' },
    'finds.you_found': { 1: 'Вы нашли 1 находку', 2: 'Вы нашли 2 находки', 5: 'Вы нашли 5 находок', 21: 'Вы нашли 21 находку' },
  },
  ar: {
    'finds.count': {
      0: 'لا اكتشافات', 1: 'اكتشاف واحد', 2: 'اكتشافان', 3: `${nf(3, 'ar')} اكتشافات`, 5: `${nf(5, 'ar')} اكتشافات`,
      11: `${nf(11, 'ar')} اكتشافًا`, 21: `${nf(21, 'ar')} اكتشافًا`, 100: `${nf(100, 'ar')} اكتشاف`,
    },
    'finds.you_found': {
      1: 'عثرت على اكتشاف واحد', 2: 'عثرت على اكتشافين', 5: `عثرت على ${nf(5, 'ar')} اكتشافات`, 21: `عثرت على ${nf(21, 'ar')} اكتشافًا`,
    },
  },
};
let bad = 0;
console.log('\nСверка с ожидаемыми формами:');
for (const [code, keys] of Object.entries(EXPECT)) {
  for (const [k, cases] of Object.entries(keys)) {
    for (const [n, want] of Object.entries(cases)) {
      const got = out[code]?.[k]?.[n];
      const ok = got === want;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ДА ' : 'НЕТ'} ${code} ${k} ${n}: ${got}${ok ? '' : `  (ждали: ${want})`}`);
    }
  }
}
console.log(bad ? `\nРасхождений: ${bad}` : '\nВсе формы верны.');
process.exit(bad ? 1 : 0);
