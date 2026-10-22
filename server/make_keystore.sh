#!/usr/bin/env bash
# Создаёт ключ подписи Android (keystore) для «На Чебоксаре» — ОДИН РАЗ на всю жизнь приложения.
# Запуск: bash server/make_keystore.sh
#
# Что получится:
#   secrets/na-cheboksare-release.jks — сам ключ
#   .env.signing                      — путь к ключу, имя и пароль (только для вас; в git не попадает)
# Пароль придумывается сам (случайный), если не задать свой: KEYSTORE_PASSWORD='...' bash server/make_keystore.sh
# Имя ключа по умолчанию nacheboksare (переменная KEY_ALIAS), данные владельца — KEY_DNAME.
#
# ОЧЕНЬ ВАЖНО: ключ и пароль нельзя потерять. Без них обновление приложения в магазине выпустить НЕЛЬЗЯ.
# Сразу сделайте копию папки secrets/ и файла .env.signing на флешку и в надёжное облако.
set -euo pipefail
cd "$(dirname "$0")/.."

KEYSTORE_PATH="${KEYSTORE_PATH:-secrets/na-cheboksare-release.jks}"
KEY_ALIAS="${KEY_ALIAS:-nacheboksare}"
KEY_DNAME="${KEY_DNAME:-CN=Na Cheboksare, O=Inospectrum Mobilus, C=RU}"
KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)}"
# в формате PKCS12 пароль ключа совпадает с паролем хранилища
KEY_PASSWORD="$KEYSTORE_PASSWORD"

if ! command -v keytool >/dev/null 2>&1; then
  echo "ОШИБКА: нет keytool (входит в Java). Сначала: sudo bash server/setup_build_server.sh"
  exit 1
fi
if [ -e "$KEYSTORE_PATH" ]; then
  echo "Ключ уже есть: $KEYSTORE_PATH — второй раз НЕ создаю (иначе старые сборки не обновить)."
  echo "Если ключ правда нужно заменить — переместите старый вручную и запустите снова."
  exit 1
fi
if [ -e .env.signing ]; then
  echo "Файл .env.signing уже есть — не перезаписываю. Уберите его вручную, если создаёте новый ключ."
  exit 1
fi

mkdir -p "$(dirname "$KEYSTORE_PATH")"
umask 077
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_PATH" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" \
  -dname "$KEY_DNAME" >/dev/null 2>&1

cat > .env.signing <<EOF
# Подпись Android «На Чебоксаре». НЕ отправлять никому, НЕ класть в git. Сделайте резервную копию!
# Создано server/make_keystore.sh $(date '+%Y-%m-%d %H:%M')
KEYSTORE_PATH=$KEYSTORE_PATH
KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD
KEY_ALIAS=$KEY_ALIAS
KEY_PASSWORD=$KEY_PASSWORD
EOF
chmod 600 .env.signing "$KEYSTORE_PATH"

echo "ГОТОВО: ключ создан."
echo "  ключ:   $KEYSTORE_PATH"
echo "  пароли: .env.signing (права только для вас)"
echo "Отпечаток SHA-256 (его просят RuStore, VK ID, Google — это НЕ секрет):"
keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" -alias "$KEY_ALIAS" 2>/dev/null | grep -E 'SHA256:' | sed 's/^\s*/  /'
echo
echo "!!! Сейчас же скопируйте $KEYSTORE_PATH и .env.signing в надёжное место (флешка + облако)."
echo "!!! Потеря ключа = невозможно выпустить обновление в RuStore/AppGallery."
