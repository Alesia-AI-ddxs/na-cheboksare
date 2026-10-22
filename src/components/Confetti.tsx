// Лёгкое конфетти: золотые/зелёные/синие точки падают ~3 секунды.
// Если в системе включено «уменьшить движение» — не показываем вовсе.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Platform, View } from 'react-native';

const COLORS = ['#B98A2B', '#2E7D6B', '#1C3D5A', '#E8D9B0'];

export function Confetti({ run }: { run: boolean }) {
  const [reduce, setReduce] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');

  const dots = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * 0.35,
        size: 5 + Math.random() * 6,
        drift: -30 + Math.random() * 60,
        color: COLORS[i % COLORS.length],
      })),
    [width],
  );

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => alive && setReduce(r))
      .catch(() => alive && setReduce(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!run || reduce) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 3200,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [run, reduce, progress]);

  if (!run || reduce) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      {dots.map((d, i) => {
        const translateY = progress.interpolate({
          inputRange: [0, d.delay, 1],
          outputRange: [-20, -20, height + 20],
        });
        const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, d.drift] });
        const opacity = progress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: d.x,
              top: 0,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
              backgroundColor: d.color,
              opacity,
              transform: [{ translateY }, { translateX }],
            }}
          />
        );
      })}
    </View>
  );
}
