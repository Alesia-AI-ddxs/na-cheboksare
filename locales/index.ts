// СОЗДАНО АВТОМАТИЧЕСКИ: tools/content_build.py из листа ЯЗЫКИ мастер-таблицы. Руками не править.
// Источник: КОНТЕНТ_На_Чебоксаре_v2.8_2026-10-22.xlsx
import L_ru_RU from './ru-RU.json';
import L_cv from './cv.json';
import L_mdf from './mdf.json';
import L_myv from './myv.json';
import L_mhr from './mhr.json';
import L_mrj from './mrj.json';
import L_tt from './tt.json';
import L_ba from './ba.json';
import L_en_US from './en-US.json';
import L_en_GB from './en-GB.json';
import L_de_DE from './de-DE.json';
import L_fr_FR from './fr-FR.json';
import L_es_ES from './es-ES.json';
import L_es_419 from './es-419.json';
import L_tr_TR from './tr-TR.json';
import L_fa_IR from './fa-IR.json';
import L_zh_Hans from './zh-Hans.json';
import L_zh_Hant from './zh-Hant.json';
import L_yue_Hant from './yue-Hant.json';
import L_hi_IN from './hi-IN.json';
import L_mr_IN from './mr-IN.json';
import L_ar from './ar.json';
import META from './_meta.json';

export type LocaleMeta = { status: string; strings: number; rtl: boolean; testString: string; regions: string[] };
export const LOCALE_META = META as {
  generatedFrom: string;
  contentVersion: string;
  contentVersionNumber: string;
  contentDate: string;
  total: number;
  variants: Record<string, LocaleMeta>;
  names: Record<string, Record<string, string>>;
};

/** Пакеты строк, вшитые в сборку: код письменного варианта → { ID строки: текст } */
export const BUNDLED_LOCALES: Record<string, Record<string, string>> = {
  'ru-RU': L_ru_RU,
  'cv': L_cv,
  'mdf': L_mdf,
  'myv': L_myv,
  'mhr': L_mhr,
  'mrj': L_mrj,
  'tt': L_tt,
  'ba': L_ba,
  'en-US': L_en_US,
  'en-GB': L_en_GB,
  'de-DE': L_de_DE,
  'fr-FR': L_fr_FR,
  'es-ES': L_es_ES,
  'es-419': L_es_419,
  'tr-TR': L_tr_TR,
  'fa-IR': L_fa_IR,
  'zh-Hans': L_zh_Hans,
  'zh-Hant': L_zh_Hant,
  'yue-Hant': L_yue_Hant,
  'hi-IN': L_hi_IN,
  'mr-IN': L_mr_IN,
  'ar': L_ar,
};
