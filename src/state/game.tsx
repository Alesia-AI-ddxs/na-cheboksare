// Состояние игры: язык, режим, код, очки, пройденные точки, находки.
// Хранится только на устройстве (AsyncStorage). Никуда не отправляется.
// Язык: выбор письменного варианта и произношения хранит языковой модуль (src/i18n), здесь — связка с экранами.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager, Platform } from 'react-native';
import { content, DEFAULT_LANG, getPoint, getStage, Point, Stage, stagePoints } from '../content';
import {
  applyDirection,
  byCode,
  defaultVoice,
  formatNumber,
  isRtlLocale,
  loadSavedLocale,
  setLocale,
  t as tRaw,
  tOpt as tOptRaw,
} from '../i18n';
import { isScriptFontLoaded, loadFontFor } from '../i18n/fonts';
import { Fonts, fontsFor, light, Palette, usePalette } from '../theme';

const STORAGE_KEY = 'nacheboksare_app_v1';
const CODE_ABC = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const CODE_RE = /^ND-[2-9A-HJ-NP-Z]{4}$/;

export type Mode = 'here' | 'remote';
export type Progress = {
  lang: string;
  mode: Mode | null;
  code: string;
  started: boolean;
  score: number;
  done: number[]; // id пройденных точек
  found: string[]; // id находок
  finishedStages: number[];
  completedAt: Record<string, string>; // этап → дата завершения (ISO)
};

export function makeCode(): string {
  let out = 'ND-';
  for (let i = 0; i < 4; i++) out += CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)];
  return out;
}

function fresh(prev?: Partial<Progress>): Progress {
  return {
    lang: byCode(prev?.lang)?.code ?? DEFAULT_LANG,
    mode: prev?.mode ?? null,
    code: prev?.code && CODE_RE.test(prev.code) ? prev.code : makeCode(),
    started: false,
    score: 0,
    done: [],
    found: [],
    finishedStages: [],
    completedAt: {},
  };
}

export type PointStatus = 'done' | 'current' | 'ahead';

/** Стрелки и значки, которые в письме справа налево смотрят в другую сторону */
export type Dir = { back: string; fwd: string; expand: string; collapse: string; end: 'left' | 'right' };

type Vars = Record<string, string | number>;

type Ctx = {
  ready: boolean;
  p: Progress;
  pal: Palette;
  f: Fonts;
  /** письменный вариант (код из src/i18n/languages.ts) */
  lang: string;
  /** голосовой вариант (произношение) */
  voice: string;
  /** язык уже выбран (false — первый запуск: показываем экран выбора языка) */
  langChosen: boolean;
  /** интерфейс зеркальный (письмо справа налево) */
  isRTL: boolean;
  dir: Dir;
  t: (key: string, vars?: Vars) => string;
  tOpt: (key: string | null | undefined, vars?: Vars) => string | undefined;
  /** число средствами локали (арабские цифры для ar и т.п.) */
  num: (n: number) => string;
  /** сменить язык; true — на телефоне нужен перезапуск (смена направления письма) */
  setLang: (code: string, voice?: string) => Promise<boolean>;
  setMode: (m: Mode) => void;
  start: () => void;
  /** Засчитать точку. Возвращает id этапа, если этап только что завершён. */
  completePoint: (pointId: number, pts: number) => { stageFinished: number | null };
  reset: () => void;
  isStageUnlocked: (stageId: number) => boolean;
  pointStatus: (pointId: number) => PointStatus;
  currentStage: () => Stage | undefined;
};

const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children, fontsLoaded }: { children: React.ReactNode; fontsLoaded: boolean }) {
  const [ready, setReady] = useState(false);
  // До загрузки — нейтральное состояние без случайностей (одинаковое на сервере и в браузере).
  const [p, setP] = useState<Progress>(() => ({ ...fresh({ lang: DEFAULT_LANG }), code: 'ND-····' }));
  // Пока состояние не загружено, рисуем светлую тему — так первый кадр в браузере совпадает
  // с заранее собранной страницей (static export), а потом тема переключается по системе.
  const systemPal = usePalette();
  const pal = ready ? systemPal : light;
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [voice, setVoiceState] = useState(defaultVoice(DEFAULT_LANG));
  const [langChosen, setLangChosen] = useState(false);
  const [scriptFont, setScriptFont] = useState(true);

  // шрифт письма выбранного языка (китайский, деванагари, арабский) — только для него, по требованию
  useEffect(() => {
    let alive = true;
    if (isScriptFontLoaded(byCode(lang)?.fontFamily ?? 'brand')) {
      setScriptFont(true);
      return;
    }
    setScriptFont(false);
    loadFontFor(lang).then((ok) => {
      if (alive) setScriptFont(ok);
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  // загрузка сохранённого прогресса
  useEffect(() => {
    let alive = true;
    (async () => {
      let saved: Partial<Progress> | null = null;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          saved = JSON.parse(raw) as Partial<Progress>;
          const base = fresh(saved);
          if (alive)
            setP({
              ...base,
              started: !!saved.started,
              score: typeof saved.score === 'number' ? saved.score : 0,
              done: Array.isArray(saved.done) ? saved.done : [],
              found: Array.isArray(saved.found) ? saved.found : [],
              finishedStages: Array.isArray(saved.finishedStages) ? saved.finishedStages : [],
              completedAt: saved.completedAt ?? {},
            });
        } else if (alive) {
          setP(fresh());
        }
      } catch {
        if (alive) setP(fresh());
      }
      // язык: сохранённый выбор → язык из прогресса версии 1.0 → язык системы
      try {
        const loc = await loadSavedLocale(saved?.lang, !!saved?.started);
        if (alive) {
          setLangState(loc.locale);
          setVoiceState(loc.voice);
          setLangChosen(loc.chosen);
          setP((x) => ({ ...x, lang: loc.locale }));
          if (Platform.OS === 'web') applyDirection(loc.locale);
        }
      } catch {
        // остаёмся на русском
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // сохранение при каждом изменении
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p)).catch(() => undefined);
  }, [p, ready]);

  const setLang = useCallback(async (code: string, v?: string) => {
    const l = byCode(code);
    if (!l) return false;
    const needsRestart = await setLocale(l.code, v);
    setLangState(l.code);
    setVoiceState(v ?? defaultVoice(l.code));
    setLangChosen(true);
    setP((x) => ({ ...x, lang: l.code }));
    return needsRestart;
  }, []);

  // направление интерфейса: на телефоне — как его реально применила система (после перезапуска),
  // в браузере — сразу по языку
  const isRTL = Platform.OS === 'web' ? isRtlLocale(lang) : I18nManager.isRTL;
  const dir: Dir = isRTL
    ? { back: '→', fwd: '←', expand: '◂', collapse: '▾', end: 'left' }
    : { back: '←', fwd: '→', expand: '▸', collapse: '▾', end: 'right' };

  const isStageUnlockedFor = useCallback((prog: Progress, stageId: number) => {
    const idx = content.stages.findIndex((s) => s.id === stageId);
    if (idx <= 0) return true;
    return prog.finishedStages.includes(content.stages[idx - 1].id);
  }, []);

  const statusFor = useCallback(
    (prog: Progress, pointId: number): PointStatus => {
      if (prog.done.includes(pointId)) return 'done';
      const pt = getPoint(pointId);
      const st = pt ? getStage(pt.stage) : undefined;
      if (!pt || !st || !isStageUnlockedFor(prog, st.id)) return 'ahead';
      const first = stagePoints(st).find((x) => !prog.done.includes(x.id));
      return first && first.id === pointId ? 'current' : 'ahead';
    },
    [isStageUnlockedFor],
  );

  const completePoint = useCallback(
    (pointId: number, pts: number) => {
      let stageFinished: number | null = null;
      const pt = getPoint(pointId);
      if (!pt) return { stageFinished };
      // считаем синхронно от текущего состояния, чтобы вернуть результат
      const prog = p;
      if (prog.done.includes(pointId)) return { stageFinished };
      const done = [...prog.done, pointId];
      const found = [...prog.found];
      const add = (id: string | null | undefined) => {
        if (id && content.artifacts[id] && !found.includes(id)) found.push(id);
      };
      pt.artifacts.forEach(add);
      const st = getStage(pt.stage);
      const finishedStages = [...prog.finishedStages];
      const completedAt = { ...prog.completedAt };
      if (st && stagePoints(st).every((x) => done.includes(x.id)) && !finishedStages.includes(st.id)) {
        add(st.finishArtifact);
        stagePoints(st).forEach((x) => add(x.stageFinish ?? null));
        finishedStages.push(st.id);
        completedAt[String(st.id)] = new Date().toISOString();
        stageFinished = st.id;
      }
      setP({ ...prog, done, found, finishedStages, completedAt, score: prog.score + pts });
      return { stageFinished };
    },
    [p],
  );

  const value: Ctx = useMemo(
    () => ({
      ready,
      p,
      pal,
      f: fontsFor(lang, fontsLoaded && ready, scriptFont && ready),
      lang,
      voice,
      langChosen,
      isRTL,
      dir,
      t: (key, vars) => tRaw(key, lang, vars),
      tOpt: (key, vars) => tOptRaw(key, lang, vars),
      num: (n) => formatNumber(n, lang),
      setLang,
      setMode: (m) => setP((x) => ({ ...x, mode: m })),
      start: () => setP((x) => ({ ...x, started: true, mode: x.mode ?? 'remote' })),
      completePoint,
      reset: () => setP((x) => ({ ...fresh(x), lang: x.lang, mode: x.mode, code: x.code })),
      isStageUnlocked: (id) => isStageUnlockedFor(p, id),
      pointStatus: (id) => statusFor(p, id),
      currentStage: () => {
        const unlocked = content.stages.filter((s) => isStageUnlockedFor(p, s.id));
        return unlocked.find((s) => !p.finishedStages.includes(s.id)) ?? unlocked[unlocked.length - 1];
      },
    }),
    [ready, p, pal, lang, voice, langChosen, isRTL, scriptFont, fontsLoaded, completePoint, isStageUnlockedFor, statusFor, setLang],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): Ctx {
  const v = useContext(GameContext);
  if (!v) throw new Error('useGame вне GameProvider');
  return v;
}

export type { Point, Stage };
