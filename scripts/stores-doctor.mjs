// Проверка ключей для магазинов: что уже готово и чего не хватает. Ничего никуда не отправляет.
// Читает .env.stores (если есть) и переменные окружения. Значения ключей НЕ печатает.
// Запуск: npm run stores:doctor
import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appInfo, loadStoresEnv, ROOT } from './lib/stores-common.mjs';

const hadFile = loadStoresEnv();
const env = (k) => (process.env[k] ?? '').trim();
const app = appInfo();
const eas = JSON.parse(readFileSync(join(ROOT, 'eas.json'), 'utf8'));
const appJson = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo;

function rustore() {
  const miss = [];
  if (!env('RUSTORE_KEY_ID')) miss.push('RUSTORE_KEY_ID');
  if (!env('RUSTORE_PRIVATE_KEY')) miss.push('RUSTORE_PRIVATE_KEY');
  else {
    try {
      const t = env('RUSTORE_PRIVATE_KEY');
      if (t.includes('BEGIN')) crypto.createPrivateKey(t.replace(/\\n/g, '\n'));
      else crypto.createPrivateKey({ key: Buffer.from(t.replace(/\s+/g, ''), 'base64'), format: 'der', type: 'pkcs8' });
    } catch {
      miss.push('RUSTORE_PRIVATE_KEY не читается (нужен base64 одной строкой из консоли RuStore)');
    }
  }
  if (!app.packageName) miss.push('android.package в app.json');
  return miss;
}
function appgallery() {
  return ['AGC_CLIENT_ID', 'AGC_CLIENT_SECRET', 'AGC_APP_ID'].filter((k) => !env(k));
}
function googlePlay() {
  const miss = [];
  const p = join(ROOT, eas.submit?.production?.android?.serviceAccountKeyPath || './secrets/google-play-service-account.json');
  if (!existsSync(p)) miss.push('файл secrets/google-play-service-account.json');
  else {
    try {
      const j = JSON.parse(readFileSync(p, 'utf8'));
      if (!j.client_email || !j.private_key) miss.push('в JSON сервисного аккаунта нет client_email/private_key');
    } catch {
      miss.push('secrets/google-play-service-account.json — не JSON');
    }
  }
  if (!appJson.extra?.eas?.projectId) miss.push('проект EAS (npx eas init)');
  return miss;
}
function appStore() {
  const miss = [];
  const ios = eas.submit?.production?.ios ?? {};
  if (!env('ASC_APP_ID') && !ios.ascAppId) miss.push('ASC_APP_ID');
  if (!env('APPLE_TEAM_ID') && !ios.appleTeamId) miss.push('APPLE_TEAM_ID');
  if (!ios.ascAppId || !ios.appleTeamId) miss.push('eas.json без данных Apple (после заполнения: npm run stores:ios-config)');
  if (!appJson.extra?.eas?.projectId) miss.push('проект EAS (npx eas init)');
  miss.push('аккаунт Apple Developer + npx eas credentials -p ios (проверяется только вручную)');
  return miss;
}

const rows = [
  ['RuStore', rustore()],
  ['AppGallery', appgallery()],
  ['Google Play', googlePlay()],
  ['App Store', appStore()],
];

console.log(`Файл ключей .env.stores: ${hadFile ? 'найден' : 'НЕТ (скопируйте .env.stores.example → .env.stores и заполните)'}`);
console.log(`Пакет Android: ${app.packageName}; iOS: ${app.bundleId}; версия ${app.version}\n`);
const w = 12;
console.log('Магазин'.padEnd(w) + ' | Состояние');
console.log('-'.repeat(w) + '-+-' + '-'.repeat(60));
for (const [name, miss] of rows) {
  const onlyManual = miss.length === 1 && miss[0].startsWith('аккаунт Apple');
  const state = miss.length === 0 ? 'готово' : onlyManual ? 'готово (проверьте аккаунт Apple вручную)' : `не хватает: ${miss.join(', ')}`;
  console.log(name.padEnd(w) + ' | ' + state);
}
console.log('\nГде взять каждый ключ — в файле .env.stores.example (комментарии на русском).');
if (process.argv.includes('--strict') && rows.some(([, m]) => m.length)) process.exit(1);
