/**
 * ЯЗЫКОВОЙ МОДУЛЬ «На Чебоксаре» — реестр языковых вариантов.
 * Единственный источник правды о языках в КОДЕ. Данные зеркалят лист «ЯЗЫКИ» мастер-таблицы
 * (код, эндоним, письмо, направление, шрифт, фолбэк, голоса). Статус текста («черновик») и тест-строка
 * берутся из таблицы генератором — locales/_meta.json, здесь их нет.
 * При расхождении главный — этот файл до этапа 2, потом таблица. npm run check сверяет коды с locales/,
 * а страны (regions) — с колонкой «Страны (ISO 3166-1)» листа ЯЗЫКИ (через locales/_meta.json).
 * ТЗ: ТУРИЗМ_APP_ТЗ_МУЛЬТИЯЗЫЧНОСТЬ v1.3 от 22.10.2026, разделы 3–4, 6, 8.
 * Пакет архитектора: ЯЗЫКОВОЙ_МОДУЛЬ_КАРКАС v0.2; адаптация под приложение 1.1.0.
 */

export type Script = 'cyrl' | 'latn' | 'hans' | 'hant' | 'deva' | 'arab';

/** Группа на экране выбора (без подписей — только разделитель, чтобы не держать строки в коде) */
export type Group = 'russia' | 'world' | 'china' | 'india' | 'arab';

export interface VoiceVariant {
  /** Код голосового варианта (BCP-47, как у поставщиков TTS) */
  code: string;
  /** Название для экрана выбора, на самом языке (эндоним) */
  endonym: string;
  /** Подсказка по-русски (служебная, в интерфейс не выводится) */
  nameRu: string;
  /** Откуда берём голос: 'elevenlabs' (клоны/премиум) | 'azure' | 'alibaba' | 'heygen' (видео) | 'narrator' (живой диктор) | 'tbd' */
  source: 'elevenlabs' | 'azure' | 'alibaba' | 'heygen' | 'narrator' | 'tbd';
}

/**
 * Фирменные голоса проекта — клоны ElevenLabs (ТЗ v1.3, раздел 7.0, уровень 1).
 * id — ключ в манифесте озвучки: manifest.voices["<id>@<код голосового варианта>"].
 */
export const BRAND_VOICES = [
  { id: 'aleksandr', nameRu: 'Александр Суслин — проводник-рассказчик квеста', source: 'elevenlabs' },
  { id: 'olesya', nameRu: 'Олеся Суслина — голос интерфейса и женских персонажей', source: 'elevenlabs' },
  { id: 'mulyaev', nameRu: 'Муляев — медицинский туризм и медицинские сюжеты', source: 'elevenlabs' },
] as const;
export type BrandVoiceId = (typeof BRAND_VOICES)[number]['id'];

/**
 * Шрифты (ТЗ р.6). Латиница и кириллица — фирменная пара приложения: Prata (заголовки) + PT Sans (текст);
 * PT Sans покрывает все буквы языков России, турецкого, немецкого, французского, испанского (проверено
 * по таблице символов шрифта, 22.10.2026). Остальные письма — Noto из npm (@expo-google-fonts/*),
 * грузятся ТОЛЬКО для выбранного языка (src/i18n/fonts.ts).
 */
export type FontFamily = 'brand' | 'NotoSansSC' | 'NotoSansTC' | 'NotoSansHK' | 'NotoSansDevanagari' | 'NotoNaskhArabic';

export interface LanguageVariant {
  /** Код письменного варианта — ключ файла locales/<code>.json и колонки таблицы */
  code: string;
  /** Название на самом языке — ТОЛЬКО оно показывается первым на экране выбора (без флагов!) */
  endonym: string;
  /** Название по-русски (служебное: подсказка в русском интерфейсе, если система не знает имени языка) */
  nameRu: string;
  script: Script;
  rtl: boolean;
  group: Group;
  fontFamily: FontFamily;
  /** В Prata нет нужных букв (турецкие ğ ş İ) — заголовки рисуем жирным PT Sans */
  displayFromBody?: boolean;
  /** Цепочка подстраховки (закон 6 ТЗ): точный вариант → старший → en-GB → ru-RU */
  fallback: string[];
  /** Голосовые варианты поверх этого письменного (закон 2 ТЗ); первый — по умолчанию */
  voices: VoiceVariant[];
  /**
   * Пакет строк вшит в сборку (true) или скачивается (false). Сейчас вшиты ВСЕ 22 пакета:
   * тексты лёгкие (≈0,3 МБ на все языки вместе). Скачиваемые пакеты — разъём на будущее
   * (app.json → extra.langPackBaseUrl), тяжёлые китайские шрифты в веб-версии и так грузятся по требованию.
   */
  bundled: boolean;
  /**
   * Страны (ISO 3166-1 alpha-2), где этот вариант естественно предложить гостю — зеркало колонки «Страны (ISO 3166-1)»
   * листа ЯЗЫКИ (решение владельца 22.10.2026; npm run check сверяет с таблицей). Страну приложение берёт только из
   * настроек телефона (expo-localization → regionCode): без геолокации, без сети, без разрешений.
   */
  regions: string[];
}

export const DEFAULT_LOCALE = 'ru-RU';

export const LANGUAGES: LanguageVariant[] = [
  // ───── Россия и Поволжье ─────
  { code: 'ru-RU', endonym: 'Русский', nameRu: 'русский', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: [], bundled: true,
    regions: ['RU', 'BY', 'KZ', 'KG'],
    voices: [{ code: 'ru-RU', endonym: 'Русский', nameRu: 'русский', source: 'azure' }] },
  { code: 'cv', endonym: 'Чӑвашла', nameRu: 'чувашский', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['ru-RU'], bundled: true,
    regions: ['RU'],
    // В API Яндекс SpeechKit чувашского НЕТ (проверено 22.10.2026) — диктор или договорённость
    voices: [{ code: 'cv', endonym: 'Чӑвашла', nameRu: 'чувашский', source: 'narrator' }] },
  { code: 'tt', endonym: 'Татарча', nameRu: 'татарский', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['ru-RU'], bundled: true,
    regions: ['RU'],
    voices: [{ code: 'tt', endonym: 'Татарча', nameRu: 'татарский', source: 'narrator' }] },
  { code: 'ba', endonym: 'Башҡортса', nameRu: 'башкирский', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['ru-RU'], bundled: true,
    regions: ['RU'],
    voices: [{ code: 'ba', endonym: 'Башҡортса', nameRu: 'башкирский', source: 'narrator' }] },
  // Мокшанский и эрзянский — два разных языка (закон 3 ТЗ)
  { code: 'mdf', endonym: 'Мокшень кяль', nameRu: 'мокшанский', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['ru-RU'], bundled: true,
    regions: ['RU'],
    voices: [{ code: 'mdf', endonym: 'Мокшень', nameRu: 'мокшанский', source: 'narrator' }] },
  { code: 'myv', endonym: 'Эрзянь кель', nameRu: 'эрзянский', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['ru-RU'], bundled: true,
    regions: ['RU'],
    voices: [{ code: 'myv', endonym: 'Эрзянь', nameRu: 'эрзянский', source: 'narrator' }] },
  { code: 'mhr', endonym: 'Марий йылме', nameRu: 'марийский (луговой)', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['ru-RU'], bundled: true,
    regions: ['RU'],
    voices: [{ code: 'mhr', endonym: 'Марий', nameRu: 'луговой марийский', source: 'narrator' }] },
  { code: 'mrj', endonym: 'Кырык мары йӹлмӹ', nameRu: 'марийский (горный)', script: 'cyrl', rtl: false, group: 'russia',
    fontFamily: 'brand', fallback: ['mhr', 'ru-RU'], bundled: true,
    regions: ['RU'],
    voices: [{ code: 'mrj', endonym: 'Кырык мары', nameRu: 'горномарийский', source: 'narrator' }] },

  // ───── Европа и мир ─────
  { code: 'en-GB', endonym: 'English (UK)', nameRu: 'английский — Британия', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', fallback: ['en-US', 'ru-RU'], bundled: true,
    regions: ['GB', 'IE', 'AU', 'NZ'],
    voices: [
      { code: 'en-GB', endonym: 'British', nameRu: 'британский', source: 'azure' },
      { code: 'en-IE', endonym: 'Irish', nameRu: 'ирландский', source: 'azure' },
      { code: 'en-IN', endonym: 'Indian English', nameRu: 'индийский английский', source: 'azure' },
    ] },
  { code: 'en-US', endonym: 'English (US)', nameRu: 'английский — США', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['US', 'CA'],
    voices: [{ code: 'en-US', endonym: 'American', nameRu: 'американский', source: 'azure' }] },
  { code: 'de-DE', endonym: 'Deutsch', nameRu: 'немецкий', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['DE', 'AT', 'CH', 'LI'],
    voices: [
      { code: 'de-DE', endonym: 'Deutschland', nameRu: 'Германия', source: 'azure' },
      { code: 'de-AT', endonym: 'Österreich', nameRu: 'Австрия', source: 'azure' },
      { code: 'de-CH', endonym: 'Schweiz', nameRu: 'Швейцария', source: 'azure' },
    ] },
  { code: 'fr-FR', endonym: 'Français', nameRu: 'французский', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['FR', 'BE', 'CH', 'LU', 'MC'],
    voices: [
      { code: 'fr-FR', endonym: 'France', nameRu: 'Франция', source: 'azure' },
      { code: 'fr-CA', endonym: 'Québec', nameRu: 'Канада', source: 'azure' },
    ] },
  { code: 'es-ES', endonym: 'Español (España)', nameRu: 'испанский — Испания', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', fallback: ['es-419', 'en-GB', 'ru-RU'], bundled: true,
    regions: ['ES'],
    voices: [{ code: 'es-ES', endonym: 'España', nameRu: 'Испания', source: 'azure' }] },
  { code: 'es-419', endonym: 'Español (Latinoamérica)', nameRu: 'испанский — Лат. Америка', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', fallback: ['es-ES', 'en-GB', 'ru-RU'], bundled: true,
    regions: ['MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY'],
    voices: [{ code: 'es-MX', endonym: 'México', nameRu: 'Мексика', source: 'azure' }] },
  { code: 'tr-TR', endonym: 'Türkçe', nameRu: 'турецкий', script: 'latn', rtl: false, group: 'world',
    fontFamily: 'brand', displayFromBody: true, fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['TR', 'CY'],
    voices: [{ code: 'tr-TR', endonym: 'Türkçe', nameRu: 'турецкий', source: 'azure' }] },
  { code: 'fa-IR', endonym: 'فارسی', nameRu: 'фарси', script: 'arab', rtl: true, group: 'world',
    fontFamily: 'NotoNaskhArabic', fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['IR', 'AF', 'TJ'],
    voices: [{ code: 'fa-IR', endonym: 'فارسی', nameRu: 'фарси', source: 'azure' }] },

  // ───── Китай (три письменных варианта — решение заказчика 22.10.2026) ─────
  { code: 'zh-Hans', endonym: '中文（简体）', nameRu: 'китайский — упрощённое письмо', script: 'hans', rtl: false, group: 'china',
    fontFamily: 'NotoSansSC', fallback: ['zh-Hant', 'en-GB', 'ru-RU'], bundled: true,
    regions: ['CN', 'SG'],
    voices: [
      { code: 'zh-CN', endonym: '普通话', nameRu: 'путунхуа', source: 'azure' },
      { code: 'yue-CN', endonym: '粤语', nameRu: 'кантонский (Гуандун)', source: 'azure' },
      { code: 'wuu-CN', endonym: '吴语（上海）', nameRu: 'у / шанхайский', source: 'azure' },
      { code: 'zh-CN-sichuan', endonym: '四川话', nameRu: 'сычуаньский', source: 'azure' },
      { code: 'zh-CN-shandong', endonym: '山东话', nameRu: 'шаньдунский', source: 'azure' },
      { code: 'zh-CN-henan', endonym: '河南话', nameRu: 'хэнаньский', source: 'azure' },
      { code: 'zh-CN-liaoning', endonym: '东北话（辽宁）', nameRu: 'ляонинский', source: 'azure' },
      { code: 'zh-CN-shaanxi', endonym: '陕西话', nameRu: 'шэньсийский', source: 'azure' },
      { code: 'zh-CN-guangxi', endonym: '广西口音', nameRu: 'гуансийский акцент', source: 'azure' },
    ] },
  { code: 'zh-Hant', endonym: '中文（繁體）', nameRu: 'китайский — традиционное письмо', script: 'hant', rtl: false, group: 'china',
    fontFamily: 'NotoSansTC', fallback: ['zh-Hans', 'en-GB', 'ru-RU'], bundled: true,
    regions: ['TW'],
    voices: [{ code: 'zh-TW', endonym: '臺灣國語', nameRu: 'тайваньский мандарин', source: 'azure' }] },
  { code: 'yue-Hant', endonym: '粵語（繁體）', nameRu: 'кантонский письменный (Гонконг)', script: 'hant', rtl: false, group: 'china',
    fontFamily: 'NotoSansHK', fallback: ['zh-Hant', 'zh-Hans', 'en-GB', 'ru-RU'], bundled: true,
    regions: ['HK', 'MO'],
    voices: [{ code: 'zh-HK', endonym: '廣東話（香港）', nameRu: 'кантонский (Гонконг)', source: 'azure' }] },

  // ───── Индия ─────
  { code: 'hi-IN', endonym: 'हिन्दी', nameRu: 'хинди', script: 'deva', rtl: false, group: 'india',
    fontFamily: 'NotoSansDevanagari', fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['IN'],
    voices: [{ code: 'hi-IN', endonym: 'हिन्दी', nameRu: 'хинди', source: 'azure' }] },
  { code: 'mr-IN', endonym: 'मराठी', nameRu: 'маратхи', script: 'deva', rtl: false, group: 'india',
    fontFamily: 'NotoSansDevanagari', fallback: ['hi-IN', 'en-GB', 'ru-RU'], bundled: true,
    regions: ['IN'],
    voices: [{ code: 'mr-IN', endonym: 'मराठी', nameRu: 'маратхи', source: 'azure' }] },

  // ───── Арабский мир (письмо одно — MSA; голоса по странам) ─────
  { code: 'ar', endonym: 'العربية', nameRu: 'арабский', script: 'arab', rtl: true, group: 'arab',
    fontFamily: 'NotoNaskhArabic', fallback: ['en-GB', 'ru-RU'], bundled: true,
    regions: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'SY', 'IQ', 'YE', 'PS', 'LY', 'TN', 'DZ', 'MA', 'SD'],
    voices: [
      { code: 'ar-SA', endonym: 'السعودية', nameRu: 'Саудовская Аравия', source: 'azure' },
      { code: 'ar-EG', endonym: 'مصر', nameRu: 'Египет', source: 'azure' },
      { code: 'ar-AE', endonym: 'الإمارات', nameRu: 'ОАЭ', source: 'azure' },
      { code: 'ar-MA', endonym: 'المغرب', nameRu: 'Марокко', source: 'azure' },
      { code: 'ar-IQ', endonym: 'العراق', nameRu: 'Ирак', source: 'azure' },
      { code: 'ar-JO', endonym: 'الأردن', nameRu: 'Иордания', source: 'azure' },
      { code: 'ar-KW', endonym: 'الكويت', nameRu: 'Кувейт', source: 'azure' },
      { code: 'ar-LB', endonym: 'لبنان', nameRu: 'Ливан', source: 'azure' },
      { code: 'ar-QA', endonym: 'قطر', nameRu: 'Катар', source: 'azure' },
      { code: 'ar-SY', endonym: 'سوريا', nameRu: 'Сирия', source: 'azure' },
      { code: 'ar-TN', endonym: 'تونس', nameRu: 'Тунис', source: 'azure' },
      { code: 'ar-DZ', endonym: 'الجزائر', nameRu: 'Алжир', source: 'azure' },
      { code: 'ar-LY', endonym: 'ليبيا', nameRu: 'Ливия', source: 'azure' },
      { code: 'ar-OM', endonym: 'عمان', nameRu: 'Оман', source: 'azure' },
      { code: 'ar-BH', endonym: 'البحرين', nameRu: 'Бахрейн', source: 'azure' },
      { code: 'ar-PS', endonym: 'فلسطين', nameRu: 'Палестина', source: 'azure' },
      { code: 'ar-YE', endonym: 'اليمن', nameRu: 'Йемен', source: 'azure' },
    ] },
];

/** Старые коды (сохранённые версией 1.0) → коды реестра */
export const CODE_ALIASES: Record<string, string> = { 'tt-RU': 'tt', fa: 'fa-IR' };

export const byCode = (code: string | null | undefined): LanguageVariant | undefined => {
  if (!code) return undefined;
  const c = CODE_ALIASES[code] ?? code;
  return LANGUAGES.find((l) => l.code === c);
};

/** Полная цепочка фолбэка для локали: сама → её fallback → ru-RU */
export function fallbackChain(code: string): string[] {
  const l = byCode(code);
  const chain = [l?.code ?? code, ...(l?.fallback ?? [])];
  if (!chain.includes(DEFAULT_LOCALE)) chain.push(DEFAULT_LOCALE);
  return [...new Set(chain)];
}

/** Голос по умолчанию для письменного варианта (первый в списке) */
export function defaultVoice(code: string): string {
  const l = byCode(code);
  return l?.voices[0]?.code ?? l?.code ?? code;
}

/** Варианты, которые естественно предложить в стране (по коду ISO 3166-1), в порядке реестра */
export function variantsForRegion(region: string | null | undefined): LanguageVariant[] {
  const r = (region ?? '').toUpperCase();
  if (!r) return [];
  return LANGUAGES.filter((l) => l.regions.includes(r));
}
