/**
 * Ссылка на отдельное 3D-приложение («вариант Э», волна 0) — ЕДИНСТВЕННОЕ место, где она строится.
 *   <схема>://scene/<номер точки>?lang=<письменный вариант>&code=<код прохождения>
 *   пример: nacheboksare3d://scene/2?lang=ru-RU&code=ND-9EXU
 * lang — тот же выбор языка, что в приложении (код из src/i18n/languages.ts: ru-RU, en-GB, ar…);
 * code — код прохождения (ND-XXXX); если кода ещё нет или он не по правилам — параметр code не пишем.
 * Пустая схема — ссылки нет (undefined). Проверка формата — npm run qa:lab.
 */
const SCHEME = /^[a-z][a-z0-9+.-]*$/;
const LANG = /^[A-Za-z0-9-]{1,20}$/;
const CODE = /^[A-Za-z0-9_-]{1,64}$/;

export function unity3dLink(scheme: string | null | undefined, pointId: number, lang?: string | null, code?: string | null): string | undefined {
  const s = (scheme ?? '').trim().toLowerCase();
  if (!s || !SCHEME.test(s) || !Number.isInteger(pointId) || pointId < 0) return undefined;
  const q: string[] = [];
  if (lang && LANG.test(lang)) q.push(`lang=${encodeURIComponent(lang)}`);
  if (code && CODE.test(code)) q.push(`code=${encodeURIComponent(code)}`);
  return `${s}://scene/${pointId}${q.length ? '?' + q.join('&') : ''}`;
}
