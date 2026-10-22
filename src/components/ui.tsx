// Базовые «кирпичики» интерфейса: экран, карточка, кнопка, метка слоя, текст.
import React from 'react';
import {
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../state/game';
import { MAX_W, radius, TOUCH } from '../theme';
import type { Layer } from '../content';

export function Screen({
  children,
  header,
  scrollRef,
  bottomInset = true,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
  bottomInset?: boolean;
}) {
  const { pal } = useGame();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: pal.paper, paddingTop: insets.top }}>
      {header}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: (bottomInset ? insets.bottom : 0) + 32,
          width: '100%',
          maxWidth: MAX_W,
          alignSelf: 'center',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { pal } = useGame();
  return (
    <View
      style={[
        { backgroundColor: pal.panel, borderColor: pal.line, borderWidth: 1, borderRadius: radius.card, padding: 16, marginTop: 12 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Обычный текст (PT Sans). */
export function P({ style, bold, muted, ...rest }: TextProps & { bold?: boolean; muted?: boolean }) {
  const { pal, f } = useGame();
  return (
    <Text
      {...rest}
      style={[
        {
          color: muted ? pal.muted : pal.ink,
          fontFamily: bold ? f.bold : f.body,
          fontWeight: bold && !f.bold ? '700' : undefined,
          fontSize: 15.5,
          lineHeight: 24,
        },
        style,
      ]}
    />
  );
}

/** Заголовок (Prata). */
export function H({ style, size = 17, ...rest }: TextProps & { size?: number }) {
  const { pal, f } = useGame();
  return (
    <Text
      {...rest}
      accessibilityRole="header"
      style={[{ color: pal.ink, fontFamily: f.display, fontSize: size, lineHeight: Math.round(size * 1.3) }, style]}
    />
  );
}

/** Маленькая подпись капителью. */
export function Kicker({ children, color, style }: { children: React.ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  const { pal, f } = useGame();
  return (
    <Text
      style={[
        {
          fontSize: 11,
          letterSpacing: f.spacing ? 1.4 : 0,
          textTransform: 'uppercase',
          color: color ?? pal.gold,
          fontFamily: f.bold,
          fontWeight: f.bold ? undefined : '700',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

type BtnKind = 'gold' | 'volga' | 'ghost';
export function Btn({
  label,
  onPress,
  kind = 'gold',
  disabled,
  style,
  icon,
  testID,
}: {
  label: string;
  onPress?: () => void;
  kind?: BtnKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  testID?: string;
}) {
  const { pal, f } = useGame();
  const bg = kind === 'gold' ? pal.gold : kind === 'volga' ? pal.volgaBtn : 'transparent';
  const fg = kind === 'gold' ? pal.goldInk : kind === 'volga' ? '#FFFFFF' : pal.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: TOUCH,
          borderRadius: radius.btn,
          backgroundColor: bg,
          borderWidth: kind === 'ghost' ? 1.5 : 0,
          borderColor: pal.line,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          color: fg,
          fontFamily: f.bold,
          fontWeight: f.bold ? undefined : '700',
          fontSize: 15,
          textAlign: 'center',
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Метка слоя достоверности: документ / наука / предание. */
export function LayerChip({ layer, label }: { layer: Layer; label: string }) {
  const { pal, f } = useGame();
  const bg = layer === 'doc' ? pal.docChip : layer === 'sci' ? pal.gold : pal.legChip;
  const fg = layer === 'sci' ? pal.goldInk : '#FFFFFF';
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: bg, borderRadius: radius.chip, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text
        style={{
          color: fg,
          fontSize: 10.5,
          letterSpacing: f.spacing ? 0.8 : 0,
          textTransform: 'uppercase',
          fontFamily: f.bold,
          fontWeight: f.bold ? undefined : '700',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Нейтральная метка («готовится», «пройдено» и т.п.). */
export function Tag({ label, color, filled }: { label: string; color?: string; filled?: boolean }) {
  const { pal, f } = useGame();
  const c = color ?? pal.muted;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: radius.chip,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: c,
        backgroundColor: filled ? c : 'transparent',
      }}
    >
      <Text
        style={{
          color: filled ? pal.goldInk : c,
          fontSize: 11,
          fontFamily: f.bold,
          fontWeight: f.bold ? undefined : '700',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Раскрывающийся блок («Откуда это известно»). */
export function Expander({ title, children, initiallyOpen = false }: { title: string; children: React.ReactNode; initiallyOpen?: boolean }) {
  const { pal, f, dir } = useGame();
  const [open, setOpen] = React.useState(initiallyOpen);
  return (
    <View style={{ marginTop: 10, borderTopWidth: 1, borderStyle: 'dashed', borderColor: pal.line, paddingTop: 4 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={{ minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <Text style={{ color: pal.muted, fontSize: 13, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700' }}>
          {open ? dir.collapse : dir.expand} {title}
        </Text>
      </Pressable>
      {open ? <View style={{ paddingBottom: 4 }}>{children}</View> : null}
    </View>
  );
}

export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
