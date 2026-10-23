// «Лаборатория замеров», 3D-нагрузка = бюджет 3D-актива (документ владельца 23.10.2026: ≤10–20 тыс. треугольников, текстура 2K).
// Три ступени по 10 с: 1 объект (~20 тыс. треугольников), 4 (~80 тыс.), 8 (~160 тыс.). Считаем средний и минимальный кадр/с,
// долю тяжёлых кадров, время первой отрисовки, ошибки GL. На телефоне — expo-gl, в браузере — WebGL (тот же код).
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { LAB_CONFIG } from './config';
import { buildSphere, buildTexture, FRAG, layout, model, multiply, perspective, VERT } from './gl';
import { fpsStats, type Result3D, type Stage3D } from './report';

const now = (): number => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());
const nextFrame = () => new Promise<number>((r) => requestAnimationFrame(() => r(now())));

/** Достаём все накопившиеся ошибки GL (не больше 16) — сколько их было */
function drainErrors(gl: ExpoWebGLRenderingContext): number {
  let n = 0;
  for (let i = 0; i < 16; i++) {
    const e = gl.getError();
    if (e === gl.NO_ERROR || e === undefined) break;
    n++;
  }
  return n;
}

function safeParam(gl: ExpoWebGLRenderingContext, p: number): string | null {
  try {
    const v = gl.getParameter(p);
    return typeof v === 'string' && v ? v : null;
  } catch {
    return null;
  }
}

async function runBench(gl: ExpoWebGLRenderingContext, cancelled: () => boolean, onStage: (i: number) => void): Promise<Result3D> {
  const cfg = LAB_CONFIG;
  const r: Result3D = {
    available: true,
    renderer: safeParam(gl, gl.RENDERER),
    glVersion: safeParam(gl, gl.VERSION),
    canvasPx: null,
    textureSize: cfg.textureSize,
    trianglesPerObject: cfg.sphereSegments * cfg.sphereSegments * 2,
    setupMs: null,
    setupErrors: 0,
    errorText: null,
    stages: [],
  };
  try {
    await nextFrame(); // дать холсту получить свой размер
    const t0 = now();
    const mesh = buildSphere(cfg.sphereSegments);
    r.trianglesPerObject = mesh.triangles;
    const pixels = buildTexture(cfg.textureSize);

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + (gl.getShaderInfoLog(s) || 'compile failed'));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('program: ' + (gl.getProgramInfoLog(prog) || 'link failed'));
    gl.useProgram(prog);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    const stride = 8 * 4;
    const attr = (name: string, size: number, offset: number) => {
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
    };
    attr('aPos', 3, 0);
    attr('aNor', 3, 12);
    attr('aUv', 2, 24);

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cfg.textureSize, cfg.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    const uMvp = gl.getUniformLocation(prog, 'uMvp');
    const uModel = gl.getUniformLocation(prog, 'uModel');
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);
    const L = [0.5, 0.7, 0.6];
    const ln = Math.hypot(L[0], L[1], L[2]);
    gl.uniform3f(gl.getUniformLocation(prog, 'uLight'), L[0] / ln, L[1] / ln, L[2] / ln);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    r.setupErrors += drainErrors(gl);
    r.setupMs = Math.round(now() - t0);

    const count = mesh.indices.length;
    const draw = (t: number, pos: [number, number, number][]) => {
      const w = gl.drawingBufferWidth;
      const h = gl.drawingBufferHeight;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0.06, 0.1, 0.13, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const P = perspective((50 * Math.PI) / 180, w > 0 && h > 0 ? w / h : 0.75, 0.1, 20);
      pos.forEach(([x, y, s], i) => {
        const M = model(x, y, -4, t * 0.0006 + i * 0.7, 0.35 + i * 0.2, s);
        gl.uniformMatrix4fv(uMvp, false, multiply(P, M));
        gl.uniformMatrix4fv(uModel, false, M);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
      });
    };

    for (let si = 0; si < cfg.stages3d.length; si++) {
      if (cancelled()) break;
      onStage(si);
      const objects = cfg.stages3d[si];
      const pos = layout(objects);
      const ts: number[] = [];
      const start = now();
      let first: number | null = null;
      const stage = await new Promise<Stage3D>((resolve) => {
        const frame = () => {
          const t = now();
          if (ts.length === 1 && first === null) first = Math.round(t - start); // первый кадр отрисован и показан
          ts.push(t);
          if (cancelled() || t - start >= cfg.stageMs) {
            resolve({ objects, triangles: objects * mesh.triangles, stats: fpsStats(ts, cfg.warmupMs), firstFrameMs: first, glErrors: drainErrors(gl) });
            return;
          }
          draw(t, pos);
          gl.endFrameEXP();
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      if (!r.canvasPx) r.canvasPx = { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight };
      r.stages.push(stage);
    }
  } catch (e) {
    r.setupErrors += 1;
    r.errorText = String((e as Error)?.message ?? e).slice(0, 200);
  }
  return r;
}

/** Если холст не создался (в браузере нет WebGL и т.п.) — не роняем экран, а отдаём «3D недоступно» */
export class Bench3DGuard extends React.Component<{ onFail: (msg: string) => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    this.props.onFail(String((e as Error)?.message ?? e));
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Холст 3D-замера. Монтируется только на время замера; по окончании отдаёт результат в onDone. */
export function Bench3D({ onDone, onStage }: { onDone: (r: Result3D) => void; onStage?: (i: number) => void }) {
  const cancelled = useRef(false);
  const started = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;
  const stageCb = useRef(onStage);
  stageCb.current = onStage;
  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );
  return (
    <View testID="lab-gl" style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: 12, overflow: 'hidden', marginTop: 10 }}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={(gl) => {
          if (started.current) return;
          started.current = true;
          runBench(gl, () => cancelled.current, (i) => stageCb.current?.(i)).then((r) => {
            if (!cancelled.current) done.current(r);
          });
        }}
      />
    </View>
  );
}

/** Результат, если 3D-контекст не создался вовсе (нет GL на устройстве/в браузере) */
export function unavailable3D(error: string): Result3D {
  return {
    available: false,
    renderer: null,
    glVersion: null,
    canvasPx: null,
    textureSize: LAB_CONFIG.textureSize,
    trianglesPerObject: LAB_CONFIG.sphereSegments * LAB_CONFIG.sphereSegments * 2,
    setupMs: null,
    setupErrors: 1,
    errorText: error.slice(0, 200),
    stages: [],
  };
}
