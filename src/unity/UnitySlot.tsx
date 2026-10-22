// Место под 3D-сцену Unity над виньеткой точки.
//
// СЕЙЧАС: ничего не рисует (UNITY_ENABLED = false) — экран точки показывает SVG-виньетку.
//
// ВОЛНА 0 (план, здесь НЕ реализовано):
//   - Unity 6 собирается как библиотека («Export as library» / Unity as a Library);
//   - подключается пакет @azesmway/react-native-unity (нужна dev-сборка EAS, в Expo Go не работает);
//   - здесь рендерится <UnityView ref=... onUnityMessage=... style={{ aspectRatio: 560 / 240 }} />.
//
// Договор сообщений (JSON-строки):
//   приложение → Unity:  { "type": "showEra", "pointId": <номер точки>, "era": "<эпоха из content.json>" }
//   Unity → приложение:  { "type": "ready" }      — сцена загружена, можно слать showEra
//                         { "type": "sceneDone" } — сцена доиграла, можно показывать текст/вопрос
//
// Важно: Unity получает только pointId и era. Все тексты, вопросы и находки
// по-прежнему берутся из content.json — 3D-сцена ничего не «знает» о контенте.
import { UNITY_ENABLED } from './config';

export type AppToUnity = { type: 'showEra'; pointId: number; era: string };
export type UnityToApp = { type: 'ready' } | { type: 'sceneDone' };

export function UnitySlot(_props: { pointId: number; era: string; onMessage?: (m: UnityToApp) => void }) {
  if (!UNITY_ENABLED) return null;
  // Сюда в волне 0 встанет UnityView. До тех пор — пусто.
  return null;
}
