// Общие помощники для скриптов публикации в магазины (RuStore, AppGallery и др.).
// Только встроенные возможности Node 22 — никаких сторонних пакетов.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Читает файл с ключами (по умолчанию .env.stores в папке проекта) и добавляет значения в process.env.
 * Уже заданные переменные окружения НЕ перезаписываются (так EAS и сервер могут передавать свои).
 * Формат строк: ИМЯ=значение, комментарии начинаются с #, кавычки вокруг значения можно ставить.
 */
export function loadStoresEnv(file = process.env.STORES_ENV_FILE || join(ROOT, '.env.stores')) {
  if (!existsSync(file)) return false;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined || process.env[m[1]] === '') process.env[m[1]] = v;
  }
  return true;
}

/** Данные приложения из app.json: имя пакета Android, версия. */
export function appInfo() {
  const app = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo;
  return { packageName: app.android?.package, bundleId: app.ios?.bundleIdentifier, version: app.version, name: app.name };
}

/** Разбор аргументов вида --file app.apk --submit yes --dry-run */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { file: undefined, submit: 'no', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--file') out.file = argv[++i];
    else if (a === '--submit') out.submit = String(argv[++i] ?? 'no').toLowerCase();
    else if (a.startsWith('--file=')) out.file = a.slice(7);
    else if (a.startsWith('--submit=')) out.submit = a.slice(9).toLowerCase();
  }
  out.submit = ['yes', 'да', 'true', '1'].includes(out.submit) ? 'yes' : 'no';
  return out;
}

/** Скрыть секрет: показываем только длину и пару символов по краям. */
export function mask(v) {
  if (v === undefined || v === null || v === '') return '<не задан>';
  const s = String(v);
  if (s.length <= 8) return '****';
  return `${s.slice(0, 2)}…${s.slice(-2)} (${s.length} симв.)`;
}

/** Текст «что нового» для магазина: переменная окружения → первый раздел CHANGELOG.md → пусто. */
export function whatsNew(envName) {
  if (process.env[envName]) return process.env[envName];
  const f = join(ROOT, 'CHANGELOG.md');
  if (!existsSync(f)) return '';
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s/.test(l));
  if (start < 0) return '';
  const body = [];
  for (let i = start + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) body.push(lines[i]);
  return body.join('\n').trim().slice(0, 5000);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function fail(msg) {
  console.error('ОШИБКА:', msg);
  process.exit(1);
}
