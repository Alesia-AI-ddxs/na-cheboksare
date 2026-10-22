/**
 * ЯЗЫКОВОЙ МОДУЛЬ — голосовой слой (ТЗ v1.3, раздел 7). Сейчас звука нет; это готовый «разъём»:
 * как только появляются файлы audio/<голос>/<ID>.mp3 и запись в манифесте, кнопка «Послушать» оживает сама.
 *
 * Где лежит манифест: assets/audio/manifest.json (вшит в сборку; сейчас пустой — кнопок нет).
 * Где лежат файлы: <extra.langPackBaseUrl>/audio/<ключ голоса>/<ID строки>.mp3
 *   ключ голоса — код голосового варианта ("yue-CN") или фирменный голос на языке: "<brandId>@<код>"
 *   ("aleksandr@en-GB" → audio/aleksandr@en-GB/T06_EFREMOV_NARR.mp3).
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import manifestJson from '../../assets/audio/manifest.json';
import { byCode, fallbackChain, type BrandVoiceId } from './languages';

export interface AudioManifest {
  version: string; // версия озвучки, напр. "2026.11"
  voices: Record<
    string,
    {
      ids: string[];
      narrator?: string; // диктор или имя голоса движка (напр. "yue-CN-XiaoMinNeural")
      source: 'elevenlabs' | 'azure' | 'alibaba' | 'heygen' | 'narrator';
      approvedBy?: string; // кто подтвердил звучание: носитель; для клона — и владелец голоса (ТЗ 7.0)
    }
  >;
}

export const AUDIO_MANIFEST = manifestJson as AudioManifest;

/**
 * Цепочка голосового фолбэка. Фирменный голос (brandId) — первый приоритет:
 * aleksandr@yue-CN → aleksandr@<старшие> → обычный голос наречия → старшие голоса.
 */
export function voiceFallbackChain(voiceCode: string, writtenCode: string, brandId?: string): string[] {
  const chain: string[] = [];
  if (brandId) {
    chain.push(`${brandId}@${voiceCode}`);
    for (const written of fallbackChain(writtenCode)) {
      for (const v of byCode(written)?.voices ?? []) {
        const key = `${brandId}@${v.code}`;
        if (!chain.includes(key)) chain.push(key);
      }
    }
  }
  if (!chain.includes(voiceCode)) chain.push(voiceCode);
  for (const written of fallbackChain(writtenCode)) {
    for (const v of byCode(written)?.voices ?? []) if (!chain.includes(v.code)) chain.push(v.code);
  }
  return chain;
}

/**
 * Где лежит звук для строки stringId при выбранных голосе и письме.
 * null = звука нет нигде по цепочке → кнопку «Послушать» не показываем.
 */
export function resolveAudio(
  manifest: AudioManifest | null,
  stringId: string,
  voiceCode: string,
  writtenCode: string,
  baseUrl: string,
  brandId?: BrandVoiceId, // фирменный голос сцены: 'aleksandr' | 'olesya' | 'mulyaev' (ТЗ 7.0)
): { url: string; voice: string } | null {
  if (!manifest) return null;
  for (const v of voiceFallbackChain(voiceCode, writtenCode, brandId)) {
    if (manifest.voices[v]?.ids.includes(stringId)) {
      return { url: `${baseUrl}/audio/${v}/${stringId}.mp3`, voice: v };
    }
  }
  return null;
}

export function audioBaseUrl(): string {
  return String(Constants.expoConfig?.extra?.langPackBaseUrl ?? '').replace(/\/+$/, '');
}

/**
 * Проиграть звук. Веб — штатный HTMLAudioElement. Телефон — подключается на этапе 3 (expo-audio);
 * до этого canPlayAudio() = false и кнопка на телефоне не показывается.
 */
export function canPlayAudio(): boolean {
  return Platform.OS === 'web' && typeof Audio !== 'undefined';
}
export function playAudio(url: string): void {
  if (!canPlayAudio()) return;
  try {
    void new Audio(url).play().catch(() => undefined);
  } catch {
    // нет звука — молча (текст на экране остаётся)
  }
}
