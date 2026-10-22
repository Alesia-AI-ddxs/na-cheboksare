// Вспомогательные функции текста, которые были в src/i18n.ts версии 1.0 (не языковые строки).

/** Разбить многоабзацный текст на абзацы. */
export function paragraphs(s: string): string[] {
  return s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Ключ звания по очкам (сами звания — в таблице: ui.rank_1/2/3). */
export function rankKey(score: number): string {
  const idx = score >= 350 ? 0 : score >= 220 ? 1 : 2;
  return `ui.rank_${idx + 1}`;
}

/** Римская цифра этапа (не языковая строка — просто номер). */
export function roman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  let x = n;
  for (const [v, s] of map) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}
