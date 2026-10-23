// «Лаборатория замеров», 3D: процедурная сцена по бюджету 3D-актива из документа владельца 23.10.2026
// (≤10–20 тыс. треугольников, текстура 2K). Чистый WebGL 1 (на телефоне — expo-gl, в браузере — WebGL), без three.js.
// Сетка: сфера-«рельеф» segments × segments (100 × 100 = 20 000 треугольников), текстура 2048×2048 создаётся в коде,
// простой свет (диффузный + фон), вращение. Ничего не скачивается.

export type Mesh = { vertices: Float32Array; indices: Uint16Array; triangles: number };

/** Сфера с «рельефом» (лёгкие волны по поверхности): позиция(3) + нормаль(3) + текстурные координаты(2) */
export function buildSphere(segments: number): Mesh {
  const n = segments;
  const verts = new Float32Array((n + 1) * (n + 1) * 8);
  let o = 0;
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * Math.PI; // от полюса до полюса
    for (let j = 0; j <= n; j++) {
      const ph = (j / n) * Math.PI * 2;
      const nx = Math.sin(th) * Math.cos(ph);
      const ny = Math.cos(th);
      const nz = Math.sin(th) * Math.sin(ph);
      const r = 1 + 0.04 * Math.sin(7 * th) * Math.sin(9 * ph);
      verts[o++] = nx * r;
      verts[o++] = ny * r;
      verts[o++] = nz * r;
      verts[o++] = nx;
      verts[o++] = ny;
      verts[o++] = nz;
      verts[o++] = j / n;
      verts[o++] = i / n;
    }
  }
  const idx = new Uint16Array(n * n * 6);
  let k = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * (n + 1) + j;
      const b = a + n + 1;
      idx[k++] = a;
      idx[k++] = b;
      idx[k++] = a + 1;
      idx[k++] = b;
      idx[k++] = b + 1;
      idx[k++] = a + 1;
    }
  }
  return { vertices: verts, indices: idx, triangles: n * n * 2 };
}

/** Процедурная текстура size × size (RGBA): клетка + градиенты — чтобы был виден каждый уровень детализации */
export function buildTexture(size: number): Uint8Array {
  const px = new Uint8Array(size * size * 4);
  let o = 0;
  for (let y = 0; y < size; y++) {
    const gy = (y * 255) / size;
    for (let x = 0; x < size; x++) {
      const cell = ((x >> 6) ^ (y >> 6)) & 1;
      const fine = ((x >> 3) ^ (y >> 3)) & 1;
      px[o++] = cell ? 206 : 40 + ((x * 120) / size) | 0;
      px[o++] = cell ? 168 + fine * 20 : 90 + (gy * 0.4) | 0;
      px[o++] = cell ? 92 : 130 + fine * 30;
      px[o++] = 255;
    }
  }
  return px;
}

// ───────────────────────────── матрицы 4×4 (по столбцам, как в WebGL)
export type M4 = Float32Array;
export function perspective(fovY: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}
export function multiply(a: M4, b: M4): M4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = s;
    }
  return out;
}
/** Модель: перенос (x, y, z) · поворот вокруг Y на ay и вокруг X на ax · масштаб s */
export function model(x: number, y: number, z: number, ay: number, ax: number, s: number): M4 {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  // R = Ry · Rx
  const m = new Float32Array(16);
  m[0] = cy * s;
  m[1] = 0;
  m[2] = -sy * s;
  m[4] = sy * sx * s;
  m[5] = cx * s;
  m[6] = cy * sx * s;
  m[8] = sy * cx * s;
  m[9] = -sx * s;
  m[10] = cy * cx * s;
  m[12] = x;
  m[13] = y;
  m[14] = z;
  m[15] = 1;
  return m;
}

/** Где стоят объекты ступени (экран замера вертикальный, 3:4): 1 — в центре; 4 — 2×2; 8 — 2×4. Возвращает [x, y, масштаб] */
export function layout(count: number): [number, number, number][] {
  if (count <= 1) return [[0, 0, 1.15]];
  const cols = 2;
  const rows = Math.ceil(count / cols);
  const s = count <= 4 ? 0.62 : 0.42;
  const stepX = s * 2.25;
  const stepY = s * 2.25;
  const out: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    out.push([(c - (cols - 1) / 2) * stepX, ((rows - 1) / 2 - r) * stepY, s]);
  }
  return out;
}

export const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec2 aUv;
uniform mat4 uMvp;
uniform mat4 uModel;
varying vec3 vN;
varying vec2 vUv;
void main() {
  vN = (uModel * vec4(aNor, 0.0)).xyz;
  vUv = aUv;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

export const FRAG = `
precision mediump float;
varying vec3 vN;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec3 uLight;
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, uLight), 0.0);
  vec3 c = texture2D(uTex, vUv * 2.0).rgb;
  gl_FragColor = vec4(c * (0.28 + 0.72 * d), 1.0);
}`;
