@echo off
chcp 65001 >nul
rem Окно студии «На Чебоксаре»: открывает PowerShell в папке проекта
rem и убирает переменные прокси (иначе VPN мешает npm и EAS).
cd /d "%~dp0"
start "Студия - На Чебоксаре" powershell -NoExit -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item Env:HTTP_PROXY,Env:HTTPS_PROXY,Env:ALL_PROXY,Env:http_proxy,Env:https_proxy,Env:all_proxy -ErrorAction SilentlyContinue; Set-Location -LiteralPath '%~dp0'; Write-Host 'Прокси очищены. Папка проекта открыта.'; Write-Host 'Команды: npm install  |  npm run check  |  npm run web  |  npm run eas:preview'"
