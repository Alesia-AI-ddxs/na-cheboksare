// Корневой HTML веб-версии (только для браузера, на телефонах-приложениях не используется).
// Здесь подключаем всё, что нужно, чтобы сайт «ставился» на iPhone и Android как приложение (PWA):
// манифест, иконку для экрана «Домой», цвет строки состояния и «сервис-воркер» для работы без интернета.
// Путь сайта (например /turizm/app) Expo подставляет сам через EXPO_BASE_URL (настройка experiments.baseUrl).
// ВАЖНО (Expo SDK 58): headNodes и bodyNodes обязательно выводить — в них скрипты приложения.
// Без bodyNodes страница показывается, но кнопки не работают.
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import React, { type PropsWithChildren } from 'react';

// Базовый путь сайта без завершающей косой черты: '' для корня или '/turizm/app'.
const BASE = String(process.env.EXPO_BASE_URL ?? '').replace(/\/+$/, '');

// Регистрация сервис-воркера: только если браузер его поддерживает. Ошибки не мешают работе сайта.
const registerSw = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${BASE}/sw.js', { scope: '${BASE}/' }).catch(function () {});
  });
}`;

export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html {...htmlAttributes} lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* PWA: установка на экран «Домой» */}
        <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />
        <meta name="theme-color" content="#F5F0E6" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0F1920" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="На Чебоксаре" />
        <link rel="apple-touch-icon" sizes="180x180" href={`${BASE}/apple-touch-icon.png`} />

        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: registerSw }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
