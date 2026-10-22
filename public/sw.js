/* Сервис-воркер «На Чебоксаре»: веб-версия работает без интернета.
 *
 * Это ШАБЛОН. После веб-сборки скрипт scripts/postexport-pwa.mjs записывает в готовую папку (dist/)
 * копию этого файла, где заполнены три строки ниже: «собрано», номер версии и список всех файлов сайта.
 * В режиме разработки (npm run web) шаблон не заполнен — тогда воркер ничего не кэширует и не мешает.
 *
 * Как он работает:
 *  - при установке скачивает ВСЕ файлы сайта (≈4 МБ) — после первого открытия игра работает офлайн;
 *  - страницы: сначала пробует интернет (чтобы приходили обновления), без сети — берёт из кэша;
 *  - скрипты, картинки, шрифты (_expo/static, assets, icons): сразу из кэша — у них в имени хэш,
 *    поэтому они никогда не меняются;
 *  - при новой сборке номер версии меняется → браузер ставит новый воркер, старый кэш удаляется;
 *  - тяжёлые шрифты письменностей (китайские) заранее не качаются: приложение присылает сообщение 'cache-urls',
 *    когда гость выбрал язык, — воркер сохраняет файл, и язык дальше работает без интернета.
 * Сайт может лежать в корне (/) или в подпапке (/turizm/app/) — пути считаются от места, где лежит sw.js.
 */
const BUILT = false; // __BUILT__
const VERSION = 'dev'; // __VERSION__
const PRECACHE = []; // __PRECACHE__

const PREFIX = 'na-cheboksare-';
const CACHE = PREFIX + VERSION;
const SCOPE = self.registration.scope; // например https://site.ru/turizm/app/
const SCOPE_PATH = new URL(SCOPE).pathname;
const abs = (p) => new URL(p, SCOPE).href;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  if (!BUILT) return;
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // скачиваем по одному файлу: если один не скачался, остальные всё равно сохранятся
      await Promise.all(
        PRECACHE.map(async (p) => {
          try {
            const res = await fetch(new Request(abs(p), { cache: 'reload' }));
            if (res.ok) await cache.put(abs(p), res);
          } catch (e) {
            // нет сети — файл докачается при следующем открытии
          }
        }),
      );
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Какие адреса проверить в кэше для страницы: /route → /route, /route.html, /route/index.html
function pageCandidates(url) {
  const clean = url.origin + url.pathname;
  const list = [clean];
  if (clean.endsWith('/')) list.push(clean + 'index.html');
  else list.push(clean + '.html', clean + '/index.html');
  list.push(abs('index.html'));
  return list;
}

async function fromCache(urls) {
  for (const u of urls) {
    const hit = await caches.match(u, { ignoreSearch: true });
    if (hit) return hit;
  }
  return undefined;
}

async function networkFirstPage(request) {
  const url = new URL(request.url);
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(url.origin + url.pathname, res.clone()).catch(() => undefined);
    }
    return res;
  } catch (e) {
    const hit = await fromCache(pageCandidates(url));
    if (hit) return hit;
    return new Response('Нет интернета. Откройте приложение, когда появится связь.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, res.clone()).catch(() => undefined);
  }
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone()).catch(() => undefined);
    }
    return res;
  } catch (e) {
    const hit = await caches.match(request, { ignoreSearch: true });
    if (hit) return hit;
    throw e;
  }
}

// Языковой пакет офлайн: приложение просит сохранить файлы выбранного языка (например, китайский шрифт ≈10 МБ,
// который заранее всем не скачиваем). После этого язык работает без интернета.
self.addEventListener('message', (event) => {
  const d = event.data;
  if (!BUILT || !d || d.type !== 'cache-urls' || !Array.isArray(d.urls)) return;
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const u of d.urls) {
        try {
          const url = new URL(u, SCOPE);
          if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) continue;
          if (await caches.match(url.href, { ignoreSearch: true })) continue;
          const res = await fetch(url.href);
          if (res.ok) await cache.put(url.href, res);
        } catch (e) {
          // нет сети — сохраним в следующий раз
        }
      }
    }),
  );
});

self.addEventListener('fetch', (event) => {
  if (!BUILT) return;
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // чужие сайты (Telegram и т.п.) и адреса вне нашей папки не трогаем
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }
  const rel = url.pathname.slice(SCOPE_PATH.length);
  if (/^(_expo\/static\/|assets\/|icons\/)/.test(rel) || /\.(png|jpe?g|webp|svg|ico|ttf|otf|woff2?)$/i.test(rel)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(networkFirst(request));
});
