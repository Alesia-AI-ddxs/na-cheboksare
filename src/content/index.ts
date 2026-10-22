// Единственный источник правды приложения — файл content.json рядом.
// Его собирает скрипт content_build.py из мастер-таблицы контента.
// Файл можно заменить целиком: код ничего не знает о конкретных номерах точек,
// всё берётся из JSON.
import raw from './content.json';

export type LangCode = string;
export type Localized = Record<LangCode, string>;

export type Language = { code: LangCode; name: string; ready: boolean };
export type Stage = { id: number; nameKey: string; points: number[]; finishArtifact: string | null };
export type Layer = 'doc' | 'sci' | 'leg';
export type Beat = { key: string; speaker: string; layer: Layer; era: string };
export type Quiz = { q: string; r: string; options: string[]; correct: number };
export type Point = {
  id: number;
  stage: number;
  scene: string;
  era: string;
  nameKey: string;
  beats: Beat[];
  legends: Beat[];
  quiz: Quiz | null;
  artifacts: string[];
  hintKey: string | null;
  todayKey: string | null;
  facts: (number | string)[];
  ready: boolean;
  missing: string[];
  stageFinish?: string | null;
};
export type TextEntry = {
  point: string;
  who: string;
  voice?: string;
  layer: string;
  source: string;
  status?: string;
  text: Localized;
};
export type LegendEntry = { point: string; who: string; layer: string; dispute: string; text: Localized };
export type Artifact = { id: string; kind: string; icon: string; nameKey: string; descKey: string };
export type Fact = {
  n: number | string;
  point: string;
  topic: string;
  year: string;
  text: string;
  layer: string;
  source: string;
  link: string;
};
export type Source = { n: number | string; title: string; gives: string; link: string; status: string; todo: string };

export type Content = {
  app?: string;
  contentVersion?: string;
  generatedFrom?: string;
  languages: Language[];
  stages: Stage[];
  points: Point[];
  texts: Record<string, TextEntry>;
  legends: Record<string, LegendEntry>;
  artifacts: Record<string, Artifact>;
  ui: Record<string, Localized>;
  facts: Fact[];
  sources: Source[];
  links: { setnerTelegram?: string; web?: string; webGame?: string };
};

// Мягкая нормализация: если в новой версии JSON какого-то раздела нет — подставляем пустой.
const c = raw as unknown as Partial<Content>;
export const content: Content = {
  app: c.app,
  contentVersion: c.contentVersion,
  generatedFrom: c.generatedFrom,
  languages: c.languages ?? [{ code: 'ru-RU', name: 'Русский', ready: true }],
  stages: c.stages ?? [],
  points: (c.points ?? []).map((p) => ({
    ...p,
    beats: p.beats ?? [],
    legends: p.legends ?? [],
    artifacts: p.artifacts ?? [],
    facts: p.facts ?? [],
    missing: p.missing ?? [],
    quiz: p.quiz ?? null,
    hintKey: p.hintKey ?? null,
    todayKey: p.todayKey ?? null,
  })),
  texts: c.texts ?? {},
  legends: c.legends ?? {},
  artifacts: c.artifacts ?? {},
  ui: c.ui ?? {},
  facts: c.facts ?? [],
  sources: c.sources ?? [],
  links: c.links ?? {},
};

export const DEFAULT_LANG = 'ru-RU';

export function getPoint(id: number): Point | undefined {
  return content.points.find((p) => p.id === id);
}

export function getStage(id: number): Stage | undefined {
  return content.stages.find((s) => s.id === id);
}

/** Точки этапа в порядке маршрута (порядок задаёт stages[].points). */
export function stagePoints(stage: Stage): Point[] {
  return stage.points.map((id) => getPoint(id)).filter((p): p is Point => !!p);
}

export function stageIndex(stageId: number): number {
  return content.stages.findIndex((s) => s.id === stageId);
}

export const artifactList: Artifact[] = Object.values(content.artifacts);
