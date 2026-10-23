// Метки холодного старта для «Лаборатории замеров». Две цифры в памяти — ничего не сохраняется и не отправляется,
// на обычную работу приложения не влияет.
//  - JS_START — когда загрузился этот модуль (его первым импортирует src/app/_layout.tsx);
//  - firstScreen — первый кадр после того, как спрятана заставка и показан первый экран.
// originToScreen — то же от «начала отсчёта» performance.now(): в браузере это открытие страницы;
// на телефоне — как его считает движок (если число неправдоподобное, > 2 минут, — «нет данных»).
const now = (): number => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());

const JS_START = now();
let firstScreen: number | null = null;

/** Вызывается один раз: первый экран показан (src/app/_layout.tsx) */
export function markFirstScreen(): void {
  if (firstScreen === null) firstScreen = now();
}

export function startupTimes(): { jsToScreenMs: number | null; originToScreenMs: number | null } {
  if (firstScreen === null) return { jsToScreenMs: null, originToScreenMs: null };
  return {
    jsToScreenMs: Math.round(firstScreen - JS_START),
    originToScreenMs: firstScreen > 0 && firstScreen < 120_000 ? Math.round(firstScreen) : null,
  };
}
