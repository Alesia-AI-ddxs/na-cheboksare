// Публикация «На Чебоксаре» в Huawei AppGallery через AppGallery Connect Publishing API (без сторонних пакетов, Node 22).
//
// Запуск:
//   node scripts/appgallery-publish.mjs --file app.apk --submit no           → загрузить файл в черновик версии
//   node scripts/appgallery-publish.mjs --file app.aab --submit yes          → загрузить и ОТПРАВИТЬ на проверку
//   node scripts/appgallery-publish.mjs --file app.apk --submit no --dry-run → только показать план
//
// Ключи (файл .env.stores или переменные окружения — см. .env.stores.example):
//   AGC_CLIENT_ID, AGC_CLIENT_SECRET — AppGallery Connect → Пользователи и разрешения → API-ключ → Connect API (роль «Администратор»)
//   AGC_APP_ID                       — ID приложения: AppGallery Connect → Мои приложения → «На Чебоксаре» → Информация о приложении
//
// Шаги: 1) токен → 2) адрес для загрузки → 3) загрузка файла → 4) привязка файла к черновику версии →
//       5) только при --submit yes: отправка на проверку (если Huawei ещё обрабатывает файл — ждём 60 с, до 10 попыток).
import { existsSync, openAsBlob, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fail, loadStoresEnv, mask, parseArgs, sleep } from './lib/stores-common.mjs';

loadStoresEnv();
const args = parseArgs();
const API = (process.env.AGC_API_BASE || 'https://connect-api.cloud.huawei.com').replace(/\/+$/, '');
const CLIENT_ID = process.env.AGC_CLIENT_ID || '';
const CLIENT_SECRET = process.env.AGC_CLIENT_SECRET || '';
const APP_ID = process.env.AGC_APP_ID || '';
const RETRY_MAX = Number(process.env.AGC_RETRY_MAX || 10);
const RETRY_PAUSE = Number(process.env.AGC_RETRY_PAUSE_MS || 60000);
// коды Huawei «файл ещё обрабатывается / компилируется» — тогда отправку повторяем
const BUSY_CODES = new Set([204144660, 204144661]);

if (!args.file) fail('укажите файл: --file путь/к/app.apk или app.aab');
const file = resolve(args.file);
const suffix = file.toLowerCase().endsWith('.aab') ? 'aab' : file.toLowerCase().endsWith('.apk') ? 'apk' : null;
if (!suffix) fail('файл должен быть .apk или .aab');

const q = (path, extra = '') => `${API}${path}?appId=${encodeURIComponent(APP_ID || '<AGC_APP_ID>')}${extra}`;

// ---------- режим «только план» ----------
if (args.dryRun) {
  const size = existsSync(file) ? `${(statSync(file).size / 1024 / 1024).toFixed(1)} МБ` : 'ФАЙЛА НЕТ (для пробного прогона не страшно)';
  console.log('AppGallery — ПРОБНЫЙ ПРОГОН (--dry-run): ничего не отправляется.');
  console.log(`Файл: ${basename(file)} (${suffix.toUpperCase()}, ${size}); отправить на проверку: ${args.submit}`);
  console.log('Ключи: AGC_CLIENT_ID =', mask(CLIENT_ID), '; AGC_CLIENT_SECRET =', mask(CLIENT_SECRET), '; AGC_APP_ID =', APP_ID || '<не задан>');
  console.log('План запросов:');
  console.log(`  1) POST ${API}/api/oauth2/v1/token  { grant_type: client_credentials, client_id: ${mask(CLIENT_ID)}, client_secret: <скрыто> }`);
  console.log(`  2) GET  ${q('/api/publish/v2/upload-url', `&suffix=${suffix}`)}`);
  console.log(`  3) POST <uploadUrl из шага 2>  multipart authCode=<скрыто>, fileCount=1, file=${basename(file)}`);
  console.log(`  4) PUT  ${q('/api/publish/v2/app-file-info')}  { fileType: 5, files: [{ fileName: "${basename(file)}", fileDestUrl, size }] }`);
  if (args.submit === 'yes') console.log(`  5) POST ${q('/api/publish/v2/app-submit')}  — до ${RETRY_MAX} попыток с паузой ${RETRY_PAUSE / 1000} с, пока Huawei обрабатывает файл`);
  else console.log('  5) (пропуск) на проверку не отправляем — версия останется черновиком в AppGallery Connect');
  process.exit(0);
}

// ---------- настоящая публикация ----------
if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID) fail('нет AGC_CLIENT_ID / AGC_CLIENT_SECRET / AGC_APP_ID (см. .env.stores.example). Проверка: npm run stores:doctor');
if (!existsSync(file)) fail(`нет файла ${file}`);

async function call(step, method, url, { token, json, form } = {}) {
  const headers = {};
  if (token) {
    headers['client_id'] = CLIENT_ID;
    headers['Authorization'] = `Bearer ${token}`;
  }
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
  return { ok: res.ok, status: res.status, data };
}
const retOk = (d) => d?.ret === undefined || Number(d.ret.code) === 0;
const retMsg = (d) => (d?.ret ? `код ${d.ret.code}: ${d.ret.msg}` : d?.raw || JSON.stringify(d).slice(0, 200));

console.log(`AppGallery: приложение ${APP_ID}, файл ${basename(file)} (${suffix.toUpperCase()})`);

// 1. токен
const tok = await call('Токен', 'POST', `${API}/api/oauth2/v1/token`, {
  json: { grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET },
});
const token = tok.data?.access_token;
if (!tok.ok || !token) fail(`токен не получен (HTTP ${tok.status}): ${retMsg(tok.data)}. Проверьте API-ключ в AppGallery Connect.`);
console.log('1/5 токен получен');

// 2. адрес для загрузки
const u = await call('Адрес загрузки', 'GET', q('/api/publish/v2/upload-url', `&suffix=${suffix}`), { token });
if (!u.ok || !retOk(u.data) || !u.data.uploadUrl) fail(`адрес загрузки не получен (HTTP ${u.status}): ${retMsg(u.data)}`);
console.log('2/5 адрес для загрузки получен');

// 3. загрузка файла
const form = new FormData();
form.append('authCode', u.data.authCode);
form.append('fileCount', '1');
if (suffix === 'aab') form.append('parseType', '1');
form.append('file', await openAsBlob(file), basename(file));
const up = await call('Загрузка', 'POST', u.data.uploadUrl, { form });
const info = up.data?.result?.UploadFileRsp?.fileInfoList?.[0];
if (!up.ok || !info?.fileDestUlr) fail(`файл не загружен (HTTP ${up.status}): ${JSON.stringify(up.data).slice(0, 300)}`);
console.log(`3/5 файл загружен (${(statSync(file).size / 1024 / 1024).toFixed(1)} МБ)`);

// 4. привязка файла к версии
const fi = await call('Файл версии', 'PUT', q('/api/publish/v2/app-file-info'), {
  token,
  json: { fileType: 5, files: [{ fileName: basename(file), fileDestUrl: info.fileDestUlr, size: String(info.size ?? statSync(file).size) }] },
});
if (!fi.ok || !retOk(fi.data)) fail(`файл не привязан к версии (HTTP ${fi.status}): ${retMsg(fi.data)}`);
console.log('4/5 файл привязан к черновику версии');

// 5. отправка на проверку
if (args.submit !== 'yes') {
  console.log('5/5 пропуск: версия осталась ЧЕРНОВИКОМ. Проверьте её в AppGallery Connect и отправьте на проверку.');
  console.log('ГОТОВО: AppGallery');
  process.exit(0);
}
for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
  const s = await call('Отправка', 'POST', q('/api/publish/v2/app-submit'), { token });
  if (s.ok && retOk(s.data)) {
    console.log(`5/5 отправлено на проверку Huawei (попытка ${attempt})`);
    console.log('ГОТОВО: AppGallery');
    process.exit(0);
  }
  const code = Number(s.data?.ret?.code);
  const busy = BUSY_CODES.has(code) || /process|compil|обраб/i.test(String(s.data?.ret?.msg || ''));
  if (!busy) fail(`не отправлено на проверку (HTTP ${s.status}): ${retMsg(s.data)}`);
  if (attempt === RETRY_MAX) fail(`Huawei всё ещё обрабатывает файл после ${RETRY_MAX} попыток. Отправьте на проверку вручную в AppGallery Connect.`);
  console.log(`   Huawei ещё обрабатывает файл (${retMsg(s.data)}) — ждём ${RETRY_PAUSE / 1000} с, попытка ${attempt + 1} из ${RETRY_MAX}`);
  await sleep(RETRY_PAUSE);
}
