@echo off
chcp 65001 >nul
rem СБОРКА И ВЫПУСК «На Чебоксаре» — меню для владельца (Windows).
rem Дважды щёлкните этот файл. Перед каждой командой прокси VPN убираются (иначе мешают npm и EAS).
rem Пункты 2–4 спрашивают подтверждение «да» — без него ничего не запускается.
setlocal
cd /d "%~dp0"
set "HTTP_PROXY="
set "HTTPS_PROXY="
set "ALL_PROXY="
set "NO_PROXY="

:menu
echo.
echo ============================================================
echo   «На Чебоксаре» — сборка и выпуск
echo ============================================================
echo   1) Тестовый APK через EAS (облако, 1 сборка из бесплатных)
echo   2) Выпуск в RuStore ЧЕРНОВИКОМ (сборка + загрузка)
echo   3) RuStore + AppGallery ЧЕРНОВИКОМ
echo   4) Google Play — внутренний тест (черновик)
echo   5) Проверка ключей магазинов (ничего не отправляет)
echo   0) Выход
echo ------------------------------------------------------------
set "choice="
set /p "choice=Ваш выбор: "
if "%choice%"=="1" goto apk
if "%choice%"=="2" goto rustore
if "%choice%"=="3" goto ruall
if "%choice%"=="4" goto gplay
if "%choice%"=="5" goto doctor
if "%choice%"=="0" goto end
echo Нет такого пункта.
goto menu

:apk
call npm run eas:apk
goto done

:rustore
call :confirm "Собрать APK и загрузить черновик в RuStore"
if errorlevel 1 goto menu
call npm run release:rustore
goto done

:ruall
call :confirm "Собрать APK и загрузить черновики в RuStore и AppGallery"
if errorlevel 1 goto menu
call npm run release:ru-all
goto done

:gplay
call :confirm "Собрать AAB и отправить во внутренний тест Google Play"
if errorlevel 1 goto menu
call npm run eas:release-gp
goto done

:doctor
call npm run stores:doctor
goto done

:confirm
echo.
echo %~1?
set "ans="
set /p "ans=Напишите да и нажмите Enter: "
if /i "%ans%"=="да" exit /b 0
if /i "%ans%"=="д" exit /b 0
if /i "%ans%"=="y" exit /b 0
if /i "%ans%"=="yes" exit /b 0
echo Отменено.
exit /b 1

:done
echo.
if errorlevel 1 (echo Была ошибка — пришлите текст выше.) else (echo Готово.)
goto menu

:end
endlocal
