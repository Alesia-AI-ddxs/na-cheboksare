// Вписывает в android/app/build.gradle подпись релиза своим ключом (keystore) и номер сборки.
// Запускается из server/build_android.sh сразу после «npx expo prebuild». Повторный запуск ничего не ломает
// (файл уже исправлен — скрипт так и скажет).
//
// Что меняет:
//  1) в signingConfigs добавляет блок release: ключ, пароли и имя берутся из переменных окружения
//     KEYSTORE_PATH, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD (их задаёт файл .env.signing);
//  2) в buildTypes.release: подписывать ключом release, если KEYSTORE_PATH задан (иначе — отладочным, как было);
//  3) versionCode: берётся из переменной ANDROID_VERSION_CODE, если она задана (магазины требуют, чтобы номер рос).
// Сами пароли в файл НЕ пишутся — только имена переменных.
// Запуск: node server/patch-signing.mjs [путь/к/android/app/build.gradle]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(process.argv[2] ?? join(root, 'android/app/build.gradle'));
const MARK = '// na-cheboksare: подпись релиза (server/patch-signing.mjs)';

if (!existsSync(file)) {
  console.error(`ОШИБКА: нет файла ${file}. Сначала: npx expo prebuild --platform android`);
  process.exit(1);
}
let g = readFileSync(file, 'utf8');
if (g.includes(MARK)) {
  console.log('patch-signing: файл уже исправлен — ничего не меняю:', file);
  process.exit(0);
}

function fail(what) {
  console.error(`ОШИБКА: в build.gradle не найдено «${what}». Возможно, Expo поменял шаблон — нужна правка server/patch-signing.mjs.`);
  process.exit(1);
}

// 1) блок release в signingConfigs
const sc = g.indexOf('signingConfigs {');
if (sc < 0) fail('signingConfigs {');
const releaseCfg = `signingConfigs {
        ${MARK}
        release {
            if (System.getenv('KEYSTORE_PATH')) {
                storeFile file(System.getenv('KEYSTORE_PATH'))
                storePassword System.getenv('KEYSTORE_PASSWORD')
                keyAlias System.getenv('KEY_ALIAS')
                keyPassword System.getenv('KEY_PASSWORD')
            }
        }`;
g = g.slice(0, sc) + releaseCfg + g.slice(sc + 'signingConfigs {'.length);

// 2) buildTypes.release → signingConfigs.release
const bt = g.indexOf('buildTypes {');
if (bt < 0) fail('buildTypes {');
const rel = g.indexOf('release {', bt);
if (rel < 0) fail('buildTypes { release {');
const sig = g.indexOf('signingConfig signingConfigs.debug', rel);
const relEnd = g.indexOf('\n        }', rel); // конец блока release (отступ 8 пробелов, как в шаблоне Expo)
if (sig < 0 || (relEnd > 0 && sig > relEnd)) fail('signingConfig signingConfigs.debug внутри buildTypes.release');
g =
  g.slice(0, sig) +
  "signingConfig System.getenv('KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug" +
  g.slice(sig + 'signingConfig signingConfigs.debug'.length);

// 3) versionCode из переменной окружения
const vc = g.match(/^(\s*)versionCode (\d+)\s*$/m);
if (!vc) fail('versionCode');
g = g.replace(vc[0], `${vc[1]}versionCode((System.getenv('ANDROID_VERSION_CODE') ?: '${vc[2]}').toInteger())`);

writeFileSync(file, g);
console.log('patch-signing: готово —', file);
console.log('  подпись релиза: ключ из KEYSTORE_PATH (файл .env.signing); номер сборки: ANDROID_VERSION_CODE');
