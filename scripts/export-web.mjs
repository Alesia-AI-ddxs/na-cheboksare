// Веб-сборка «На Чебоксаре» под любой адрес сайта + подготовка PWA (работа без интернета, установка на iPhone).
// Запуск:
//   node scripts/export-web.mjs /             → папка dist/              (сайт в корне домена)
//   node scripts/export-web.mjs /turizm/app   → папка dist_turizm_app/   (сайт по адресу https://домен/turizm/app/)
// Что делает: на время сборки вписывает путь в app.json (experiments.baseUrl), собирает сайт,
// ВСЕГДА возвращает app.json как было (даже при ошибке; чужие правки за время сборки не теряются), затем запускает scripts/postexport-pwa.mjs.
// Облако Expo не нужно: сборка идёт целиком на этом компьютере.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appJsonPath = join(root, 'app.json');

let base = String(process.argv[2] ?? '/').trim();
if (!base.startsWith('/')) base = '/' + base;
base = base.replace(/\/+$/, ''); // '' — корень
const outDir = base ? 'dist_' + base.slice(1).replace(/[^A-Za-z0-9]+/g, '_') : 'dist';

const original = readFileSync(appJsonPath, 'utf8');
const app = JSON.parse(original);
app.expo.experiments = app.expo.experiments ?? {};
if (base) app.expo.experiments.baseUrl = base;
else delete app.expo.experiments.baseUrl;

const env = { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1', EXPO_OFFLINE: '1' };
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

console.log(`Веб-сборка: путь сайта «${base || '/'}» → папка ${outDir}/`);
const modified = JSON.stringify(app, null, 2) + '\n';
const originalBase = JSON.parse(original).expo?.experiments?.baseUrl;

// Возврат app.json: если за время сборки файл никто не трогал — кладём исходный байт в байт;
// если кто-то успел его поправить — сохраняем его правки и возвращаем только experiments.baseUrl.
function restoreAppJson() {
  const now = readFileSync(appJsonPath, 'utf8');
  if (now === modified) {
    writeFileSync(appJsonPath, original);
    return;
  }
  const cur = JSON.parse(now);
  cur.expo.experiments = cur.expo.experiments ?? {};
  if (originalBase === undefined) delete cur.expo.experiments.baseUrl;
  else cur.expo.experiments.baseUrl = originalBase;
  writeFileSync(appJsonPath, JSON.stringify(cur, null, 2) + '\n');
  console.log('app.json менялся во время сборки — правки сохранены, путь сайта возвращён как был.');
}

let code = 1;
try {
  writeFileSync(appJsonPath, modified);
  // --clear (v1.2.0): без него Metro берёт описание приложения (app.json → Constants.expoConfig) из своего кэша —
  // в веб-сборку попадала старая версия (в 1.1.1 браузер видел «1.0.0» и старые extra). С --clear — всегда текущий app.json.
  const r = spawnSync(npx, ['expo', 'export', '--platform', 'web', '--clear', '--output-dir', outDir], {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  code = r.status ?? 1;
} finally {
  restoreAppJson();
}
if (code !== 0) {
  console.error('ОШИБКА: веб-сборка не удалась (текст выше).');
  process.exit(code);
}

const p = spawnSync(process.execPath, [join(root, 'scripts/postexport-pwa.mjs'), '--dir', outDir, '--base', base || '/'], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(p.status ?? 1);
