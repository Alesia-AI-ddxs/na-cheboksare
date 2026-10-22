// Подлинные портреты рассказчиков. ПРАВИЛО ПРОЕКТА: никаких выдуманных лиц.
// Единственное разрешённое изображение — гравюра с Адамом Олеарием (1669, общественное достояние).
// Остальные рассказчики получают абстрактный значок (SpeakerIcon).
import type { ImageSourcePropType } from 'react-native';

export const PORTRAITS: Record<string, ImageSourcePropType> = {
  'spk.olearius': require('../assets/images/olearius_1669.jpg'),
};
