// Цвета и шрифты — перенесены из CSS веб-прототипа игры (turizm/igra/index.html).
import { Platform, useColorScheme } from 'react-native';
import { familyNames } from './i18n/fonts';
import { byCode } from './i18n/languages';

export type Palette = {
  paper: string;
  panel: string;
  ink: string;
  muted: string;
  volga: string;
  volgaDeep: string;
  gold: string;
  goldInk: string;
  varya: string;
  line: string;
  ok: string;
  bad: string;
  sky1: string;
  sky2: string;
  water: string;
  night1: string;
  night2: string;
  docChip: string;
  volgaBtn: string;
  legChip: string;
  dark: boolean;
};

export const light: Palette = {
  paper: '#F5F0E6',
  panel: '#FFFDF7',
  ink: '#243038',
  muted: '#6B6456',
  volga: '#1C3D5A',
  volgaDeep: '#122A40',
  gold: '#B98A2B',
  goldInk: '#221A05',
  varya: '#2E7D6B',
  line: '#DED5C2',
  ok: '#2E7D6B',
  bad: '#B4452F',
  sky1: '#2B4A66',
  sky2: '#C97B4A',
  water: '#16344C',
  night1: '#0D1B2A',
  night2: '#2E4057',
  docChip: '#1C3D5A',
  volgaBtn: '#1C3D5A',
  legChip: '#8A5A44',
  dark: false,
};

export const dark: Palette = {
  paper: '#0F1920',
  panel: '#17242E',
  ink: '#EAE3D2',
  muted: '#A59B86',
  volga: '#7FA8C9',
  volgaDeep: '#0C1D2B',
  gold: '#D9AF4C',
  goldInk: '#221A05',
  varya: '#4CA18C',
  line: '#2B3B47',
  ok: '#4CA18C',
  bad: '#E88A6F',
  sky1: '#101E2C',
  sky2: '#5A3A2E',
  water: '#0A1824',
  night1: '#0D1B2A',
  night2: '#2E4057',
  docChip: '#2E567A',
  volgaBtn: '#2E567A',
  legChip: '#8A5A44',
  dark: true,
};

export function usePalette(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

// Шрифты (ТЗ мультиязычности р.6): латиница и кириллица — фирменная пара Prata (заголовки) + PT Sans (текст);
// китайский, деванагари, арабское письмо — Noto выбранного письма (src/i18n/fonts.ts, грузится по требованию).
// Пока шрифт письма не загружен — системный шрифт (квадратиков «□» не будет: система подставит свой).
const SERIF_FALLBACK = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });

/** spacing=false — разрядка букв запрещена (арабское письмо и деванагари: буквы связаны, разрядка рвёт слова) */
export type Fonts = { display?: string; body?: string; bold?: string; spacing: boolean };
export function fontsFor(lang: string, brandLoaded: boolean, scriptLoaded = false): Fonts {
  const l = byCode(lang);
  const family = l?.fontFamily ?? 'brand';
  const spacing = !(l && (l.script === 'arab' || l.script === 'deva'));
  if (family !== 'brand') {
    const n = familyNames(family);
    if (!scriptLoaded || !n) return { display: undefined, body: undefined, bold: undefined, spacing };
    return { display: n.bold, body: n.regular, bold: n.bold, spacing };
  }
  if (!brandLoaded) return { display: SERIF_FALLBACK, body: undefined, bold: undefined, spacing };
  // в Prata нет части букв (турецкие ğ ş İ) — для таких языков заголовки жирным PT Sans
  return { display: l?.displayFromBody ? 'PTSans_700Bold' : 'Prata_400Regular', body: 'PTSans_400Regular', bold: 'PTSans_700Bold', spacing };
}

export const radius = { card: 16, btn: 12, chip: 999 };
export const TOUCH = 48;
export const MAX_W = 560;
