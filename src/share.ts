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

// Ссылка на бота Сетнера строится только в src/setnerLink.ts (формат start=<код>_<язык>[_<голос>]).
