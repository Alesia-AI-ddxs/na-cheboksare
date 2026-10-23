// Место под 3D-сцену Unity над виньеткой точки.
//
// СЕЙЧАС: ничего не рисует (UNITY_ENABLED = false) — экран точки показывает SVG-виньетку.
//
// v1.2.0: в волне 0 выбран «вариант Э» — 3D-сцены в ОТДЕЛЬНОМ приложении по ссылке (src/unity/appLink.ts,
// кнопка src/unity/Open3DButton.tsx, протокол — README_СТУДИИ.md «Волна 0 / вариант Э»). Этот слот — запасной путь
// «встроенный модуль», остаётся выключенным.
//
// ВСТРОЕННЫЙ МОДУЛЬ (план, здесь НЕ реализовано):
//   - Unity 6 собирается как библиотека («Export as library» / Unity as a Library);
//   - подключается пакет @azesmway/react-native-unity (нужна dev-сборка EAS, в Expo Go не работает);
//   - здесь рендерится <UnityView ref=... onUnityMessage=... style={{ aspectRatio: 560 / 240 }} />.
//
// Договор сообщений (JSON-строки):
//   приложение → Unity:  { "type": "showEra", "pointId": <номер точки>, "era": "<эпоха из content.json>",
//                          "lang": "<письменный вариант: ru-RU, en-GB, ar…>", "voice": "<голосовой: en-IE, ar-EG…>" }
//   lang/voice — тот же выбор, что в приложении (языковой модуль, ТЗ мультиязычности р.2): отдельной
//   языковой системы в Unity не заводим; 3D-сцена берёт язык только отсюда.
//   Unity → приложение:  { "type": "ready" }      — сцена загружена, можно слать showEra
//                         { "type": "sceneDone" } — сцена доиграла, можно показывать текст/вопрос
//
// Важно: Unity получает только pointId и era. Все тексты, вопросы и находки
// по-прежнему берутся из content.json — 3D-сцена ничего не «знает» о контенте.
import { UNITY_ENABLED } from './config';

export type AppToUnity = { type: 'showEra'; pointId: number; era: string; lang: string; voice: string };
export type UnityToApp = { type: 'ready' } | { type: 'sceneDone' };

/** Сообщение «показать эпоху» для Unity — вместе с языком и произношением */
export function showEraMessage(pointId: number, era: string, lang: string, voice: string): string {
  const m: AppToUnity = { type: 'showEra', pointId, era, lang, voice };
  return JSON.stringify(m);
}

export function UnitySlot(_props: { pointId: number; era: string; lang: string; voice: string; onMessage?: (m: UnityToApp) => void }) {
  if (!UNITY_ENABLED) return null;
  // Сюда в волне 0 встанет UnityView. До тех пор — пусто.
  return null;
}
