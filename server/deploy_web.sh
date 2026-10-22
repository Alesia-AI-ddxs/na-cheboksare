#!/usr/bin/env bash
# Выкладка веб-версии «На Чебоксаре» (PWA, работает без интернета) в папку nginx.
# Запуск:
#   bash server/deploy_web.sh / /var/www/na-cheboksare             → сайт в корне домена: https://<домен>/
#   bash server/deploy_web.sh /turizm/app /var/www/turizm/turizm/app       → сайт по адресу https://<домен>/turizm/app/
# Что делает: собирает сайт под нужный адрес (scripts/export-web.mjs), проверяет, что всё на месте,
# и копирует в папку nginx (rsync, лишние старые файлы удаляются). Нужны права на запись в папку
# (обычно: sudo bash server/deploy_web.sh ...).
set -euo pipefail

BASE="${1:-}"
ROOT_DIR="${2:-}"
if [ -z "$BASE" ] || [ -z "$ROOT_DIR" ]; then
  echo "Как запускать: bash server/deploy_web.sh <путь сайта> <папка nginx>"
  echo "  пример: bash server/deploy_web.sh / /var/www/na-cheboksare"
  echo "  пример: bash server/deploy_web.sh /turizm/app /var/www/turizm/turizm/app"
  exit 1
fi

cd "$(dirname "$0")/.."
export CI=1 EXPO_NO_TELEMETRY=1

if [ ! -d node_modules ]; then
  echo "--- Пакеты (npm ci) ---"
  npm ci --no-audit --no-fund
fi

echo "--- Сборка веб-версии под путь «$BASE» ---"
node scripts/export-web.mjs "$BASE"

CLEAN="${BASE%/}"
if [ -z "$CLEAN" ]; then OUT="dist"; else OUT="dist_$(echo "${CLEAN#/}" | sed -E 's/[^A-Za-z0-9]+/_/g')"; fi
for f in index.html sw.js manifest.webmanifest apple-touch-icon.png; do
  if [ ! -f "$OUT/$f" ]; then echo "ОШИБКА: в $OUT нет $f"; exit 1; fi
done

echo "--- Копирую $OUT/ → $ROOT_DIR/ ---"
mkdir -p "$ROOT_DIR"
# сначала скрипты и картинки, в самом конце страницы и sw.js — чтобы посетитель не поймал «полусайт»
if ! command -v rsync >/dev/null 2>&1; then
  echo "ОШИБКА: нет rsync. Установите: sudo apt install rsync (или запустите server/setup_build_server.sh)"
  exit 1
fi
rsync -a "$OUT/_expo" "$OUT/assets" "$ROOT_DIR/"
rsync -a --delete "$OUT/" "$ROOT_DIR/"
chmod -R a+rX "$ROOT_DIR"

echo
echo "ГОТОВО: веб-версия лежит в $ROOT_DIR"
echo "Пример настройки nginx: server/nginx-na-cheboksare.conf  (после правки: sudo nginx -t && sudo systemctl reload nginx)"
