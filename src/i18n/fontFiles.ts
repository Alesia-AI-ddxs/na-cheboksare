// СОЗДАНО АВТОМАТИЧЕСКИ: tools/font_subset.py (вызывается из tools/content_build.py). Руками не править.
// Подмножества шрифтов письменностей: в файле только буквы из строк мастер-таблицы (+ цифры, латиница, знаки).
// Письма без переведённых языков (сейчас — традиционный китайский и кантонский) сюда не попадают.
/* eslint-disable @typescript-eslint/no-require-imports */
export const SUBSET_FONTS: Record<string, Record<string, number>> = {
  NotoSansSC: { NotoSansSC: require('../../assets/fonts/subset/NotoSansSC.ttf') },
  NotoSansDevanagari: { NotoSansDevanagari: require('../../assets/fonts/subset/NotoSansDevanagari.ttf'), NotoSansDevanagari_Bold: require('../../assets/fonts/subset/NotoSansDevanagari_Bold.ttf') },
  NotoNaskhArabic: { NotoNaskhArabic: require('../../assets/fonts/subset/NotoNaskhArabic.ttf'), NotoNaskhArabic_Bold: require('../../assets/fonts/subset/NotoNaskhArabic_Bold.ttf') },
};
