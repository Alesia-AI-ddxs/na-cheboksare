// Линейные иконки: находки (12 видов + запасная), значки рассказчиков, режимов игры и вкладок.
// Все нарисованы с нуля, тонкой линией. Лиц нет.
import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useGame } from '../state/game';

type IconProps = { size?: number; color?: string; dim?: boolean };

const ARTIFACT_PATHS: Record<string, (c: string) => React.ReactNode> = {
  // кресало: стальная петля и кремень
  firesteel: () => (
    <G>
      <Path d="M12 30 C12 18 22 14 32 22 C42 14 52 18 52 30 C52 36 46 40 32 40 C18 40 12 36 12 30 Z" />
      <Path d="M20 30 h24" />
      <Path d="M26 46 l6 -6 l8 4 l-4 10 l-10 0 Z" />
      <Path d="M44 46 l4 -3 M46 50 l5 -1 M42 53 l3 3" />
    </G>
  ),
  // весло
  oar: () => (
    <G>
      <Path d="M14 50 L40 24" />
      <Path d="M38 26 C40 16 48 10 54 10 C54 16 48 24 38 26 Z" />
      <Path d="M10 54 l6 -6" strokeWidth={4} />
    </G>
  ),
  // берестяной сосуд с полосой надписи
  bark: () => (
    <G>
      <Ellipse cx={32} cy={16} rx={16} ry={5} />
      <Path d="M16 16 V48 C16 52 48 52 48 48 V16" />
      <Path d="M16 28 C24 31 40 31 48 28" />
      <Path d="M20 36 h3 M26 36 h2 M31 36 h4 M38 36 h3 M43 36 h2" />
      <Path d="M24 22 v24 M40 22 v24" opacity={0.5} />
    </G>
  ),
  // зеркало (как в вебе)
  mirror: () => (
    <G>
      <Circle cx={32} cy={28} r={16} />
      <Circle cx={32} cy={28} r={10} />
      <Path d="M32 44v10M26 54h12" />
      <Path d="M26 22q3-4 8-3" />
    </G>
  ),
  // бердыш: древко и полумесяц лезвия
  poleaxe: () => (
    <G>
      <Path d="M24 8 V58" />
      <Path d="M24 14 C40 12 50 22 48 40 C44 34 36 32 24 34" />
      <Path d="M24 20 l6 0 M24 28 l4 0" />
    </G>
  ),
  // изразец с растительным узором
  tile: () => (
    <G>
      <Rect x={12} y={12} width={40} height={40} rx={3} />
      <Rect x={18} y={18} width={28} height={28} rx={2} />
      <Circle cx={32} cy={32} r={4} />
      <Path d="M32 22 v6 M32 36 v6 M22 32 h6 M36 32 h6" />
    </G>
  ),
  // монета-«чешуйка»
  coin: () => (
    <G>
      <Path d="M14 32 C14 20 22 14 33 14 C44 15 51 22 50 33 C49 44 41 50 31 50 C20 49 14 42 14 32 Z" />
      <Path d="M24 28 h16 M24 34 h16 M27 40 h10" />
      <Circle cx={32} cy={22} r={2} />
    </G>
  ),
  // свиток (как в вебе)
  scroll: () => (
    <G>
      <Path d="M18 10h30a6 6 0 0 1-6 6H18a6 6 0 0 0-6 6v26a6 6 0 0 0 6 6h28a6 6 0 0 0 6-6V16" />
      <Path d="M22 26h20M22 34h20M22 42h14" />
    </G>
  ),
  // портрет в раме — условный силуэт, без черт лица
  portrait: () => (
    <G>
      <Rect x={14} y={8} width={36} height={48} rx={2} />
      <Rect x={19} y={13} width={26} height={38} rx={1} />
      <Circle cx={32} cy={27} r={6} />
      <Path d="M22 49 C23 40 28 37 32 37 C36 37 41 40 42 49" />
    </G>
  ),
  // чертёж: лист с планом и циркулем
  blueprint: () => (
    <G>
      <Rect x={10} y={12} width={44} height={40} rx={2} />
      <Path d="M16 44 V24 h16 v20 M32 32 h16 v12 H16" />
      <Path d="M44 8 l-6 16 M44 8 l6 16" />
      <Circle cx={44} cy={8} r={2} />
    </G>
  ),
  // фигурка на постаменте
  figurine: () => (
    <G>
      <Circle cx={32} cy={16} r={6} />
      <Path d="M24 40 C24 28 28 24 32 24 C36 24 40 28 40 40 Z" />
      <Path d="M26 22 l-4 -8 M38 22 l4 -8" />
      <Rect x={18} y={40} width={28} height={8} rx={1} />
      <Path d="M14 54 h36" />
    </G>
  ),
  // запасная: ромб-находка
  generic: () => (
    <G>
      <Path d="M32 8 L54 32 L32 56 L10 32 Z" />
      <Path d="M32 18 L44 32 L32 46 L20 32 Z" />
    </G>
  ),
};

export function ArtifactIcon({ icon, size = 44, color, dim }: IconProps & { icon: string }) {
  const { pal } = useGame();
  const c = dim ? pal.muted : color ?? pal.gold;
  const draw = ARTIFACT_PATHS[icon] ?? ARTIFACT_PATHS.generic;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" opacity={dim ? 0.45 : 1}>
      <G fill="none" stroke={c} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dim ? '3 4' : undefined}>
        {draw(c)}
      </G>
    </Svg>
  );
}

/** Абстрактный значок рассказчика (по слою: документ — свиток, наука — циркуль, предание — огонёк). */
export function SpeakerIcon({ layer, size = 40 }: { layer: string; size?: number }) {
  const { pal } = useGame();
  const bg = layer === 'doc' ? pal.docChip : layer === 'sci' ? pal.gold : pal.legChip;
  const fg = layer === 'sci' ? pal.goldInk : '#FFFFFF';
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={20} fill={bg} />
      <G fill="none" stroke={fg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {layer === 'doc' ? (
          <G>
            <Path d="M13 12h14a3 3 0 0 1-3 3H13a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V15" />
            <Path d="M15 21h9M15 25h6" />
          </G>
        ) : layer === 'sci' ? (
          <G>
            <Path d="M20 10 L13 30 M20 10 L27 30" />
            <Circle cx={20} cy={10} r={2} />
            <Path d="M15 24 h10" />
          </G>
        ) : (
          <G>
            <Path d="M20 10 C26 17 27 22 24 27 C23 29 21 30 20 30 C16 30 13 27 14 22 C15 19 17 18 17 15 C19 17 19 19 20 20 C21 17 21 14 20 10 Z" />
          </G>
        )}
      </G>
    </Svg>
  );
}

/** Режим «я на месте» — шагающий путник (условный). */
export function WalkIcon({ size = 28, color }: IconProps) {
  const { pal } = useGame();
  const c = color ?? pal.ink;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <G fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={17} cy={6} r={2.6} />
        <Path d="M16 11 L13 19 L17 22 L18 29 M13 19 L9 28 M15 12 L21 16 M15 12 L10 15" />
      </G>
    </Svg>
  );
}

/** Режим «играю издалека» — дом. */
export function HomeIcon({ size = 28, color }: IconProps) {
  const { pal } = useGame();
  const c = color ?? pal.ink;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <G fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 15 L16 6 L27 15" />
        <Path d="M8 13 V26 H24 V13" />
        <Rect x={13.5} y={18} width={5} height={8} />
      </G>
    </Svg>
  );
}

export function CopyIcon({ size = 20, color }: IconProps) {
  const { pal } = useGame();
  const c = color ?? pal.ink;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={8} y={8} width={12} height={12} rx={2} />
        <Path d="M16 8 V6 a2 2 0 0 0 -2 -2 H6 a2 2 0 0 0 -2 2 v8 a2 2 0 0 0 2 2 h2" />
      </G>
    </Svg>
  );
}

export function CheckIcon({ size = 20, color }: IconProps) {
  const { pal } = useGame();
  const c = color ?? pal.ok;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12.5 L10 17 L19 7" fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Иконки вкладок. */
export function TabIcon({ name, color, size = 24 }: { name: 'route' | 'finds' | 'setner' | 'about'; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        {name === 'route' ? (
          <G>
            <Circle cx={6} cy={18} r={2.2} />
            <Circle cx={18} cy={6} r={2.2} />
            <Path d="M8 17 C14 16 8 9 16 7" strokeDasharray="2.5 2.5" />
          </G>
        ) : name === 'finds' ? (
          <G>
            <Path d="M12 3 L20 12 L12 21 L4 12 Z" />
            <Path d="M12 8 L16 12 L12 16 L8 12 Z" />
          </G>
        ) : name === 'setner' ? (
          <G>
            <Path d="M4 6 h16 v10 h-9 l-5 4 v-4 H4 Z" />
            <Path d="M8 10 h8 M8 13 h5" />
          </G>
        ) : (
          <G>
            <Circle cx={12} cy={12} r={9} />
            <Path d="M12 11 v6" />
            <Circle cx={12} cy={7.5} r={0.8} fill={color} />
          </G>
        )}
      </G>
    </Svg>
  );
}

/** Знак-сокол студии (тот же, что на иконке приложения). */
export function FalconMark({ size = 56 }: { size?: number }) {
  const BLUE = '#00457C';
  const GOLD = '#B98A2B';
  return (
    <Svg width={size} height={size} viewBox="100 220 824 620">
      <Circle cx={512} cy={420} r={300} fill="none" stroke={GOLD} strokeWidth={22} />
      <G fill={BLUE}>
        <Path d="M500 470 L130 300 L232 420 L262 404 L292 462 L330 448 L352 502 L392 492 L410 548 L500 560 Z" />
        <Path d="M524 470 L894 300 L792 420 L762 404 L732 462 L694 448 L672 502 L632 492 L614 548 L524 560 Z" />
        <Path d="M512 268 C548 268 566 300 566 336 L586 420 L572 620 L512 708 L452 620 L438 420 L458 336 C458 300 476 268 512 268 Z" />
        <Path d="M466 660 L512 800 L558 660 L512 700 Z" />
      </G>
      <Path d="M512 336 L496 372 L512 362 L528 372 Z" fill={GOLD} />
    </Svg>
  );
}
