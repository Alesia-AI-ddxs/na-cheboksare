// «Лаборатория замеров», 2D-нагрузка: виньетка текущей точки + N движущихся элементов (Animated) поверх неё, 10 с.
// Анимация считается в JS (useNativeDriver: false) — худший честный случай: каждый кадр JS двигает все элементы.
// Кадры считаем по requestAnimationFrame: средний и минимальный кадр/с, доля тяжёлых кадров (> 33 мс).
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Vignette } from '../components/Vignette';
import { LAB_CONFIG } from './config';
import { fpsStats, type Result2D } from './report';

const now = (): number => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());

export function Bench2D({ scene, color, onDone }: { scene: string; color: string; onDone: (r: Result2D) => void }) {
  const n = LAB_CONFIG.elements2d;
  const values = useMemo(() => Array.from({ length: n }, () => new Animated.Value(0)), [n]);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    let alive = true;
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 1400 + (i % 7) * 230, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ),
    );
    loops.forEach((l) => l.start());
    const ts: number[] = [];
    const start = now();
    let raf = 0;
    const tick = () => {
      if (!alive) return;
      const t = now();
      ts.push(t);
      if (t - start >= LAB_CONFIG.stageMs) {
        loops.forEach((l) => l.stop());
        done.current({ elements: n, stats: fpsStats(ts, LAB_CONFIG.warmupMs) });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      loops.forEach((l) => l.stop());
    };
  }, [values, n]);

  return (
    <View testID="lab-2d" style={{ marginTop: 6 }}>
      <Vignette kind={scene} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 14, bottom: 0 }}>
        {values.map((v, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const dx = 20 + ((i * 37) % 60);
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: `${4 + col * 12}%`,
                top: `${6 + row * 18}%`,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: color,
                opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 0.95, 0.35] }),
                transform: [
                  { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, dx, 0] }) },
                  { translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -12, 0] }) },
                  { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                  { scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.3, 0.8] }) },
                ],
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
