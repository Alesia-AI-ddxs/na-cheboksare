// «Лаборатория замеров»: расчёт кадров в секунду, итог go/no-go и текст отчёта.
// Чистые функции без React Native — их проверяет npm run qa:lab (scripts/lab-check.mjs) на подставных цифрах.
// Отчёт — только модель телефона и цифры (без имени устройства, без аккаунтов); нигде не хранится, кроме экрана.
import { LAB_THRESHOLDS } from './thresholds';

export type FpsStats = {
  /** средний кадр/с за ступень (после разгона) */
  avg: number;
  /** самая медленная полная секунда (кадров за секунду) */
  min: number;
  /** доля «тяжёлых» кадров (> 33 мс), % */
  heavyPct: number;
  frames: number;
  seconds: number;
};

/**
 * Кадры в секунду по меткам времени кадров (мс, по возрастанию).
 * warmupMs — первые миллисекунды не считаем (разгон). min — по полным секундам (если полных нет — = avg).
 */
export function fpsStats(ts: number[], warmupMs = 0, heavyMs: number = LAB_THRESHOLDS.heavyFrameMs): FpsStats | null {
  if (ts.length < 3) return null;
  const start = ts[0] + warmupMs;
  const xs = ts.filter((t) => t >= start);
  if (xs.length < 3) return null;
  const span = xs[xs.length - 1] - xs[0];
  if (!(span > 0)) return null;
  const avg = ((xs.length - 1) * 1000) / span;
  let heavy = 0;
  // длительность кадра сравниваем в целых мс: ровные 30 к/с (33,3 мс) — «33 мс», не тяжёлый; 34 мс и дольше — тяжёлый
  for (let i = 1; i < xs.length; i++) if (Math.round(xs[i] - xs[i - 1]) > heavyMs) heavy++;
  const full = Math.floor(span / 1000);
  let min = avg;
  if (full >= 1) {
    min = Infinity;
    for (let k = 0; k < full; k++) {
      const a = xs[0] + k * 1000;
      const b = a + 1000;
      let n = 0;
      for (let i = 1; i < xs.length; i++) if (xs[i] > a && xs[i] <= b) n++;
      min = Math.min(min, n);
    }
  }
  return { avg: round1(avg), min: round1(min), heavyPct: round1((100 * heavy) / (xs.length - 1)), frames: xs.length, seconds: round1(span / 1000) };
}

export type Verdict = 'green' | 'yellow' | 'red' | 'none';

/** Итог по правилу владельца (пороги — src/lab/thresholds.ts). Нет замера ступени 1 — 'none'. */
export function verdict(stage1Avg: number | null | undefined, stage2Avg: number | null | undefined): Verdict {
  const T = LAB_THRESHOLDS;
  if (typeof stage1Avg !== 'number' || !Number.isFinite(stage1Avg)) return 'none';
  const s2 = typeof stage2Avg === 'number' && Number.isFinite(stage2Avg) ? stage2Avg : null;
  if (stage1Avg >= T.greenStage1Fps && s2 !== null && s2 >= T.greenStage2Fps) return 'green';
  if (stage1Avg >= T.yellowStage1Fps) return 'yellow';
  return 'red';
}

export type DeviceInfo = {
  platform: string;
  manufacturer: string | null;
  model: string | null;
  os: string | null;
  apiLevel: number | null;
  ramMb: number | null;
  yearClass: number | null;
  cpuArch: string | null;
  cpuCores: number | null;
  diskFreeMb: number | null;
  diskTotalMb: number | null;
  screenDp: { w: number; h: number } | null;
  pixelRatio: number | null;
  fontScale: number | null;
  phoneLocale: string | null;
  phoneRegion: string | null;
};

export type Stage3D = {
  objects: number;
  triangles: number;
  stats: FpsStats | null;
  firstFrameMs: number | null;
  glErrors: number;
};

export type Result3D = {
  available: boolean;
  renderer: string | null;
  glVersion: string | null;
  canvasPx: { w: number; h: number } | null;
  textureSize: number;
  trianglesPerObject: number;
  setupMs: number | null;
  /** ошибки подготовки (шейдеры, текстура) + сообщение первой ошибки */
  setupErrors: number;
  errorText: string | null;
  stages: Stage3D[];
};

export type Result2D = { elements: number; stats: FpsStats | null };

export type LabData = {
  appVersion: string;
  contentVersion: string;
  appLang: string;
  device: DeviceInfo;
  start: { jsToScreenMs: number | null; originToScreenMs: number | null };
  r2d: Result2D | null;
  r3d: Result3D | null;
};

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const v = (x: unknown): string => {
  if (x === null || x === undefined || x === '') return '-';
  if (typeof x === 'number') return Number.isFinite(x) ? String(round1(x)) : '-';
  return String(x).replace(/[\r\n]+/g, ' ').trim() || '-';
};

/** Дата отчёта ГГГГ-ММ-ДД (по часам телефона) */
export function reportDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Итог по данным лаборатории (ступени 1 и 2 — первые две ступени 3D) */
export function labVerdict(d: Pick<LabData, 'r3d'>): Verdict {
  const st = d.r3d?.available ? d.r3d.stages : [];
  return verdict(st[0]?.stats?.avg, st[1]?.stats?.avg);
}

/**
 * Текст отчёта: строки «ключ: значение», первая строка «LAB na-cheboksare v<версия> <дата>».
 * Ключи — латиницей (их читает человек и скрипт), значения — числа или «-», если данных нет.
 */
export function buildReport(d: LabData, date: Date): string {
  const T = LAB_THRESHOLDS;
  const dev = d.device;
  const L: [string, unknown][] = [
    ['platform', dev.platform],
    ['manufacturer', dev.manufacturer],
    ['model', dev.model],
    ['os', dev.os],
    ['api_level', dev.apiLevel],
    ['ram_mb', dev.ramMb],
    ['year_class', dev.yearClass],
    ['cpu_arch', dev.cpuArch],
    ['cpu_cores', dev.cpuCores],
    ['disk_free_mb', dev.diskFreeMb],
    ['disk_total_mb', dev.diskTotalMb],
    ['screen_dp', dev.screenDp ? `${Math.round(dev.screenDp.w)}x${Math.round(dev.screenDp.h)}` : null],
    ['pixel_ratio', dev.pixelRatio],
    ['screen_px', dev.screenDp && dev.pixelRatio ? `${Math.round(dev.screenDp.w * dev.pixelRatio)}x${Math.round(dev.screenDp.h * dev.pixelRatio)}` : null],
    ['font_scale', dev.fontScale],
    ['phone_locale', dev.phoneLocale],
    ['phone_region', dev.phoneRegion],
    ['app_lang', d.appLang],
    ['content_version', d.contentVersion],
    ['start_js_to_screen_ms', d.start.jsToScreenMs],
    ['start_origin_to_screen_ms', d.start.originToScreenMs],
    ['2d_elements', d.r2d?.elements],
    ['2d_fps_avg', d.r2d?.stats?.avg],
    ['2d_fps_min', d.r2d?.stats?.min],
    ['2d_heavy_pct', d.r2d?.stats?.heavyPct],
    ['2d_seconds', d.r2d?.stats?.seconds],
    ['3d_available', d.r3d ? (d.r3d.available ? 'yes' : 'no') : null],
    ['3d_gl_renderer', d.r3d?.renderer],
    ['3d_gl_version', d.r3d?.glVersion],
    ['3d_canvas_px', d.r3d?.canvasPx ? `${d.r3d.canvasPx.w}x${d.r3d.canvasPx.h}` : null],
    ['3d_texture', d.r3d ? `${d.r3d.textureSize}x${d.r3d.textureSize}` : null],
    ['3d_tris_per_object', d.r3d?.trianglesPerObject],
    ['3d_setup_ms', d.r3d?.setupMs],
    ['3d_setup_errors', d.r3d?.setupErrors],
    ['3d_error', d.r3d?.errorText],
  ];
  (d.r3d?.stages ?? []).forEach((s, i) => {
    const k = `3d_s${i + 1}_`;
    L.push(
      [k + 'objects', s.objects],
      [k + 'triangles', s.triangles],
      [k + 'fps_avg', s.stats?.avg],
      [k + 'fps_min', s.stats?.min],
      [k + 'heavy_pct', s.stats?.heavyPct],
      [k + 'first_frame_ms', s.firstFrameMs],
      [k + 'gl_errors', s.glErrors],
    );
  });
  L.push(
    ['verdict', labVerdict(d)],
    [
      'verdict_rule',
      `s1_avg>=${T.greenStage1Fps} && s2_avg>=${T.greenStage2Fps} -> green; s1_avg>=${T.yellowStage1Fps} -> yellow; else red`,
    ],
  );
  return [`LAB na-cheboksare v${d.appVersion} ${reportDate(date)}`, ...L.map(([k, x]) => `${k}: ${v(x)}`)].join('\n');
}
