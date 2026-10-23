// «Лаборатория замеров»: сведения об устройстве. Без сети и без разрешений.
// Имя устройства (Device.deviceName — бывает «Телефон Александра») НЕ берём: в отчёте только модель и цифры.
// Где API нет (в браузере — свободное место, иногда ОЗУ и модель) — null, на экране «нет данных».
import * as Device from 'expo-device';
import { Paths } from 'expo-file-system';
import * as Localization from 'expo-localization';
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { phoneRegion } from '../i18n';
import type { DeviceInfo } from './report';

const MB = 1024 * 1024;
const mb = (bytes: number | null | undefined): number | null =>
  typeof bytes === 'number' && Number.isFinite(bytes) && bytes > 0 ? Math.round(bytes / MB) : null;

export function collectDeviceInfo(): DeviceInfo {
  const win = Dimensions.get('window');
  let diskFree: number | null = null;
  let diskTotal: number | null = null;
  if (Platform.OS !== 'web') {
    try {
      diskFree = mb(Paths.availableDiskSpace);
      diskTotal = mb(Paths.totalDiskSpace);
    } catch {
      // нет данных
    }
  }
  let loc: Localization.Locale | undefined;
  try {
    loc = Localization.getLocales()[0];
  } catch {
    loc = undefined;
  }
  const nav = (globalThis as { navigator?: { hardwareConcurrency?: number } }).navigator;
  const osName = Device.osName || (Platform.OS === 'web' ? null : Platform.OS);
  return {
    platform: Platform.OS,
    manufacturer: Device.manufacturer || null,
    model: Device.modelName || null,
    os: osName ? `${osName}${Device.osVersion ? ' ' + Device.osVersion : ''}` : null,
    apiLevel: Device.platformApiLevel ?? null,
    ramMb: mb(Device.totalMemory),
    yearClass: Device.deviceYearClass ?? null,
    cpuArch: Device.supportedCpuArchitectures?.join(',') || null,
    cpuCores: Platform.OS === 'web' && typeof nav?.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
    diskFreeMb: diskFree,
    diskTotalMb: diskTotal,
    screenDp: { w: win.width, h: win.height },
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    phoneLocale: loc?.languageTag ?? null,
    phoneRegion: phoneRegion() ?? null,
  };
}
