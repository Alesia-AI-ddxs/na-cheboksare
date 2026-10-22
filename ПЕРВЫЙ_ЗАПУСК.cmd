@echo off
chcp 65001 >nul
rem ПЕРВЫЙ ЗАПУСК приложения «На Чебоксаре» v1.0 — одна кнопка для владельца.
rem Делает по порядку: убирает прокси VPN → ставит пакеты → проверка → вход в Expo (откроется браузер)
rem → создаёт проект в EAS → ключ подписи Android → тестовая сборка APK (1 из 15 бесплатных в месяц).
rem Повторный запуск безопасен: шаги, которые уже сделаны, пропускаются или просто подтверждаются.
cd /d "%~dp0"
powershell -NoExit -NoProfile -ExecutionPolicy Bypass -Command ^
 "Remove-Item Env:HTTP_PROXY,Env:HTTPS_PROXY,Env:ALL_PROXY,Env:http_proxy,Env:https_proxy,Env:all_proxy -ErrorAction SilentlyContinue;" ^
 "Set-Location -LiteralPath '%~dp0';" ^
 "Write-Host '=== 1/6 Пакеты (npm install) ===' -ForegroundColor Cyan; npm install; if ($LASTEXITCODE -ne 0) { Write-Host 'ОШИБКА на шаге 1 — пришлите текст выше' -ForegroundColor Red; exit }" ^
 "Write-Host '=== 2/6 Проверка (npm run check) ===' -ForegroundColor Cyan; npm run check; if ($LASTEXITCODE -ne 0) { Write-Host 'ОШИБКА на шаге 2 — сборку не запускаем' -ForegroundColor Red; exit }" ^
 "Write-Host '=== 3/6 Вход в Expo (откроется браузер, войдите через Google) ===' -ForegroundColor Cyan; npx eas whoami 2>$null; if ($LASTEXITCODE -ne 0) { npx eas login }" ^
 "Write-Host '=== 4/6 Проект в EAS (ответьте Y) ===' -ForegroundColor Cyan; npx eas init" ^
 "Write-Host '=== 5/6 Ключ подписи Android (ответьте Y — ключ хранит EAS) ===' -ForegroundColor Cyan; npx eas credentials:configure-build -p android -e preview" ^
 "Write-Host '=== 6/6 Тестовая сборка APK (1 сборка из 15) ===' -ForegroundColor Cyan; $a = Read-Host 'Запустить сборку? (да/нет)'; if ($a -eq 'да' -or $a -eq 'y' -or $a -eq 'Y') { npx eas build -p android --profile preview } else { Write-Host 'Сборка не запущена. Позже: npm run eas:preview' }" ^
 "Write-Host ''; Write-Host 'Готово. Ссылка на APK и QR — на странице сборки в expo.dev (её напечатает команда выше).' -ForegroundColor Green"
