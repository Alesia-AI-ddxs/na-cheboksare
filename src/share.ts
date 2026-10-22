// Поделиться и открыть ссылку. Сеть приложению не нужна: ссылки открывает система (браузер/Telegram).
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

export async function shareText(message: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (Platform.OS === 'web') {
      const nav = (globalThis as { navigator?: { share?: (d: { text: string }) => Promise<void> } }).navigator;
      if (nav?.share) {
        await nav.share({ text: message });
        return 'shared';
      }
      await Clipboard.setStringAsync(message);
      return 'copied';
    }
    await Share.share({ message });
    return 'shared';
  } catch {
    try {
      await Clipboard.setStringAsync(message);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}

export function openUrl(url?: string) {
  if (!url) return;
  Linking.openURL(url).catch(() => undefined);
}

/**
 * Ссылка на бота Сетнера с кодом прохождения (бот увидит код в /start) и выбранным языком:
 * lang — письменный вариант (ru-RU, en-GB, ar…), voice — голосовой (en-IE, ar-EG…), ТЗ мультиязычности р.8.
 * ВАЖНО для бота: Telegram передаёт боту только параметр start; lang/voice видны в ссылке (и веб-версии бота),
 * а чтобы бот получил их в /start, нужна договорённость о формате start (см. отчёт этапа 1).
 */
export function setnerLink(base: string | undefined, code: string, lang?: string, voice?: string): string | undefined {
  if (!base) return undefined;
  const sep = base.includes('?') ? '&' : '?';
  let url = `${base}${sep}start=${encodeURIComponent(code)}`;
  if (lang) url += `&lang=${encodeURIComponent(lang)}`;
  if (voice) url += `&voice=${encodeURIComponent(voice)}`;
  return url;
}
