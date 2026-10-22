// Генератор иконок приложения «На Чебоксаре».
// Рисует оригинальный знак — геометрический сокол в полёте (синий #00457C, золотой акцент #B98A2B)
// и сохраняет PNG: иконка, адаптивная иконка Android, монохромная, заставка, фавикон.
// Запуск: npm run icons   (нужен пакет sharp — он в devDependencies)
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const BLUE = '#00457C';
const GOLD = '#B98A2B';
const PAPER = '#F5F0E6';
const OUT = 'assets/images';
mkdirSync(OUT, { recursive: true });

// Знак в системе координат 1024×1024, центр 512,512.
// fill — цвет тела, accent — цвет золотых деталей (солнце за спиной и «глаз»).
function mark(fill, accent, withSun = true) {
  return `
  ${withSun ? `<circle cx="512" cy="420" r="300" fill="none" stroke="${accent}" stroke-width="22"/>` : ''}
  <g fill="${fill}">
    <!-- левое крыло: острое, как у сокола, с зубцами маховых перьев -->
    <path d="M500 470 L130 300 L232 420 L262 404 L292 462 L330 448 L352 502 L392 492 L410 548 L500 560 Z"/>
    <!-- правое крыло -->
    <path d="M524 470 L894 300 L792 420 L762 404 L732 462 L694 448 L672 502 L632 492 L614 548 L524 560 Z"/>
    <!-- тело и голова -->
    <path d="M512 268 C548 268 566 300 566 336 L586 420 L572 620 L512 708 L452 620 L438 420 L458 336 C458 300 476 268 512 268 Z"/>
    <!-- хвост веером -->
    <path d="M466 660 L512 800 L558 660 L512 700 Z"/>
  </g>
  <!-- клюв и «усы» сокола -->
  <path d="M512 336 L496 372 L512 362 L528 372 Z" fill="${accent}"/>
  <path d="M478 318 L470 352" stroke="${PAPER}" stroke-width="10" stroke-linecap="round"/>
  <path d="M546 318 L554 352" stroke="${PAPER}" stroke-width="10" stroke-linecap="round"/>
`;
}

function svg(content, { bg = null, scale = 1 } = {}) {
  const t = (1 - scale) * 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}
  <g transform="translate(${t} ${t + 30 * scale}) scale(${scale})">${content}</g>
</svg>`;
}

const jobs = [
  ['icon.png', svg(mark(BLUE, GOLD), { bg: PAPER, scale: 1.0 }), 1024],
  ['adaptive-icon.png', svg(mark(BLUE, GOLD), { scale: 0.6 }), 1024],
  ['adaptive-icon-mono.png', svg(mark('#000000', '#000000', false), { scale: 0.6 }), 1024],
  ['splash-icon.png', svg(mark(BLUE, GOLD), { scale: 0.9 }), 1024],
  ['favicon.png', svg(mark(BLUE, GOLD), { bg: PAPER, scale: 0.95 }), 48],
];

for (const [name, s, size] of jobs) {
  writeFileSync(`${OUT}/${name.replace('.png', '.svg')}`, s);
  await sharp(Buffer.from(s)).resize(size, size).png().toFile(`${OUT}/${name}`);
  console.log('готово:', `${OUT}/${name}`, `${size}×${size}`);
}
