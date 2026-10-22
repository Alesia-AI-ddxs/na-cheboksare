// Иллюстрированная карта маршрута этапа.
// Этап I — перенос карты веб-прототипа (Волга, залив, золотой пунктир маршрута).
// Этап II и дальше — своя простая карта «купеческого города».
// Узлы ставятся по ПОРЯДКУ точек в этапе (stages[].points), а не по номерам — так JSON можно менять.
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { Point } from '../content';
import { PointStatus, useGame } from '../state/game';

type Layout = { slots: [number, number][]; route: string; draw: 'volga' | 'town'; h: number };

// Этап I: позиции 0–3 — из веб-карты (mapXY), пятая — у залива.
const LAYOUT_STAGE_1: Layout = {
  slots: [
    [96, 150],
    [272, 128],
    [352, 150],
    [420, 196],
    [300, 196],
  ],
  route: 'M96 150 C150 130 210 120 272 128 C310 132 336 140 352 150 C380 166 400 182 420 196 C400 230 330 228 300 196',
  draw: 'volga',
  h: 250,
};

// Этап II: четыре узла вдоль золотого маршрута по улицам.
const LAYOUT_STAGE_2: Layout = {
  slots: [
    [90, 210],
    [210, 120],
    [350, 190],
    [470, 100],
  ],
  route: 'M90 210 C130 160 170 120 210 120 C270 120 300 190 350 190 C410 190 430 120 470 100',
  draw: 'town',
  h: 280,
};

function slotsFor(layout: Layout, n: number): [number, number][] {
  if (n <= layout.slots.length) return layout.slots.slice(0, n);
  // если точек больше, чем заготовок — раскладываем остальные равномерно по низу карты
  const extra: [number, number][] = [];
  for (let i = layout.slots.length; i < n; i++) extra.push([60 + ((i * 97) % 440), layout.h + 20]);
  return [...layout.slots, ...extra];
}

export function RouteMap({
  stageIndex,
  points,
  statusOf,
  onOpen,
  locked,
}: {
  stageIndex: number;
  points: Point[];
  statusOf: (id: number) => PointStatus;
  onOpen: (id: number) => void;
  locked?: boolean;
}) {
  const { pal, t, f } = useGame();
  const layout = stageIndex === 0 ? LAYOUT_STAGE_1 : LAYOUT_STAGE_2;
  const xy = slotsFor(layout, points.length);
  const H = Math.max(layout.h, ...xy.map(([, y]) => y + 30));
  const gid = `mw${stageIndex}`;
  const waterLabel = '#E8DFC8';

  return (
    <View style={{ backgroundColor: pal.panel, borderColor: pal.line, borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginTop: 14 }}>
      <View style={{ width: '100%', aspectRatio: 560 / H }}>
        <Svg viewBox={`0 0 560 ${H}`} width="100%" height="100%">
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={pal.water} stopOpacity={0.85} />
              <Stop offset="1" stopColor={pal.volgaDeep} />
            </LinearGradient>
          </Defs>
          <Rect width={560} height={H} fill={pal.panel} />
          {layout.draw === 'volga' ? (
            <G>
              <Path d="M0 40 C140 20 300 70 560 36 L560 120 C330 150 180 96 0 122 Z" fill={`url(#${gid})`} />
              <Path d="M230 160 q40 -18 84 0 q10 34 -42 44 q-52 -10 -42 -44 Z" fill={`url(#${gid})`} opacity={0.8} />
              {/* подписи воды — декоративные волны без слов */}
              <Path d="M400 80 q8 -5 16 0 q8 5 16 0 M440 92 q8 -5 16 0" stroke={waterLabel} strokeWidth={1.4} fill="none" opacity={0.7} />
              <Path d="M252 182 q6 -4 12 0 q6 4 12 0" stroke={waterLabel} strokeWidth={1.2} fill="none" opacity={0.7} />
            </G>
          ) : (
            <G>
              <Path d="M0 20 C160 10 360 40 560 14 L560 54 C360 76 160 46 0 60 Z" fill={`url(#${gid})`} />
              <G stroke={pal.line} strokeWidth={10} strokeLinecap="round" opacity={0.9}>
                <Path d="M40 240 L520 240" />
                <Path d="M60 150 L520 150" />
                <Path d="M150 80 L150 280" />
                <Path d="M300 80 L300 280" />
                <Path d="M430 80 L430 280" />
              </G>
              <G fill={pal.line} opacity={0.7}>
                {[
                  [170, 165],
                  [320, 165],
                  [450, 165],
                  [170, 90],
                  [320, 90],
                  [70, 165],
                  [70, 90],
                  [450, 255],
                  [170, 255],
                ].map(([x, y]) => (
                  <Rect key={`${x}-${y}`} x={x} y={y} width={110} height={56} rx={4} opacity={0.35} />
                ))}
              </G>
            </G>
          )}
          <Path
            d={layout.route}
            fill="none"
            stroke={locked ? pal.muted : pal.gold}
            strokeWidth={2.5}
            strokeDasharray="6 7"
            strokeLinecap="round"
            opacity={locked ? 0.6 : 1}
          />
          {points.map((p, i) => {
            const st = statusOf(p.id);
            const [x, y] = xy[i];
            const fill = st === 'done' ? pal.gold : st === 'current' ? pal.varya : pal.paper;
            const stroke = st === 'done' ? pal.gold : st === 'current' ? pal.varya : pal.muted;
            const tc = st === 'done' ? pal.goldInk : st === 'current' ? '#FFFFFF' : pal.muted;
            return (
              <G key={p.id} onPress={() => onOpen(p.id)}>
                <Circle cx={x} cy={y} r={24} fill="transparent" />
                <Circle cx={x} cy={y} r={17} fill={fill} stroke={stroke} strokeWidth={2} />
                <SvgText x={x} y={y + 5.5} textAnchor="middle" fontSize={15} fontWeight="700" fill={tc}>
                  {String(i + 1)}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
        <LegendDot color={pal.gold} label={t('ui.done')} f={f.body} muted={pal.muted} />
        <LegendDot color={pal.varya} label={t('ui.you_are_here')} f={f.body} muted={pal.muted} />
        <LegendDot color="transparent" border={pal.muted} label={t('ui.ahead')} f={f.body} muted={pal.muted} />
      </View>
    </View>
  );
}

function LegendDot({ color, border, label, f, muted }: { color: string; border?: string; label: string; f?: string; muted: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: border ? 1.5 : 0, borderColor: border }} />
      <Text style={{ fontSize: 12.5, color: muted, fontFamily: f }}>{label}</Text>
    </View>
  );
}

