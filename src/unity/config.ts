// Настройки 3D (Unity). Все — переменные для админа в app.json, в коде значений нет.
import Constants from 'expo-constants';

// Встроенный модуль Unity (Unity as a Library) внутри этого приложения. Пока выключен: приложение показывает 2D-виньетки.
// Включать только когда будет подключена библиотека Unity (см. UnitySlot.tsx).
export const UNITY_ENABLED = false;

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

/**
 * «Вариант Э» (волна 0, решение 23.10.2026): 3D-сцены — ОТДЕЛЬНОЕ приложение, открывается по ссылке-диплинку.
 * app.json → expo.extra.unity3dScheme — схема ссылки 3D-приложения (например «nacheboksare3d»; без «://»).
 * Пусто (сейчас) = кнопки «Открыть в 3D» нет нигде. Протокол — README_СТУДИИ.md, раздел «Волна 0 / вариант Э».
 */
export const UNITY_APP_SCHEME: string = (() => {
  const s = String(extra.unity3dScheme ?? '')
    .trim()
    .replace(/:\/\/.*$/, '')
    .replace(/:$/, '');
  return /^[a-z][a-z0-9+.-]*$/i.test(s) ? s.toLowerCase() : '';
})();

/**
 * app.json → expo.extra.unity3dStoreUrl — страница 3D-приложения в магазине (https://…).
 * Если 3D-приложение не установлено, а адрес задан, — кнопка «Открыть в 3D» ведёт в магазин. Пусто — кнопки нет.
 */
export const UNITY_APP_STORE_URL: string = (() => {
  const u = String(extra.unity3dStoreUrl ?? '').trim();
  return /^https:\/\/\S+$/i.test(u) ? u : '';
})();
