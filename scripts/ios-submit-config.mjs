// Вписывает данные Apple в eas.json (раздел submit.production.ios), когда появится аккаунт Apple Developer.
// Берёт ASC_APP_ID и APPLE_TEAM_ID из .env.stores или переменных окружения.
//   ASC_APP_ID    — App Store Connect → Приложения → «На Чебоксаре» → Информация о приложении → Apple ID (число)
//   APPLE_TEAM_ID — developer.apple.com → Membership → Team ID (10 символов)
// Запуск: npm run stores:ios-config
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fail, loadStoresEnv, ROOT } from './lib/stores-common.mjs';

loadStoresEnv();
const asc = (process.env.ASC_APP_ID || '').trim();
const team = (process.env.APPLE_TEAM_ID || '').trim();
if (!asc || !team) fail('нужны ASC_APP_ID и APPLE_TEAM_ID в .env.stores');
if (!/^\d+$/.test(asc)) fail('ASC_APP_ID — это число (Apple ID приложения в App Store Connect)');
if (!/^[A-Z0-9]{10}$/.test(team)) fail('APPLE_TEAM_ID — 10 латинских букв/цифр');
const p = join(ROOT, 'eas.json');
const eas = JSON.parse(readFileSync(p, 'utf8'));
eas.submit = eas.submit ?? {};
eas.submit.production = eas.submit.production ?? {};
eas.submit.production.ios = { ...(eas.submit.production.ios ?? {}), ascAppId: asc, appleTeamId: team };
writeFileSync(p, JSON.stringify(eas, null, 2) + '\n');
console.log('eas.json обновлён: submit.production.ios заполнен. Дальше: npx eas submit -p ios --profile production');
