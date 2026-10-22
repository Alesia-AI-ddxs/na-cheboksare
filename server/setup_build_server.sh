#!/usr/bin/env bash
# Подготовка своего Linux-сервера для сборки «На Чебоксаре» БЕЗ облака Expo и для веб-версии.
# Подходит: Ubuntu 22.04 / 24.04. Запуск ОДИН раз от root:
#   sudo bash server/setup_build_server.sh
# Можно запускать повторно — уже установленное пропускается.
#
# Что ставит:
#   - Node.js 22 (официальный репозиторий NodeSource)
#   - Java (OpenJDK 17) — нужна для сборки Android
#   - Android SDK: command-line tools, platform-tools, build-tools и платформы, NDK (лицензии принимаются сами)
#     ANDROID_HOME = /opt/android-sdk, прописывается в /etc/profile.d/android.sh
#   - nginx — раздаёт веб-версию; rsync, git, unzip, curl
#
# Версии Android берутся из того, что требует проект (React Native 0.88 / Expo SDK 58):
#   платформа 37, build-tools 37.0.0, NDK 27.1.12297006; дополнительно ставятся платформа 35 и build-tools 35.0.0.
# Поменять можно переменными перед запуском, например: ANDROID_PLATFORMS="android-37" sudo -E bash ...
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Запустите от root: sudo bash $0"
  exit 1
fi

ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
ANDROID_PLATFORMS="${ANDROID_PLATFORMS:-android-37 android-35}"
ANDROID_BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-37.0.0 35.0.0}"
ANDROID_NDK="${ANDROID_NDK:-27.1.12297006}"
# архив command-line tools с dl.google.com (номер сборки; если не скачается — пробуем запасной)
CMDLINE_TOOLS_BUILDS="${CMDLINE_TOOLS_BUILDS:-13114758 11076708}"
export DEBIAN_FRONTEND=noninteractive

step() { echo; echo "=== $* ==="; }

step "1/6 Системные пакеты"
apt-get update -y
apt-get install -y --no-install-recommends ca-certificates curl gnupg unzip zip git rsync nginx openjdk-17-jdk-headless

step "2/6 Node.js 22"
NODE_MAJOR="$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/' || true)"
if [ "${NODE_MAJOR:-0}" = "22" ]; then
  echo "Node.js уже есть: $(node -v)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "Установлен Node.js $(node -v)"
fi

step "3/6 Android command-line tools"
SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
if [ -x "$SDKMANAGER" ]; then
  echo "Уже установлены: $SDKMANAGER"
else
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  TMP="$(mktemp -d)"
  ok=""
  for b in $CMDLINE_TOOLS_BUILDS; do
    url="https://dl.google.com/android/repository/commandlinetools-linux-${b}_latest.zip"
    echo "Скачиваю $url"
    if curl -fL --retry 3 -o "$TMP/cmdline.zip" "$url"; then ok="yes"; break; fi
  done
  if [ -z "$ok" ]; then
    echo "ОШИБКА: не удалось скачать command-line tools. Проверьте доступ к dl.google.com"
    exit 1
  fi
  unzip -q "$TMP/cmdline.zip" -d "$TMP"
  rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  mv "$TMP/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm -rf "$TMP"
  echo "Установлены в $ANDROID_HOME/cmdline-tools/latest"
fi

step "4/6 Переменные Android для всех пользователей"
cat > /etc/profile.d/android.sh <<EOF
# Android SDK для сборки «На Чебоксаре» (создано server/setup_build_server.sh)
export ANDROID_HOME="$ANDROID_HOME"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="\$(dirname "\$(dirname "\$(readlink -f "\$(command -v javac)")")")"
export PATH="\$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
EOF
chmod 644 /etc/profile.d/android.sh
# shellcheck disable=SC1091
. /etc/profile.d/android.sh
echo "ANDROID_HOME=$ANDROID_HOME, JAVA_HOME=$JAVA_HOME"

step "5/6 Лицензии и пакеты Android SDK"
# «yes» обрывается, когда sdkmanager закончил, — поэтому здесь временно выключаем pipefail
set +o pipefail
yes | "$SDKMANAGER" --sdk_root="$ANDROID_HOME" --licenses >/dev/null
PKGS=("platform-tools" "ndk;$ANDROID_NDK")
for p in $ANDROID_PLATFORMS; do PKGS+=("platforms;$p"); done
for b in $ANDROID_BUILD_TOOLS; do PKGS+=("build-tools;$b"); done
echo "Ставлю: ${PKGS[*]}"
yes | "$SDKMANAGER" --sdk_root="$ANDROID_HOME" "${PKGS[@]}" >/dev/null
status=${PIPESTATUS[1]}
set -o pipefail
if [ "$status" -ne 0 ]; then echo "ОШИБКА: sdkmanager не смог установить пакеты (код $status)"; exit 1; fi
# сборщик Gradle сам докачивает недостающее — для этого папка SDK должна быть доступна на запись
chmod -R a+rwX "$ANDROID_HOME"
"$SDKMANAGER" --sdk_root="$ANDROID_HOME" --list_installed | sed -n '1,40p'

step "6/6 nginx"
systemctl enable --now nginx >/dev/null 2>&1 || service nginx start || true
nginx -v 2>&1

echo
echo "ГОТОВО. Откройте НОВОЕ окно терминала (чтобы подхватились переменные Android) и дальше:"
echo "  1) bash server/make_keystore.sh        — один раз: ключ подписи Android"
echo "  2) bash server/build_android.sh apk    — сборка APK (файл появится в server/out/)"
echo "  3) bash server/deploy_web.sh / /var/www/na-cheboksare — веб-версия"
