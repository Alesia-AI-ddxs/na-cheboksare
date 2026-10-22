// Финал этапа: звание, очки, находки этапа, свидетельство с кодом и датой, Сетнер, «поделиться», конфетти.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Confetti } from '../../components/Confetti';
import { ArtifactIcon } from '../../components/Icons';
import { TopBar } from '../../components/TopBar';
import { Btn, Card, H, Kicker, P, Screen } from '../../components/ui';
import { content, getStage, stagePoints } from '../../content';
import { formatDate, rankKey } from '../../i18n';
import { setnerLink } from '../../setnerLink';
import { openUrl, shareText } from '../../share';
import { useGame } from '../../state/game';

export function generateStaticParams(): { stage: string }[] {
  return content.stages.map((s) => ({ stage: String(s.id) }));
}


export default function FinishScreen() {
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const st = getStage(Number(stage));
  const { pal, f, t, tOpt, p, lang, voice, isStageUnlocked, dir, num } = useGame();
  const [shared, setShared] = useState<string | null>(null);
  if (!st) return null;

  const idx = content.stages.findIndex((s) => s.id === st.id);
  const isFirst = idx === 0;
  // Заголовок/текст для поделиться: ui.finish_title_<id> → (для первого этапа) ui.finish_title → название этапа.
  const title = tOpt(`ui.finish_title_${st.id}`) ?? (isFirst ? t('ui.finish_title') : tOpt(st.nameKey) ?? t('ui.found'));
  const share = tOpt(`ui.share_text_${st.id}`) ?? (isFirst ? t('ui.share_text') : title);
  const pts = stagePoints(st);
  const doneCount = pts.filter((x) => p.done.includes(x.id)).length;
  const stageArtifacts = Array.from(
    new Set([...pts.flatMap((x) => x.artifacts), ...(st.finishArtifact ? [st.finishArtifact] : []), ...pts.map((x) => x.stageFinish ?? '')]),
  ).filter((a) => a && content.artifacts[a] && p.found.includes(a));
  const nextStage = content.stages[idx + 1];
  const finished = p.finishedStages.includes(st.id);
  const tg = setnerLink(content.links.setnerTelegram, p.code, lang, voice);

  return (
    <View style={{ flex: 1 }}>
      <Screen header={<TopBar title={t('ui.title')} backLabel={t('ui.back')} onBack={() => router.replace('/route')} />}>
        <View style={{ alignItems: 'center', paddingTop: 24, paddingHorizontal: 8 }}>
          <Kicker style={{ letterSpacing: f.spacing ? 2 : 0 }}>{t(rankKey(p.score))}</Kicker>
          <H size={26} style={{ marginTop: 6, textAlign: 'center' }} testID="finish-title">
            {title}
          </H>
          <P muted style={{ marginTop: 8, textAlign: 'center', fontSize: 14.5 }}>
            {t('ui.finish_text')}
          </P>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: f.display, fontSize: 24, color: pal.ink }}>
                {num(doneCount)}/{num(pts.length)}
              </Text>
              <Text style={{ color: pal.muted, fontSize: 12, fontFamily: f.body }}>{t('ui.points')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: f.display, fontSize: 24, color: pal.gold }}>{num(p.score)} ★</Text>
            </View>
          </View>
          {/* «Вы нашли N находок» — ICU, склонение по правилам языка */}
          <P testID="finish-found" style={{ marginTop: 10, textAlign: 'center', fontSize: 15 }}>
            {t('finds.you_found', { count: p.found.length })}
          </P>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          {stageArtifacts.map((aid) => {
            const a = content.artifacts[aid];
            return (
              <View
                key={aid}
                style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: pal.panel, borderWidth: 1.5, borderColor: pal.gold, borderRadius: 14, padding: 12, alignItems: 'center' }}
              >
                <ArtifactIcon icon={a.icon} size={44} />
                <Text style={{ fontFamily: f.display, fontSize: 13.5, color: pal.ink, textAlign: 'center', marginTop: 4 }}>{tOpt(a.nameKey) ?? t('ui.soon')}</Text>
              </View>
            );
          })}
        </View>

        {/* свидетельство */}
        <Card style={{ borderWidth: 2, borderColor: pal.gold, alignItems: 'center' }}>
          <Kicker color={pal.muted}>{t('ui.title')}</Kicker>
          <Text style={{ fontFamily: f.display, fontSize: 19, color: pal.ink, marginTop: 4, textAlign: 'center' }}>{tOpt(st.nameKey) ?? title}</Text>
          <Text style={{ marginTop: 8, color: pal.muted, fontSize: 13, fontFamily: f.body }}>
            {t('ui.code')}: <Text style={{ fontWeight: '700', color: pal.ink, fontSize: 16, letterSpacing: 1.6 }}>{p.code}</Text>
          </Text>
          <Text style={{ marginTop: 4, color: pal.muted, fontSize: 13, fontFamily: f.body }}>{formatDate(p.completedAt[String(st.id)] ? new Date(p.completedAt[String(st.id)]) : new Date(), lang)}</Text>
        </Card>

        <View style={{ gap: 10, marginTop: 14 }}>
          <Btn kind="volga" label={t('ui.to_bot')} onPress={() => openUrl(tg)} />
          <Btn
            kind="ghost"
            label={shared === 'copied' ? `✓ ${t('ui.share')}` : t('ui.share')}
            onPress={async () => setShared(await shareText(`${share}\n${t('ui.code')}: ${p.code}`))}
          />
          {nextStage && finished && isStageUnlocked(nextStage.id) ? (
            <Btn
              label={`${t('ui.continue')} ${dir.fwd}${tOpt(nextStage.nameKey) ? ` ${tOpt(nextStage.nameKey)}` : ''}`}
              onPress={() => {
                const first = stagePoints(nextStage)[0];
                router.replace(first ? `/point/${first.id}` : '/route');
              }}
            />
          ) : null}
        </View>
      </Screen>
      <Confetti run={finished} />
    </View>
  );
}
