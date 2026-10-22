// Публикация «На Чебоксаре» в RuStore через официальный Public API (без сторонних пакетов, Node 22).
//
// Запуск:
//   node scripts/rustore-publish.mjs --file app.apk --submit no          → загрузить ЧЕРНОВИК (на модерацию не отправлять)
//   node scripts/rustore-publish.mjs --file app.aab --submit yes         → загрузить и ОТПРАВИТЬ на модерацию
//   node scripts/rustore-publish.mjs --file app.apk --submit no --dry-run → только показать план, ничего не отправлять
//
// Ключи (файл .env.stores или переменные окружения — см. .env.stores.example):
//   RUSTORE_KEY_ID        — идентификатор ключа (Консоль RuStore → Компания → API RuStore)
//   RUSTORE_PRIVATE_KEY   — приватный ключ одной строкой base64 (как выдаёт консоль RuStore)
//   RUSTORE_WHATS_NEW     — текст «Что нового» (если пусто — берётся первый раздел CHANGELOG.md)
//   RUSTORE_PUBLISH_TYPE  — MANUAL (по умолчанию: после модерации вы сами нажимаете «Опубликовать») | INSTANTLY | DELAYED
//   RUSTORE_PRIORITY_UPDATE — приоритет обновления 0–5 (необязательно)
// Имя пакета берётся из app.json (android.package).
//
// Шаги: 1) получить токен (подпись RSA-SHA512 от keyId+timestamp) → 2) создать черновик версии →
//       3) загрузить APK или AAB → 4) только при --submit yes: отправить на модерацию (commit).
import crypto from 'node:crypto';
import { existsSync, openAsBlob, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { appInfo, fail, loadStoresEnv, mask, parseArgs, whatsNew } from './lib/stores-common.mjs';

loadStoresEnv();
const args = parseArgs();
const API = (process.env.RUSTORE_API_BASE || 'https://public-api.rustore.ru').replace(/\/+$/, '');
const KEY_ID = process.env.RUSTORE_KEY_ID || '';
const PRIVATE_KEY = process.env.RUSTORE_PRIVATE_KEY || '';
const PUBLISH_TYPE = (process.env.RUSTORE_PUBLISH_TYPE || 'MANUAL').toUpperCase();
const PRIORITY = process.env.RUSTORE_PRIORITY_UPDATE;
const { packageName } = appInfo();

if (!args.file) fail('укажите файл: --file путь/к/app.apk или app.aab');
const file = resolve(args.file);
const kind = file.toLowerCase().endsWith('.aab') ? 'aab' : file.toLowerCase().endsWith('.apk') ? 'apk' : null;
if (!kind) fail('файл должен быть .apk или .aab');
if (!packageName) fail('в app.json нет android.package');

/** Время в формате ISO 8601 с часовым поясом, например 2026-10-22T10:15:00.000+03:00 */
function isoWithOffset(d = new Date()) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const pad = (n, l = 2) => String(Math.abs(n)).padStart(l, '0');
  const local = new Date(d.getTime() + off * 60000);
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}.${pad(local.getUTCMilliseconds(), 3)}` +
    `${sign}${pad(Math.trunc(off / 60))}:${pad(off % 60)}`
  );
}

function loadPrivateKey(text) {
  const t = text.trim();
  if (t.includes('BEGIN')) return crypto.createPrivateKey(t.replace(/\\n/g, '\n'));
  return crypto.createPrivateKey({ key: Buffer.from(t.replace(/\s+/g, ''), 'base64'), format: 'der', type: 'pkcs8' });
}

/** Подпись для авторизации RuStore: base64( RSA-SHA512( keyId + timestamp ) ) */
function signRustore(keyId, timestamp, privateKeyText) {
  return crypto.sign('sha512', Buffer.from(keyId + timestamp, 'utf8'), loadPrivateKey(privateKeyText)).toString('base64');
}

const base = `${API}/public/v1/application/${encodeURIComponent(packageName)}`;
const notes = whatsNew('RUSTORE_WHATS_NEW');
const uploadUrl = (id) =>
  kind === 'apk' ? `${base}/version/${id}/apk?isMainApk=true&servicesType=Unknown` : `${base}/version/${id}/aab`;
const commitUrl = (id) => `${base}/version/${id}/commit${PRIORITY ? `?priorityUpdate=${encodeURIComponent(PRIORITY)}` : ''}`;

// ---------- режим «только план» ----------
if (args.dryRun) {
  const size = existsSync(file) ? `${(statSync(file).size / 1024 / 1024).toFixed(1)} МБ` : 'ФАЙЛА НЕТ (для пробного прогона не страшно)';
  console.log('RuStore — ПРОБНЫЙ ПРОГОН (--dry-run): ничего не отправляется.');
  console.log(`Пакет: ${packageName}; файл: ${basename(file)} (${kind.toUpperCase()}, ${size}); отправить на модерацию: ${args.submit}`);
  console.log('Ключи: RUSTORE_KEY_ID =', mask(KEY_ID), '; RUSTORE_PRIVATE_KEY =', mask(PRIVATE_KEY));
  console.log('План запросов:');
  console.log(`  1) POST ${API}/public/auth/  { keyId: ${mask(KEY_ID)}, timestamp: <сейчас>, signature: <RSA-SHA512, скрыто> }`);
  console.log(`  2) POST ${base}/version  { publishType: "${PUBLISH_TYPE}", whatsNew: ${notes ? `"${notes.slice(0, 60).replace(/\n/g, ' ')}${notes.length > 60 ? '…' : ''}"` : '<пусто>'} }  заголовок Public-Token: <скрыто>`);
  console.log(`  3) POST ${uploadUrl('<versionId>')}  multipart file=${basename(file)}`);
  if (args.submit === 'yes') console.log(`  4) POST ${commitUrl('<versionId>')}  — отправка на модерацию`);
  else console.log('  4) (пропуск) на модерацию не отправляем — останется черновик в консоли RuStore');
  process.exit(0);
}

// ---------- настоящая публикация ----------
if (!KEY_ID || !PRIVATE_KEY) fail('нет RUSTORE_KEY_ID или RUSTORE_PRIVATE_KEY (см. .env.stores.example). Проверка: npm run stores:doctor');
if (!existsSync(file)) fail(`нет файла ${file}`);

async function call(step, method, url, { token, json, form } = {}) {
  const headers = {};
  if (token) headers['Public-Token'] = token;
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) body = form;
  let res;
  try {
    res = await fetch(url, { method, headers, body });
  } catch (e) {
    fail(`${step}: нет связи с ${new URL(url).host} (${e.cause?.code || e.message})`);
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  if (!res.ok || (data.code && data.code !== 'OK')) {
    return { ok: false, status: res.status, data };
  }
  return { ok: true, status: res.status, data };
}

console.log(`RuStore: пакет ${packageName}, файл ${basename(file)} (${kind.toUpperCase()})`);

// 1. токен
const timestamp = isoWithOffset();
const signature = signRustore(KEY_ID, timestamp, PRIVATE_KEY);
const auth = await call('Авторизация', 'POST', `${API}/public/auth/`, { json: { keyId: KEY_ID, timestamp, signature } });
if (!auth.ok) fail(`авторизация не прошла (HTTP ${auth.status}): ${auth.data.message || auth.data.raw || ''}. Проверьте ключ в консоли RuStore.`);
const token = auth.data.body?.jwe;
if (!token) fail('RuStore не вернул токен');
console.log('1/4 токен получен');

// 2. черновик версии
let versionId;
const draft = await call('Черновик', 'POST', `${base}/version`, { token, json: { publishType: PUBLISH_TYPE, ...(notes ? { whatsNew: notes } : {}) } });
if (draft.ok) {
  versionId = draft.data.body;
} else {
  // если черновик уже есть, RuStore пишет его номер в сообщении — продолжаем с ним
  const m = String(draft.data.message || '').match(/(\d{3,})/);
  if (m && process.env.RUSTORE_REUSE_DRAFT !== 'no') {
    versionId = Number(m[1]);
    console.log(`   уже есть черновик №${versionId} — загружаем файл в него`);
  } else {
    fail(`черновик не создан (HTTP ${draft.status}): ${draft.data.message || draft.data.raw || ''}`);
  }
}
console.log(`2/4 черновик версии №${versionId}`);

// 3. загрузка файла
const form = new FormData();
form.append('file', await openAsBlob(file), basename(file));
const up = await call('Загрузка', 'POST', uploadUrl(versionId), { token, form });
if (!up.ok) fail(`файл не загружен (HTTP ${up.status}): ${up.data.message || up.data.raw || ''}`);
console.log(`3/4 файл ${kind.toUpperCase()} загружен (${(statSync(file).size / 1024 / 1024).toFixed(1)} МБ)`);

// 4. отправка на модерацию — только по явной команде
if (args.submit === 'yes') {
  const c = await call('Модерация', 'POST', commitUrl(versionId), { token });
  if (!c.ok) fail(`не отправлено на модерацию (HTTP ${c.status}): ${c.data.message || c.data.raw || ''}`);
  console.log(`4/4 версия №${versionId} отправлена на модерацию (тип публикации: ${PUBLISH_TYPE})`);
} else {
  console.log(`4/4 пропуск: версия №${versionId} осталась ЧЕРНОВИКОМ. Проверьте её в консоли RuStore и отправьте на модерацию.`);
}
console.log('ГОТОВО: RuStore');
