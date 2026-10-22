# «На Чебоксаре» — мобильное приложение 1.0.0

Городской квест для гостей Чебоксар. 9 точек маршрута, у каждой — рассказы героев по трём слоям
(документ / наука / предание), задание из трёх вариантов и находка в коллекцию.
Этап I «Город у воды», этап II «Купеческий город» (открывается после этапа I).
Языки: 12 в таблице, 8 готовы; чувашский, татарский, эрзянский и мокшанский показаны как «готовится».

Сделано на Expo (React Native) + Expo Router. Работает на Android, iOS и в браузере. Полностью офлайн.

## Карта папок

| Папка / файл | Что там |
|---|---|
| `src/content/content.json` | ВСЕ тексты, вопросы, находки, языки. Единственный источник правды |
| `src/app/` | Экраны: пролог, вкладки (Маршрут, Находки, Сетнер, О проекте), точка, финал этапа |
| `src/components/` | Виньетки сцен, карта, иконки находок, кнопки |
| `src/state/game.tsx` | Прогресс игры (хранится только на телефоне) |
| `src/unity/` | Место под 3D-сцены Unity (сейчас выключено) |
| `assets/images/` | Иконка, заставка, портрет Олеария (1669) |
| `scripts/validate-content.mjs` | Проверка контента: что готово, чего не хватает |
| `scripts/make-icons.mjs` | Генератор иконки-сокола и заставки |
| `scripts/qa-screens.mjs` | Снимки экранов веб-версии для проверки |
| `tools/content_build.py` | Сборка `content.json` из мастер-таблицы Excel |
| `eas.json`, `.eas/workflows/` | Настройки облачных сборок EAS и сценарии выпуска в магазины |
| `src/app/+html.tsx`, `public/` | Веб-версия как приложение (PWA): манифест, иконки, `sw.js` для работы без интернета |
| `scripts/export-web.mjs`, `scripts/postexport-pwa.mjs` | Веб-сборка под любой адрес + подготовка PWA |
| `scripts/pwa-offline-check.mjs` | Проверка: ставится ли сайт и работает ли без интернета |
| `scripts/rustore-publish.mjs`, `scripts/appgallery-publish.mjs` | Публикация в RuStore и AppGallery (без сторонних пакетов) |
| `scripts/stores-doctor.mjs` | Проверка ключей всех магазинов |
| `.env.stores.example` | Список ключей магазинов и где их взять (копия `.env.stores` — только у вас) |
| `tests/publish-mock.test.mjs` | Тесты публикации на «поддельных» серверах магазинов |
| `server/` | Свой Linux-сервер: сборка Android без облака Expo и веб-хостинг (см. `server/README_СЕРВЕР.md`) |
| `СБОРКА_И_ВЫПУСК.cmd` | Меню для Windows: тестовый APK, RuStore, AppGallery, Google Play, проверка ключей |
| `ОКНО_СТУДИИ.cmd` | Открыть PowerShell в папке проекта без прокси (Windows) |

## Команды

```bash
npm install              # установить зависимости (один раз)
npm run check            # проверка типов + проверка контента (должно быть зелёным)
npm run web              # запустить в браузере для просмотра
npm run web:export       # собрать веб-версию (PWA) в папку dist/ — для сайта в корне домена
npm run web:export:turizm  # то же для адреса /turizm/app/ → папка dist_turizm_app/
npm run pwa:check        # проверка PWA: установка и работа без интернета (после web:export)
npm run qa:screens       # снимки экранов в qa/screens/ (после web:export)
npm run icons            # перерисовать иконку, заставку и иконки PWA
npm run stores:doctor    # какие ключи магазинов уже есть, каких не хватает
npm run test:publish     # тесты скриптов публикации (без настоящих магазинов)
```

На Windows сначала дважды щёлкните `ОКНО_СТУДИИ.cmd` — откроется окно PowerShell, где прокси VPN не мешает npm.

## Первая сборка APK через EAS (по шагам)

1. `npx eas login` — откроется браузер, войдите в аккаунт Expo.
2. `npx eas init` (или `npm run eas:init`) — создаст проект в Expo и запишет `projectId` в `app.json`
   (если поле `extra.eas.projectId` уже заполнено — этот шаг уже сделан).
3. `npx eas credentials:configure-build -p android -e preview` — EAS сам создаст и сохранит ключ подписи Android.
4. `npm run eas:preview` — облачная сборка APK для теста. Ссылку на APK EAS покажет в конце.

Дальше:
- Проще всего — дважды щёлкнуть `СБОРКА_И_ВЫПУСК.cmd` и выбрать пункт меню.
- `npm run release:rustore` — сценарий `.eas/workflows/release-ru-stores.yml`: собирает APK профиля
  `production-apk` и загружает его в RuStore **черновиком** (`scripts/rustore-publish.mjs`).
  `npm run release:ru-all` — то же сразу в RuStore и AppGallery. Отправка на модерацию — только явно:
  `npx eas workflow:run .eas/workflows/release-ru-stores.yml -F stores=rustore -F submit=yes`.
- `npm run eas:release-gp` — сценарий `.eas/workflows/release-google-play.yml`: AAB профиля `production`
  → Google Play, внутреннее тестирование, черновик. Самый первый AAB Google принимает только вручную в Play Console.
- Ключи магазинов: скопируйте `.env.stores.example` → `.env.stores`, заполните, проверьте `npm run stores:doctor`.
  Для облака EAS те же имена заведите в expo.dev → проект → Environment variables (среда production, тип Secret).
- Без облака: `node scripts/rustore-publish.mjs --file app.apk --submit no` (добавьте `--dry-run`, чтобы только
  посмотреть план — ничего не отправится).
- Сборка на своём сервере без Expo — `server/README_СЕРВЕР.md`.
- Номер сборки Android (versionCode) ведёт EAS (`appVersionSource: remote`), руками не менять.

## iPhone

**Сейчас (аккаунта Apple нет) — веб-версия как приложение (PWA).**
Сайт с игрой ставится на iPhone как обычное приложение и после первого открытия работает без интернета.
1. Выложите веб-версию на свой домен с HTTPS (`server/README_СЕРВЕР.md`, шаг 5) — или откройте готовый адрес.
2. На iPhone откройте адрес в **Safari** → кнопка «Поделиться» (квадрат со стрелкой) → **«На экран „Домой“»** → «Добавить».
3. На экране появится значок-сокол «На Чебоксаре». Он открывается без адресной строки, как приложение.
Во вкладке «О проекте» веб-версии есть та же подсказка (её не видно, когда игра уже открыта с экрана «Домой»).

**Потом — App Store (когда появится аккаунт).**
1. Оформить Apple Developer Program на ИП (платная годовая подписка, developer.apple.com). Условия оформления
   и оплаты из России перед подачей проверить на сайте Apple — здесь они **не проверены**.
2. `npx eas credentials -p ios` — войти своим Apple ID; EAS сам создаст сертификаты и профили.
3. `npm run eas:preview:ios` — тестовая сборка для своих iPhone (профиль `preview`, распространение internal;
   телефоны заранее регистрируются командой `npx eas device:create`).
4. Создать приложение в App Store Connect (bundle ID `ru.inospectrum.nacheboksare`), вписать ASC_APP_ID и
   APPLE_TEAM_ID в `.env.stores` → `npm run stores:ios-config` (запишет их в `eas.json`).
5. `npx eas build -p ios --profile production` → `npx eas submit -p ios --profile production` — сборка уходит
   в **TestFlight**; после проверки там — «Отправить на проверку» в App Store Connect.
Имя под значком на iPhone — «На Чебоксаре» (`ios.infoPlist.CFBundleDisplayName` в `app.json`).

## Как обновить тексты (заменить content.json)

1. Обновите мастер-таблицу `КОНТЕНТ_На_Чебоксаре_vX.Y_ДАТА.xlsx`.
2. Соберите JSON:
   ```bash
   python3 -I tools/content_build.py "путь/к/КОНТЕНТ_На_Чебоксаре_vX.Y.xlsx" src/content/content.json
   ```
   (нужен Python 3 и пакет `openpyxl`: `pip install openpyxl`)
3. `npm run check` — скрипт покажет таблицу «точка — готова/не готова — чего не хватает».
   Недостающие тексты не ломают сборку: в приложении они помечены «готовится».
4. Если всё зелёное — `npm run eas:preview`.

Строки интерфейса, которые приложение уже умеет показывать, но которых ещё нет в таблице, `npm run check`
печатает отдельной строкой (например `ui.tab_about`, `ui.map2`, `ui.rank_1…3`, `ui.kind_*`). Пока их нет,
на экране виден сам ключ или русский запасной вариант — добавьте их в лист «Интерфейс».

## Где слот для Unity

`src/unity/UnitySlot.tsx` — компонент над виньеткой на экране точки. Сейчас ничего не показывает
(`UNITY_ENABLED = false` в `src/unity/config.ts`). В «волне 0» сюда подключается сцена Unity 6
(экспорт «как библиотека») через `@azesmway/react-native-unity`. Договор сообщений описан в файле:
приложение → Unity `{type:'showEra', pointId, era}`, Unity → приложение `{type:'ready'}` / `{type:'sceneDone'}`.
Тексты и вопросы остаются в `content.json` — 3D-сцена их не трогает.
