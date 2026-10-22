#!/usr/bin/env bash
# Сборка Android «На Чебоксаре» на СВОЁМ сервере — без облака Expo.
# Запуск (из любой папки):
#   bash server/build_android.sh apk               → APK для RuStore / AppGallery / установки напрямую
#   bash server/build_android.sh aab               → AAB для Google Play (и RuStore тоже принимает)
#   bash server/build_android.sh apk preview       → то же, пометка «preview» в имени файла
# Готовый файл: server/out/na-cheboksare-<версия>-<профиль>-<дата>.apk|aab (+ контрольная сумма sha256).
#
# Нужно заранее: sudo bash server/setup_build_server.sh (один раз) и bash server/make_keystore.sh (один раз).
# Номер сборки для магазинов (versionCode) — переменная ANDROID_VERSION_CODE; если не задана,
# берётся из даты и часа (ГГММДДЧЧ, например 26102215) — так он всегда растёт.
set -euo pipefail

KIND="${1:-apk}"
PROFILE="${2:-production}"
case "$KIND" in apk|aab) ;; *) echo "Первый параметр: apk или aab"; exit 1 ;; esac
case "$PROFILE" in preview|production) ;; *) echo "Второй параметр: preview или production"; exit 1 ;; esac

cd "$(dirname "$0")/.."
PROJECT="$(pwd)"

# --- Android SDK и Java ---
if [ -f /etc/profile.d/android.sh ]; then
  # shellcheck disable=SC1091
  . /etc/profile.d/android.sh
fi
if [ -z "${ANDROID_HOME:-}" ] || [ ! -d "${ANDROID_HOME}" ]; then
  echo "ОШИБКА: не найден Android SDK. Сначала: sudo bash server/setup_build_server.sh"
  exit 1
fi

# --- ключ подписи ---
if [ ! -f .env.signing ]; then
  echo "ОШИБКА: нет файла .env.signing. Сначала: bash server/make_keystore.sh"
  exit 1
fi
set -a
# shellcheck disable=SC1091
. ./.env.signing
set +a
for v in KEYSTORE_PATH KEYSTORE_PASSWORD KEY_ALIAS KEY_PASSWORD; do
  if [ -z "${!v:-}" ]; then echo "ОШИБКА: в .env.signing не заполнено $v"; exit 1; fi
done
case "$KEYSTORE_PATH" in /*) ;; *) KEYSTORE_PATH="$PROJECT/$KEYSTORE_PATH" ;; esac
if [ ! -f "$KEYSTORE_PATH" ]; then echo "ОШИБКА: нет файла ключа $KEYSTORE_PATH"; exit 1; fi
export KEYSTORE_PATH KEYSTORE_PASSWORD KEY_ALIAS KEY_PASSWORD

export ANDROID_VERSION_CODE="${ANDROID_VERSION_CODE:-$(date +%y%m%d%H)}"
export APP_ENV="$PROFILE"
export CI=1 EXPO_NO_TELEMETRY=1
VERSION="$(node -p "require('./app.json').expo.version")"
STAMP="$(date +%Y%m%d-%H%M)"
OUT_DIR="$PROJECT/server/out"
mkdir -p "$OUT_DIR"

echo "=== Сборка $KIND ($PROFILE), версия $VERSION, номер сборки $ANDROID_VERSION_CODE ==="

echo "--- 1/4 Пакеты (npm ci) ---"
npm ci --no-audit --no-fund

echo "--- 2/4 Нативный проект Android (expo prebuild) ---"
# prebuild меняет строки android/ios в package.json — возвращаем файл как был
cp package.json "$OUT_DIR/.package.json.bak"
trap 'cp "$OUT_DIR/.package.json.bak" package.json 2>/dev/null || true' EXIT
npx expo prebuild --platform android --clean --no-install
cp "$OUT_DIR/.package.json.bak" package.json
node server/patch-signing.mjs android/app/build.gradle

echo "--- 3/4 Gradle ---"
cd android
chmod +x gradlew
if [ "$KIND" = "apk" ]; then
  ./gradlew --no-daemon :app:assembleRelease
  SRC="app/build/outputs/apk/release/app-release.apk"
else
  ./gradlew --no-daemon :app:bundleRelease
  SRC="app/build/outputs/bundle/release/app-release.aab"
fi
cd "$PROJECT"

echo "--- 4/4 Готовый файл ---"
DEST="$OUT_DIR/na-cheboksare-$VERSION-$PROFILE-$STAMP.$KIND"
cp "android/$SRC" "$DEST"
( cd "$OUT_DIR" && sha256sum "$(basename "$DEST")" | tee "$(basename "$DEST").sha256" )

# проверка подписи: файл должен быть подписан НАШИМ ключом, а не отладочным
if [ "$KIND" = "apk" ]; then
  APKSIGNER="$(ls -d "$ANDROID_HOME"/build-tools/*/apksigner 2>/dev/null | sort -V | tail -1 || true)"
  if [ -n "$APKSIGNER" ]; then
    CERT="$("$APKSIGNER" verify --print-certs "$DEST" | grep -m1 'certificate DN' || true)"
    echo "Подпись: $CERT"
    if echo "$CERT" | grep -q 'Android Debug'; then echo "ОШИБКА: файл подписан отладочным ключом!"; exit 1; fi
  fi
else
  jarsigner -verify "$DEST" >/dev/null && echo "Подпись AAB: проверена (jarsigner)"
fi

echo
echo "ГОТОВО: $DEST"
echo "Дальше: RuStore — node scripts/rustore-publish.mjs --file \"$DEST\" --submit no"
