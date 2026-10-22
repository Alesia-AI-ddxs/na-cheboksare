// Виньетки сцен (560×240). Сцены night / pier / kremlin / cathedral перенесены из веб-прототипа один в один.
// Сцены bay / mansion / granary / school / hill нарисованы в том же плоском стиле и той же палитре.
// Это схематичные реконструкции, не фотографии. Лиц нет.
import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useGame } from '../state/game';
import type { Palette } from '../theme';

let counter = 0;
function useUid(prefix: string) {
  const r = useRef<string | null>(null);
  if (r.current === null) r.current = `${prefix}${++counter}`;
  return r.current;
}

const SUN = '#F2D98C';
const MOON = '#EDE6CF';

function Fires() {
  return (
    <G>
      <Circle cx={120} cy={182} r={5} fill="#E8A13A" />
      <Circle cx={120} cy={179} r={2.4} fill="#F7DB8E" />
      <Circle cx={430} cy={186} r={5} fill="#E8A13A" />
      <Circle cx={430} cy={183} r={2.4} fill="#F7DB8E" />
      <Circle cx={268} cy={190} r={4} fill="#E8A13A" />
      <Circle cx={268} cy={187} r={2} fill="#F7DB8E" />
    </G>
  );
}

function Shine({ d, opacity = 0.4 }: { d: string; opacity?: number }) {
  return <Path d={d} stroke={SUN} strokeWidth={1.3} opacity={opacity} />;
}

/** Ровная земля (улица) вместо воды — для сцен в глубине города. */
function Ground({ pal }: { pal: Palette }) {
  return (
    <G>
      <Rect y={170} width={560} height={70} fill={pal.dark ? '#1B2630' : '#CDBF9F'} />
      <Path d="M0 186 H560" stroke={pal.dark ? '#2B3B47' : '#B8A982'} strokeWidth={1.5} />
      <Path d="M40 210 h60 M180 222 h80 M360 206 h70 M470 226 h50" stroke={pal.dark ? '#2B3B47' : '#B8A982'} strokeWidth={2} strokeLinecap="round" />
    </G>
  );
}

function Tree({ x, y, pal }: { x: number; y: number; pal: Palette }) {
  return (
    <G>
      <Rect x={x - 2} y={y} width={4} height={18} fill={pal.volgaDeep} />
      <Circle cx={x} cy={y - 6} r={13} fill={pal.volgaDeep} opacity={0.9} />
    </G>
  );
}

function SceneBody({ kind, pal, sky, water }: { kind: string; pal: Palette; sky: string; water: string }) {
  const sun = <Circle cx={440} cy={60} r={22} fill={SUN} opacity={0.9} />;
  switch (kind) {
    case 'night':
      return (
        <G>
          <Circle cx={452} cy={52} r={16} fill={MOON} opacity={0.9} />
          <Circle cx={446} cy={48} r={14} fill={`url(#${sky})`} />
          <G fill={MOON} opacity={0.8}>
            <Circle cx={80} cy={40} r={1.6} />
            <Circle cx={170} cy={66} r={1.2} />
            <Circle cx={260} cy={34} r={1.5} />
            <Circle cx={350} cy={58} r={1.2} />
            <Circle cx={520} cy={92} r={1.3} />
          </G>
          <Path d="M0 170 L90 156 L200 166 L320 150 L440 164 L560 152 L560 170 Z" fill="#0A1624" />
          <Rect y={170} width={560} height={70} fill={pal.night1} />
          <Path d="M90 196 h30 M300 210 h36 M460 192 h26" stroke={MOON} strokeWidth={1.2} opacity={0.25} />
          <G fill="#060D16">
            <Path d="M150 192 q30 14 60 0 l-8 12 h-44 Z" />
            <Path d="M330 200 q26 12 52 0 l-7 11 h-38 Z" />
          </G>
          <Fires />
        </G>
      );
    case 'pier':
      return (
        <G>
          {sun}
          <Path d="M0 170 L0 140 L40 134 L80 142 L130 130 L560 148 L560 170 Z" fill={pal.volgaDeep} />
          <G fill={pal.volgaDeep}>
            <Rect x={70} y={96} width={16} height={44} />
            <Path d="M70 96 L78 76 L86 96 Z" />
            <Rect x={150} y={118} width={26} height={24} />
            <Path d="M148 118 h30 l-15 -12 Z" />
            <Rect x={200} y={124} width={22} height={18} />
            <Path d="M198 124 h26 l-13 -10 Z" />
          </G>
          <Rect y={170} width={560} height={70} fill={`url(#${water})`} />
          <Shine d="M70 196 h30 M200 210 h36 M420 192 h30" />
          <Path d="M250 170 h130 v8 h-130 Z" fill="#2A1F12" />
          <Path d="M262 178 v22 M310 178 v24 M366 178 v20" stroke="#2A1F12" strokeWidth={5} />
          <Path d="M402 196 h74 l-9 13 h-57 Z" fill="#13222F" />
          <Path d="M432 196 v-26 l20 22 Z" fill="#E8DFC8" opacity={0.9} />
          <G fill="#13222F">
            {[268, 283, 300, 318, 336].map((x, i) => (
              <G key={x}>
                <Circle cx={x} cy={i % 2 ? 163 : 162} r={4} />
                <Rect x={x - 3} y={i % 2 ? 167 : 166} width={6} height={i % 2 ? 9 : 10} />
              </G>
            ))}
          </G>
        </G>
      );
    case 'kremlin':
      return (
        <G>
          {sun}
          <Path d="M0 170 L0 120 L560 140 L560 170 Z" fill="#3A4A3A" opacity={0.5} />
          <G fill={pal.volgaDeep}>
            <Path d="M60 170 V112 h18 V170 Z M60 112 l9 -14 9 14 Z" />
            <Path d="M140 170 V124 h16 V170 Z M140 124 l8 -12 8 12 Z" />
            <Path d="M86 136 h46 v34 h-46 Z" />
            <Path d="M86 136 h46 l-6 -8 h-34 Z" />
            <Path d="M220 170 V108 h22 V170 Z M220 108 l11 -16 11 16 Z" />
            <Path d="M164 142 h48 v28 h-48 Z" />
            <Path d="M310 170 V126 h16 V170 Z M310 126 l8 -12 8 12 Z" />
            <Path d="M250 146 h52 v24 h-52 Z" />
            <Path d="M390 170 V116 h20 V170 Z M390 116 l10 -15 10 15 Z" />
            <Path d="M334 142 h48 v28 h-48 Z" />
          </G>
          <G fill={SUN} opacity={0.85}>
            <Rect x={66} y={126} width={6} height={8} />
            <Rect x={228} y={124} width={7} height={9} />
            <Rect x={396} y={130} width={7} height={9} />
          </G>
          <Rect y={170} width={560} height={70} fill={`url(#${water})`} />
          <Shine d="M110 200 h34 M330 214 h30 M470 198 h28" opacity={0.35} />
        </G>
      );
    case 'cathedral':
      return (
        <G>
          {sun}
          <Path d="M0 170 L0 134 L560 150 L560 170 Z" fill={pal.volgaDeep} opacity={0.6} />
          <Rect x={236} y={96} width={88} height={74} fill="#EDE6D2" />
          <Path d="M250 96 C250 70 278 66 278 48 C278 66 306 70 306 96 Z" fill={SUN} />
          <Path d="M277 48 L279 48 L278 34 Z" fill={SUN} />
          <Path d="M272 40 h12 M278 34 v12" stroke={SUN} strokeWidth={2} />
          <Rect x={206} y={112} width={30} height={58} fill="#EDE6D2" />
          <Path d="M206 112 C206 96 221 94 221 82 C221 94 236 96 236 112 Z" fill={SUN} />
          <G fill="#8A94A6" opacity={0.8}>
            <Path d="M250 128 a8 8 0 0 1 16 0 v22 h-16 Z" />
            <Path d="M294 128 a8 8 0 0 1 16 0 v22 h-16 Z" />
            <Path d="M214 130 a6 6 0 0 1 12 0 v18 h-12 Z" />
          </G>
          <G fill={pal.volgaDeep}>
            <Path d="M80 170 V140 h22 V170 Z" />
            <Path d="M80 140 h22 l-11 -10 Z" />
            <Path d="M460 170 V144 h26 V170 Z" />
            <Path d="M460 144 h26 l-13 -11 Z" />
          </G>
          <Rect y={170} width={560} height={70} fill={`url(#${water})`} />
          <Shine d="M120 206 h30 M260 218 h40 M430 200 h30" opacity={0.35} />
        </G>
      );
    case 'bay':
      // Залив: дальний берег с собором, гладь воды, парапет набережной с маленькими фигурками.
      // Парапет поднят выше середины, чтобы подпись внизу его не закрывала.
      return (
        <G>
          {sun}
          <Path d="M0 104 L120 96 L260 100 L400 92 L560 98 L560 112 L0 112 Z" fill={pal.volgaDeep} opacity={0.75} />
          <Rect x={300} y={74} width={30} height={24} fill="#EDE6D2" opacity={0.9} />
          <Path d="M304 74 C304 62 315 60 315 52 C315 60 326 62 326 74 Z" fill={SUN} />
          <Rect y={110} width={560} height={130} fill={`url(#${water})`} />
          <Shine d="M60 124 h40 M220 120 h50 M400 128 h40" />
          {/* парапет */}
          <Rect y={150} width={560} height={9} fill="#D9CCAE" />
          <Rect y={159} width={560} height={81} fill="#BBAA86" />
          <G fill="#D9CCAE">
            {Array.from({ length: 14 }).map((_, i) => (
              <Rect key={i} x={12 + i * 40} y={159} width={8} height={81} opacity={0.6} />
            ))}
          </G>
          {/* шесть условных фигурок без лиц */}
          <G fill="#2A1F12">
            {[70, 150, 250, 330, 420, 500].map((x, i) => (
              <G key={x}>
                <Rect x={x - 6} y={133} width={12} height={17} rx={3} />
                <Circle cx={x} cy={128} r={5.5} />
                {i % 2 === 0 ? <Path d={`M${x - 6} 125 l6 -8 l6 8 Z`} /> : null}
              </G>
            ))}
          </G>
        </G>
      );
    case 'mansion':
      // Купеческий особняк в два этажа с угловой башенкой.
      return (
        <G>
          {sun}
          <Path d="M0 170 L0 150 L560 156 L560 170 Z" fill={pal.volgaDeep} opacity={0.4} />
          <Tree x={70} y={152} pal={pal} />
          <Tree x={500} y={150} pal={pal} />
          <Rect x={150} y={96} width={230} height={74} fill="#E7D9BC" />
          <Rect x={150} y={92} width={230} height={6} fill="#C9B48C" />
          <Rect x={150} y={132} width={230} height={4} fill="#C9B48C" />
          {/* башенка */}
          <Rect x={380} y={70} width={44} height={100} fill="#E7D9BC" />
          <Path d="M376 70 L402 30 L428 70 Z" fill={pal.volga} />
          <Path d="M402 30 v-10" stroke={SUN} strokeWidth={2} />
          <Rect x={392} y={84} width={20} height={26} rx={10} fill={SUN} opacity={0.85} />
          <Rect x={392} y={126} width={20} height={30} fill="#5C6B7A" />
          <G fill="#5C6B7A">
            {[166, 206, 246, 286, 326].map((x) => (
              <G key={x}>
                <Rect x={x} y={104} width={18} height={22} rx={9} />
                <Rect x={x} y={142} width={18} height={22} />
              </G>
            ))}
          </G>
          <G fill={SUN} opacity={0.8}>
            <Rect x={246} y={104} width={18} height={22} rx={9} />
            <Rect x={326} y={142} width={18} height={22} />
          </G>
          <Ground pal={pal} />
        </G>
      );
    case 'granary':
      // Каменные амбары на пристани и две расшивы (парусные барки) на воде.
      return (
        <G>
          {sun}
          <Path d="M0 170 L0 150 L560 156 L560 170 Z" fill={pal.volgaDeep} opacity={0.6} />
          <G>
            {[40, 140, 240].map((x) => (
              <G key={x}>
                <Rect x={x} y={120} width={90} height={50} fill="#D9C7A2" />
                <Path d={`M${x - 6} 120 L${x + 45} 96 L${x + 96} 120 Z`} fill={pal.volgaDeep} />
                <Rect x={x + 33} y={136} width={24} height={34} fill="#5C4630" />
                <Path d={`M${x + 45} 136 v34`} stroke="#3A2C1E" strokeWidth={1.5} />
              </G>
            ))}
          </G>
          <Rect y={170} width={560} height={70} fill={`url(#${water})`} />
          <Shine d="M60 200 h36 M200 214 h40 M330 196 h30" />
          {/* расшивы */}
          {[
            [360, 196],
            [460, 208],
          ].map(([x, y]) => (
            <G key={x}>
              <Path d={`M${x} ${y} h80 l-12 14 h-58 Z`} fill="#3A2C1E" />
              <Path d={`M${x + 40} ${y} V${y - 62}`} stroke="#3A2C1E" strokeWidth={3} />
              <Path d={`M${x + 18} ${y - 56} h44 v40 h-44 Z`} fill="#E8DFC8" opacity={0.92} />
              <Path d={`M${x + 40} ${y - 62} l12 -6 v6 Z`} fill={SUN} />
            </G>
          ))}
        </G>
      );
    case 'school':
      // Двухэтажный каменный дом начала XX века с рядами окон.
      return (
        <G>
          {sun}
          <Path d="M0 170 L0 152 L560 158 L560 170 Z" fill={pal.volgaDeep} opacity={0.4} />
          <Tree x={80} y={150} pal={pal} />
          <Tree x={486} y={152} pal={pal} />
          <Rect x={130} y={88} width={300} height={82} fill="#C98F6B" />
          <Path d="M124 88 h312 l-14 -14 h-284 Z" fill={pal.volgaDeep} />
          <Rect x={124} y={86} width={312} height={4} fill="#EDE6D2" />
          <Rect x={130} y={126} width={300} height={4} fill="#EDE6D2" />
          <Path d="M260 74 L280 58 L300 74 Z" fill="#EDE6D2" />
          <G fill="#EDE6D2">
            {Array.from({ length: 7 }).map((_, i) => (
              <G key={i}>
                <Rect x={146 + i * 40} y={96} width={22} height={24} rx={11} />
                <Rect x={146 + i * 40} y={136} width={22} height={24} rx={2} />
              </G>
            ))}
          </G>
          <G fill="#3D5568">
            {Array.from({ length: 7 }).map((_, i) => (
              <G key={i}>
                <Rect x={149 + i * 40} y={101} width={16} height={17} rx={8} />
                <Rect x={149 + i * 40} y={139} width={16} height={19} />
              </G>
            ))}
          </G>
          <Rect x={268} y={140} width={24} height={30} fill="#5C4630" />
          <Ground pal={pal} />
        </G>
      );
    case 'hill':
      // Горка над водой: церковь и часовня на вершине.
      return (
        <G>
          {sun}
          <Path d="M0 170 C80 120 200 92 300 96 C400 100 480 140 560 170 Z" fill="#4A5D45" opacity={0.85} />
          <Rect x={250} y={58} width={52} height={40} fill="#EDE6D2" />
          <Rect x={300} y={70} width={30} height={28} fill="#EDE6D2" />
          <Path d="M260 58 C260 40 276 38 276 26 C276 38 292 40 292 58 Z" fill={SUN} />
          <Path d="M276 26 v-12 M270 19 h12" stroke={SUN} strokeWidth={2} />
          <Rect x={268} y={72} width={14} height={20} rx={7} fill="#8A94A6" />
          {/* часовня */}
          <Rect x={186} y={86} width={22} height={22} fill="#EDE6D2" />
          <Path d="M184 86 L197 70 L210 86 Z" fill={pal.volga} />
          <Path d="M197 70 v-8" stroke={SUN} strokeWidth={2} />
          <Path d="M300 96 C330 120 300 150 330 170" stroke="#EDE6D2" strokeWidth={2} strokeDasharray="4 5" fill="none" opacity={0.7} />
          <Rect y={170} width={560} height={70} fill={`url(#${water})`} />
          <Shine d="M90 200 h30 M260 214 h44 M440 196 h30" />
        </G>
      );
    default:
      return (
        <G>
          {sun}
          <Rect y={170} width={560} height={70} fill={`url(#${water})`} />
        </G>
      );
  }
}

export function SceneSvg({ kind }: { kind: string }) {
  const { pal } = useGame();
  const id = useUid('sc');
  const sky = `${id}sky`;
  const water = `${id}w`;
  const top = kind === 'night' ? pal.night1 : pal.sky1;
  const bot = kind === 'night' ? pal.night2 : pal.sky2;
  return (
    <Svg viewBox="0 0 560 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bot} />
        </LinearGradient>
        <LinearGradient id={water} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={pal.sky2} stopOpacity={0.45} />
          <Stop offset="0.3" stopColor={pal.water} />
          <Stop offset="1" stopColor={pal.volgaDeep} />
        </LinearGradient>
      </Defs>
      <Rect width={560} height={170} fill={`url(#${sky})`} />
      <SceneBody kind={kind} pal={pal} sky={sky} water={water} />
    </Svg>
  );
}

/** Виньетка с подписью (эпоха + название), как в веб-прототипе. */
export function Vignette({ kind, era, title, note }: { kind: string; era?: string; title?: string; note?: string }) {
  const { pal, f } = useGame();
  return (
    <View
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 14,
        borderWidth: 1,
        borderColor: pal.line,
        aspectRatio: 560 / 240,
        width: '100%',
      }}
    >
      <SceneSvg kind={kind} />
      {note ? (
        <View style={{ position: 'absolute', top: 8, right: 10, backgroundColor: 'rgba(8,16,26,.45)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ color: '#E3D6B8', fontSize: 10.5, fontFamily: f.body }}>{note}</Text>
        </View>
      ) : null}
      {era || title ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10, backgroundColor: 'rgba(8,16,26,.55)' }}>
          {era ? (
            <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#E3D6B8', fontFamily: f.body }}>{era}</Text>
          ) : null}
          {title ? (
            <Text style={{ fontFamily: f.display, fontSize: 21, lineHeight: 27, color: '#F7F1E0' }} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
