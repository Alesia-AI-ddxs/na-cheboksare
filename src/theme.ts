// Цвета и шрифты — перенесены из CSS веб-прототипа игры (turizm/igra/index.html).
import { Platform, useColorScheme } from 'react-native';

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

// Шрифты: Prata — заголовки, PT Sans — основной текст (подключены офлайн через expo-font).
// Для китайского и хинди у этих шрифтов нет знаков — там берём системный шрифт.
const SYSTEM_SCRIPT_LANGS = ['zh-Hans', 'hi-IN'];
const SERIF_FALLBACK = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });

export type Fonts = { display?: string; body?: string; bold?: string };
export function fontsFor(lang: string, loaded: boolean): Fonts {
  if (SYSTEM_SCRIPT_LANGS.includes(lang)) return { display: undefined, body: undefined, bold: undefined };
  if (!loaded) return { display: SERIF_FALLBACK, body: undefined, bold: undefined };
  return { display: 'Prata_400Regular', body: 'PTSans_400Regular', bold: 'PTSans_700Bold' };
}

export const radius = { card: 16, btn: 12, chip: 999 };
export const TOUCH = 48;
export const MAX_W = 560;
