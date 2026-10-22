// Тесты скриптов публикации (RuStore и AppGallery) БЕЗ настоящих магазинов.
// Поднимаем у себя «поддельные» сервера RuStore и Huawei, запускаем скрипты и проверяем:
//  - подпись RuStore правильная (проверяем её открытым ключом из той же пары);
//  - запросы идут в нужном порядке и с нужными полями;
//  - «отправка на модерацию» происходит только при --submit yes;
//  - AppGallery повторяет отправку, пока Huawei «обрабатывает файл»;
//  - режим --dry-run не отправляет НИЧЕГО и не печатает секреты.
// Запуск: npm run test:publish
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = 'ru.inospectrum.nacheboksare';

// ключи для теста: пара RSA (как в RuStore) и «чужой» открытый ключ для проверки отказа
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const OTHER_PUBLIC = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).publicKey;
const PRIVATE_B64 = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
const KEY_ID = 'test-key-id-1234567890';
const JWE = 'jwe-token-SECRET-abcdef123456';
const AGC_SECRET = 'agc-client-secret-SUPERSECRET-987654';
const AGC_ID = 'agc-client-id-5555555555';
const AGC_TOKEN = 'agc-access-token-SECRET-xyz';
const AUTH_CODE = 'upload-auth-code-SECRET-42';

let server;
let ORIGIN;
let log = [];
let verifyKey = publicKey;
let agcBusyLeft = 1;

const dir = mkdtempSync(join(tmpdir(), 'publish-test-'));
const APK = join(dir, 'app.apk');
const AAB = join(dir, 'app.aab');
writeFileSync(APK, Buffer.from('PK-fake-apk-content'));
writeFileSync(AAB, Buffer.from('PK-fake-aab-content'));

function send(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

before(async () => {
  server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      const raw = buf.toString('latin1'); // для multipart (файлы)
      const url = new URL(req.url, 'http://x');
      const entry = { method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), headers: req.headers, raw };
      try {
        entry.json = JSON.parse(buf.toString('utf8'));
      } catch {
        /* не JSON */
      }
      log.push(entry);
      const p = url.pathname;

      // ---- RuStore ----
      if (p === '/public/auth/' && req.method === 'POST') {
        const { keyId, timestamp, signature } = entry.json;
        const okSig = crypto.verify('sha512', Buffer.from(keyId + timestamp), verifyKey, Buffer.from(signature, 'base64'));
        entry.signatureValid = okSig;
        if (!okSig) return send(res, 401, { code: 'ERROR', message: 'bad signature' });
        return send(res, 200, { code: 'OK', body: { jwe: JWE, ttl: 900 } });
      }
      if (p === `/public/v1/application/${PKG}/version` && req.method === 'POST') return send(res, 200, { code: 'OK', body: 777 });
      if (p.startsWith(`/public/v1/application/${PKG}/version/777/`)) return send(res, 200, { code: 'OK', body: null });

      // ---- AppGallery ----
      if (p === '/api/oauth2/v1/token') return send(res, 200, { access_token: AGC_TOKEN, expires_in: 172800 });
      if (p === '/api/publish/v2/upload-url') return send(res, 200, { ret: { code: 0, msg: 'success' }, uploadUrl: `${ORIGIN}/agc-upload`, authCode: AUTH_CODE });
      if (p === '/agc-upload') {
        return send(res, 200, { result: { resultCode: '0', UploadFileRsp: { ifSuccess: 1, fileInfoList: [{ fileDestUlr: 'https://obs/fake/app.apk', size: 19 }] } } });
      }
      if (p === '/api/publish/v2/app-file-info') return send(res, 200, { ret: { code: 0, msg: 'success' }, pkgVersion: ['1'] });
      if (p === '/api/publish/v2/app-submit') {
        if (agcBusyLeft > 0) {
          agcBusyLeft--;
          return send(res, 200, { ret: { code: 204144660, msg: 'The file is being processed. Please try again later.' } });
        }
        return send(res, 200, { ret: { code: 0, msg: 'success' } });
      }
      send(res, 404, { code: 'ERROR', message: 'unknown ' + p });
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  ORIGIN = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

function run(script, args, extraEnv = {}) {
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    STORES_ENV_FILE: join(dir, 'нет-такого-файла'), // настоящий .env.stores в тестах не читаем
    RUSTORE_API_BASE: ORIGIN,
    AGC_API_BASE: ORIGIN,
    AGC_RETRY_PAUSE_MS: '20',
    ...extraEnv,
  };
  return new Promise((resolve) => {
    execFile(process.execPath, [join(root, 'scripts', script), ...args], { cwd: root, env }, (err, stdout, stderr) => {
      resolve({ code: err ? err.code ?? 1 : 0, stdout, stderr, all: stdout + stderr });
    });
  });
}

const RU_ENV = { RUSTORE_KEY_ID: KEY_ID, RUSTORE_PRIVATE_KEY: PRIVATE_B64, RUSTORE_WHATS_NEW: 'Тестовый текст' };
const AGC_ENV = { AGC_CLIENT_ID: AGC_ID, AGC_CLIENT_SECRET: AGC_SECRET, AGC_APP_ID: '112233' };

test('RuStore: APK + --submit yes — подпись верна, порядок auth → version → apk → commit', async () => {
  log = [];
  verifyKey = publicKey;
  const r = await run('rustore-publish.mjs', ['--file', APK, '--submit', 'yes'], RU_ENV);
  assert.equal(r.code, 0, r.all);
  assert.deepEqual(
    log.map((e) => `${e.method} ${e.path}`),
    [
      'POST /public/auth/',
      `POST /public/v1/application/${PKG}/version`,
      `POST /public/v1/application/${PKG}/version/777/apk`,
      `POST /public/v1/application/${PKG}/version/777/commit`,
    ],
  );
  const [auth, ver, up, commit] = log;
  assert.equal(auth.signatureValid, true, 'подпись RSA-SHA512 должна проверяться открытым ключом');
  assert.equal(auth.json.keyId, KEY_ID);
  assert.match(auth.json.timestamp, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}[+-]\d\d:\d\d$/);
  assert.equal(ver.headers['public-token'], JWE);
  assert.equal(ver.json.whatsNew, 'Тестовый текст');
  assert.equal(ver.json.publishType, 'MANUAL');
  assert.equal(up.query.servicesType, 'Unknown');
  assert.equal(up.query.isMainApk, 'true');
  assert.match(up.headers['content-type'], /^multipart\/form-data/);
  assert.match(up.raw, /name="file"; filename="app\.apk"/);
  assert.equal(commit.headers['public-token'], JWE);
  assert.doesNotMatch(r.all, new RegExp(JWE));
});

test('RuStore: AAB + --submit no — загрузка в /aab, без commit (остаётся черновик)', async () => {
  log = [];
  verifyKey = publicKey;
  const r = await run('rustore-publish.mjs', ['--file', AAB, '--submit', 'no'], RU_ENV);
  assert.equal(r.code, 0, r.all);
  assert.deepEqual(
    log.map((e) => e.path),
    ['/public/auth/', `/public/v1/application/${PKG}/version`, `/public/v1/application/${PKG}/version/777/aab`],
  );
  assert.match(r.stdout, /ЧЕРНОВИКОМ/);
});

test('RuStore: подпись чужим ключом не проходит — скрипт останавливается с ошибкой', async () => {
  log = [];
  verifyKey = OTHER_PUBLIC;
  const r = await run('rustore-publish.mjs', ['--file', APK, '--submit', 'yes'], RU_ENV);
  verifyKey = publicKey;
  assert.notEqual(r.code, 0);
  assert.equal(log.length, 1, 'после неудачной авторизации больше запросов быть не должно');
  assert.match(r.stderr, /авторизация не прошла/);
});

test('AppGallery: APK + --submit yes — токен → адрес → загрузка → файл версии → отправка (с повтором)', async () => {
  log = [];
  agcBusyLeft = 1;
  const r = await run('appgallery-publish.mjs', ['--file', APK, '--submit', 'yes'], AGC_ENV);
  assert.equal(r.code, 0, r.all);
  assert.deepEqual(
    log.map((e) => `${e.method} ${e.path}`),
    [
      'POST /api/oauth2/v1/token',
      'GET /api/publish/v2/upload-url',
      'POST /agc-upload',
      'PUT /api/publish/v2/app-file-info',
      'POST /api/publish/v2/app-submit',
      'POST /api/publish/v2/app-submit',
    ],
  );
  const [tok, url, up, fi, sub] = log;
  assert.deepEqual(tok.json, { grant_type: 'client_credentials', client_id: AGC_ID, client_secret: AGC_SECRET });
  assert.equal(url.query.appId, '112233');
  assert.equal(url.query.suffix, 'apk');
  assert.equal(url.headers['client_id'], AGC_ID);
  assert.equal(url.headers['authorization'], `Bearer ${AGC_TOKEN}`);
  assert.match(up.raw, new RegExp(`name="authCode"\\r\\n\\r\\n${AUTH_CODE}`));
  assert.match(up.raw, /name="fileCount"\r\n\r\n1/);
  assert.match(up.raw, /name="file"; filename="app\.apk"/);
  assert.equal(fi.json.fileType, 5);
  assert.equal(fi.json.files[0].fileName, 'app.apk');
  assert.equal(fi.json.files[0].fileDestUrl, 'https://obs/fake/app.apk');
  assert.equal(sub.query.appId, '112233');
  assert.match(r.stdout, /обрабатывает файл/);
  assert.doesNotMatch(r.all, new RegExp(AGC_TOKEN));
  assert.doesNotMatch(r.all, new RegExp(AGC_SECRET));
});

test('AppGallery: AAB + --submit no — без app-submit', async () => {
  log = [];
  const r = await run('appgallery-publish.mjs', ['--file', AAB, '--submit', 'no'], AGC_ENV);
  assert.equal(r.code, 0, r.all);
  assert.deepEqual(log.map((e) => e.path), ['/api/oauth2/v1/token', '/api/publish/v2/upload-url', '/agc-upload', '/api/publish/v2/app-file-info']);
  assert.equal(log[1].query.suffix, 'aab');
  assert.match(log[2].raw, /name="parseType"\r\n\r\n1/);
});

test('--dry-run: ни одного запроса и ни одного секрета в выводе (оба магазина)', async () => {
  log = [];
  const a = await run('rustore-publish.mjs', ['--file', APK, '--submit', 'yes', '--dry-run'], RU_ENV);
  const b = await run('appgallery-publish.mjs', ['--file', AAB, '--submit', 'yes', '--dry-run'], AGC_ENV);
  assert.equal(a.code, 0, a.all);
  assert.equal(b.code, 0, b.all);
  assert.equal(log.length, 0, 'в пробном прогоне запросов быть не должно');
  const out = a.all + b.all;
  assert.match(a.stdout, /ПРОБНЫЙ ПРОГОН/);
  assert.match(a.stdout, /commit/);
  assert.match(b.stdout, /app-submit/);
  for (const secret of [KEY_ID, AGC_SECRET, AGC_ID]) assert.doesNotMatch(out, new RegExp(secret));
  // ни одного куска приватного ключа длиннее 8 символов
  for (let i = 0; i + 16 <= PRIVATE_B64.length; i += 16) assert.ok(!out.includes(PRIVATE_B64.slice(i, i + 16)), 'кусок приватного ключа в выводе');
});

test('stores-doctor: с ключами RuStore и AppGallery — «готово», без ключей — «не хватает»', async () => {
  const full = await run('stores-doctor.mjs', [], { ...RU_ENV, ...AGC_ENV });
  assert.equal(full.code, 0, full.all);
  assert.match(full.stdout, /RuStore\s+\| готово/);
  assert.match(full.stdout, /AppGallery\s+\| готово/);
  assert.doesNotMatch(full.all, new RegExp(AGC_SECRET));
  const empty = await run('stores-doctor.mjs', []);
  assert.match(empty.stdout, /RuStore\s+\| не хватает: RUSTORE_KEY_ID, RUSTORE_PRIVATE_KEY/);
  assert.match(empty.stdout, /AppGallery\s+\| не хватает: AGC_CLIENT_ID, AGC_CLIENT_SECRET, AGC_APP_ID/);
});
