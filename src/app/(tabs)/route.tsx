// Вкладка «Маршрут»: этапы, карта, список точек, мини-коллекция.
// Читать можно любую точку. Задания проходятся по порядку. Этап II открывается после этапа I.
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArtifactIcon, FalconMark } from '../../components/Icons';
import { RouteMap } from '../../components/RouteMap';
import { H, Kicker, Screen, Tag } from '../../components/ui';
import { artifactList, content, Point, stagePoints } from '../../content';
import { roman } from '../../i18n';
import { PointStatus, useGame } from '../../state/game';

export default function RouteTab() {
  const { pal, f, t, tOpt, p, pointStatus, isStageUnlocked, currentStage, dir, num } = useGame();
  const cur = currentStage();
  const open = (id: number) => router.push(`/point/${id}`);

  // показываем сначала текущий этап, затем остальные
  const ordered = [...content.stages].sort((a, b) => (a.id === cur?.id ? -1 : b.id === cur?.id ? 1 : 0));

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <FalconMark size={30} />
        <Text style={{ flex: 1, fontFamily: f.display, fontSize: 17, color: pal.ink }}>{t('ui.title')}</Text>
        <Text style={{ color: pal.gold, fontWeight: '700', fontSize: 15 }}>{num(p.score)} ★</Text>
      </View>
      {ordered.map((st) => {
        const idx = content.stages.findIndex((s) => s.id === st.id);
        const pts = stagePoints(st);
        const unlocked = isStageUnlocked(st.id);
        const name = tOpt(st.nameKey);
        const finished = p.finishedStages.includes(st.id);
        return (
          <View key={st.id} style={{ marginTop: 18 }} testID={`stage-${st.id}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Kicker>{roman(idx + 1)}</Kicker>
              {!name ? <Tag label={t('ui.soon')} /> : null}
              {finished ? <Tag label={`✓ ${t('ui.done')}`} color={pal.gold} /> : null}
              {!unlocked ? <Tag label={`🔒 ${t('ui.ahead')}`} /> : null}
            </View>
            {name ? (
              <H size={22} style={{ marginTop: 4 }}>
                {name}
              </H>
            ) : null}
            <RouteMap stageIndex={idx} points={pts} statusOf={pointStatus} onOpen={open} locked={!unlocked} />
            <View style={{ gap: 8, marginTop: 12 }}>
              {pts.map((pt, i) => (
                <PointRow key={pt.id} pt={pt} n={i + 1} status={pointStatus(pt.id)} onPress={() => open(pt.id)} />
              ))}
            </View>
            {finished ? (
              <Pressable onPress={() => router.push(`/finish/${st.id}`)} style={{ minHeight: 48, justifyContent: 'center', marginTop: 4 }}>
                <Text style={{ color: pal.gold, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700', fontSize: 14 }}>
                  ★ {t('ui.finish_btn')} {dir.fwd}
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}

      {/* мини-коллекция */}
      <Pressable
        onPress={() => router.push('/finds')}
        accessibilityRole="button"
        style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 18 }}
      >
        <Text style={{ color: pal.muted, fontSize: 13, fontFamily: f.body }}>
          {t('ui.collection')} · {num(p.found.length)}/{num(artifactList.length)}
        </Text>
        {artifactList.map((a) => {
          const has = p.found.includes(a.id);
          return (
            <View
              key={a.id}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                borderWidth: 1.5,
                borderStyle: has ? 'solid' : 'dashed',
                borderColor: has ? pal.gold : pal.line,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pal.panel,
              }}
            >
              {has ? <ArtifactIcon icon={a.icon} size={26} /> : null}
            </View>
          );
        })}
      </Pressable>
    </Screen>
  );
}

function PointRow({ pt, n, status, onPress }: { pt: Point; n: number; status: PointStatus; onPress: () => void }) {
  const { pal, f, t, tOpt, num } = useGame();
  const name = tOpt(pt.nameKey);
  const era = pt.era === 'today' ? t('ui.today') : pt.era;
  const numBg = status === 'done' ? pal.gold : 'transparent';
  const numBorder = status === 'done' ? pal.gold : status === 'current' ? pal.varya : pal.line;
  const numColor = status === 'done' ? pal.goldInk : status === 'current' ? pal.varya : pal.muted;
  const stLabel =
    status === 'done' ? `✓ ${t('ui.done')}` : status === 'current' ? t('ui.you_are_here') : t('ui.ahead');
  const stColor = status === 'done' ? pal.gold : status === 'current' ? pal.varya : pal.muted;
  return (
    <Pressable
      testID={`point-row-${pt.id}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: pal.panel,
        borderWidth: 1.5,
        borderColor: status === 'current' ? pal.varya : pal.line,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 60,
        opacity: pressed ? 0.85 : status === 'ahead' ? 0.8 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          borderWidth: 2,
          borderColor: numBorder,
          backgroundColor: numBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: numColor, fontWeight: '700', fontSize: 15 }}>{num(n)}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={{ color: pal.ink, fontSize: 15, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700' }}>
          {name ?? t('ui.soon')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Text style={{ color: pal.muted, fontSize: 12.5, fontFamily: f.body }}>{era}</Text>
          {!pt.ready && name ? <Tag label={t('ui.soon')} /> : null}
        </View>
      </View>
      <Text style={{ color: stColor, fontSize: 12, fontWeight: '700', fontFamily: f.bold }}>{stLabel}</Text>
    </Pressable>
  );
}
