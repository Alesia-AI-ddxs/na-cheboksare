// Состояние игры: язык, режим, код, очки, пройденные точки, находки.
// Хранится только на устройстве (AsyncStorage). Никуда не отправляется.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { content, DEFAULT_LANG, getPoint, getStage, Point, Stage, stagePoints } from '../content';
import { guessDeviceLang, t as tRaw, tOpt as tOptRaw } from '../i18n';
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
    lang: prev?.lang ?? guessDeviceLang(),
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

type Ctx = {
  ready: boolean;
  p: Progress;
  pal: Palette;
  f: Fonts;
  lang: string;
  t: (key: string, lastResort?: string) => string;
  tOpt: (key: string | null | undefined) => string | undefined;
  setLang: (code: string) => void;
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

  // загрузка сохранённого прогресса
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Progress>;
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

  const lang = p.lang;

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
      f: fontsFor(lang, fontsLoaded && ready),
      lang,
      t: (key, lastResort) => tRaw(key, lang, lastResort),
      tOpt: (key) => tOptRaw(key, lang),
      setLang: (code) => setP((x) => ({ ...x, lang: code })),
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
    [ready, p, pal, lang, fontsLoaded, completePoint, isStageUnlockedFor, statusFor],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): Ctx {
  const v = useContext(GameContext);
  if (!v) throw new Error('useGame вне GameProvider');
  return v;
}

export type { Point, Stage };
