// Иконки для веб-версии, которую ставят на экран «Домой» (PWA): iPhone и Android.
// Берёт готовую иконку assets/images/icon.png (сокол на бумажном фоне) и делает из неё:
//   public/apple-touch-icon.png      180×180 — иконка для iPhone
//   public/icons/icon-192.png        192×192 — обычная иконка
//   public/icons/icon-512.png        512×512 — большая иконка
//   public/icons/maskable-512.png    512×512 — иконка с запасом по краям (Android сам обрезает её в круг)
// Запуск: npm run icons   (или отдельно: node scripts/make-pwa-icons.mjs)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'assets/images/icon.png');
const PUB = join(root, 'public');
const PAPER = '#F5F0E6';
mkdirSync(join(PUB, 'icons'), { recursive: true });

async function plain(size, out) {
  // flatten — убираем прозрачность: iPhone закрашивает прозрачные места чёрным
  await sharp(SRC).resize(size, size).flatten({ background: PAPER }).png().toFile(out);
  console.log('готово:', out, `${size}×${size}`);
}

async function maskable(size, out) {
  // знак занимает 80% — так ничего важного не срежется при круглой маске
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const mark = await sharp(SRC).resize(inner, inner).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: PAPER } })
    .composite([{ input: mark, top: pad, left: pad }])
    .flatten({ background: PAPER })
    .png()
    .toFile(out);
  console.log('готово:', out, `${size}×${size} (с запасом по краям)`);
}

await plain(180, join(PUB, 'apple-touch-icon.png'));
await plain(192, join(PUB, 'icons/icon-192.png'));
await plain(512, join(PUB, 'icons/icon-512.png'));
await maskable(512, join(PUB, 'icons/maskable-512.png'));
