// Экран точки маршрута: виньетка → рассказы по слоям → предания → подсказка на месте → «сегодня» →
// задание (3 варианта, очки 100/60/30) → находки → дальше.
// Если чего-то из текстов ещё нет в content.json — показываем карточку «готовится», ничего не выдумываем.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Image, Pressable, Text, View, type ScrollViewInstance } from 'react-native';
import { ArtifactIcon, SpeakerIcon } from '../../components/Icons';
import { TopBar } from '../../components/TopBar';
import { Btn, Card, Expander, H, Kicker, LayerChip, P, Screen, Tag } from '../../components/ui';
import { Vignette } from '../../components/Vignette';
import { Beat, content, getPoint, getStage, Point, stagePoints } from '../../content';
import { hasKey, paragraphs, storyText } from '../../i18n';
import { AUDIO_MANIFEST, audioBaseUrl, canPlayAudio, playAudio, resolveAudio } from '../../i18n/audio';
import { PORTRAITS } from '../../portraits';
import { useGame } from '../../state/game';
import { Open3DButton } from '../../unity/Open3DButton';
import { UnitySlot } from '../../unity/UnitySlot';

export function generateStaticParams(): { id: string }[] {
  return content.points.map((p) => ({ id: String(p.id) }));
}

export default function PointScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pt = getPoint(Number(id));
  const { t } = useGame();
  if (!pt) {
    return (
      <Screen header={<TopBar title={t('ui.title')} backLabel={t('ui.back')} />}>
        <Card>
          <Tag label={t('ui.soon')} />
        </Card>
      </Screen>
    );
  }
  return <PointView key={pt.id} pt={pt} />;
}

function PointView({ pt }: { pt: Point }) {
  const { pal, f, t, tOpt, p, pointStatus, completePoint, lang, voice, dir } = useGame();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const status = pointStatus(pt.id);
  const name = tOpt(pt.nameKey);
  const era = pt.era === 'today' ? t('ui.today') : pt.era;

  const quiz = pt.quiz && hasKey(pt.quiz.q) && pt.quiz.options.length > 0 ? pt.quiz : null;
  const [tries, setTries] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [gained, setGained] = useState<number | null>(null); // очки за верный ответ в этом заходе
  const [justDone, setJustDone] = useState(false);
  const [stageFinished, setStageFinished] = useState<number | null>(null);

  const done = status === 'done';

  const finish = (pts: number) => {
    const res = completePoint(pt.id, pts);
    setJustDone(true);
    setStageFinished(res.stageFinished);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  const answer = (i: number) => {
    if (!quiz || gained !== null) return;
    if (i === quiz.correct) {
      const pts = tries === 0 ? 100 : tries === 1 ? 60 : 30;
      setGained(pts);
      finish(pts);
    } else {
      setTries((x) => x + 1);
      setWrong((w) => [...w, i]);
    }
  };

  // куда вести после точки
  const stage = getStage(pt.stage);
  const next = () => {
    if (stageFinished !== null) {
      router.replace(`/finish/${stageFinished}`);
      return;
    }
    const nextPt = stage ? stagePoints(stage).find((x) => !p.done.includes(x.id)) : undefined;
    if (nextPt && justDone) router.replace(`/point/${nextPt.id}`);
    else router.canGoBack() ? router.back() : router.replace('/route');
  };
  const nextLabel = stageFinished !== null ? t('ui.finish_btn') : justDone ? t('ui.next') : t('ui.back');

  return (
    <Screen scrollRef={scrollRef} header={<TopBar title={name ?? t('ui.title')} backLabel={t('ui.back')} />}>
      <UnitySlot pointId={pt.id} era={pt.era} lang={lang} voice={voice} />
      <Vignette kind={pt.scene} era={era} title={name ?? t('ui.soon')} note={tOpt('ui.reconstruction')} />
      {/* «вариант Э»: отдельное 3D-приложение по ссылке; схема в app.json пустая — кнопки нет */}
      <Open3DButton pointId={pt.id} />

      {!pt.ready ? (
        <Card>
          <Tag label={t('ui.soon')} />
        </Card>
      ) : null}

      {pt.beats.map((b) => (
        <BeatCard key={b.key} beat={b} pointEra={pt.era} />
      ))}

      {pt.legends.length > 0 ? (
        <View style={{ marginTop: 18 }}>
          <H size={19}>{t('ui.legend')}</H>
          {pt.legends.map((b) => (
            <BeatCard key={b.key} beat={b} pointEra={pt.era} legend />
          ))}
        </View>
      ) : null}

      {/* подсказка «где это» — только в режиме «я на месте» */}
      {p.mode === 'here' && tOpt(pt.hintKey) ? (
        <View
          style={{
            marginTop: 12,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: pal.varya,
            backgroundColor: pal.dark ? '#14302A' : '#E4EFEA',
            padding: 14,
          }}
        >
          <Kicker color={pal.varya}>{t('ui.here')}</Kicker>
          <P style={{ marginTop: 4, fontSize: 14.5 }}>{tOpt(pt.hintKey)}</P>
        </View>
      ) : null}

      {tOpt(pt.todayKey) ? (
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <Kicker color={pal.muted} style={{ marginTop: 4 }}>
            {t('ui.today')}
          </Kicker>
          <P style={{ flex: 1, fontSize: 14.5 }}>{tOpt(pt.todayKey)}</P>
        </View>
      ) : null}

      {/* задание */}
      {status === 'ahead' ? (
        <Card>
          <Tag label={`🔒 ${t('ui.ahead')}`} />
        </Card>
      ) : null}

      {quiz && (status === 'current' || gained !== null) ? (
        <Card>
          <H>{t('ui.task')}</H>
          <P bold style={{ marginTop: 6, fontSize: 16 }} testID="quiz-question">
            {t(quiz.q)}
          </P>
          <View style={{ gap: 8, marginTop: 12 }}>
            {quiz.options.map((o, i) => {
              const isWrong = wrong.includes(i);
              const isRight = gained !== null && i === quiz.correct;
              return (
                <Pressable
                  key={i}
                  testID={`opt-${i}`}
                  accessibilityRole="button"
                  disabled={isWrong || gained !== null}
                  onPress={() => answer(i)}
                  style={{
                    minHeight: 48,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: isRight ? pal.ok : isWrong ? pal.bad : pal.line,
                    backgroundColor: isRight ? (pal.dark ? '#16352E' : '#E2EEE9') : isWrong ? (pal.dark ? '#3A2420' : '#F5E4DF') : 'transparent',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    justifyContent: 'center',
                    opacity: isWrong ? 0.75 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: pal.ink,
                      fontSize: 15,
                      fontFamily: isRight ? f.bold : f.body,
                      fontWeight: isRight && !f.bold ? '700' : undefined,
                      // варианты — числа: в письме справа налево прижимаем к началу строки (справа)
                      textAlign: dir.end === 'left' ? 'right' : 'left',
                    }}
                  >
                    {o}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {gained !== null ? (
            <View style={{ marginTop: 10 }} accessibilityLiveRegion="polite">
              <Text style={{ color: pal.gold, fontWeight: '700', fontSize: 15 }}>+{gained} ★</Text>
              {tOpt(quiz.r) ? <P style={{ marginTop: 4, fontSize: 14.5 }}>{tOpt(quiz.r)}</P> : null}
            </View>
          ) : wrong.length > 0 ? (
            <P style={{ marginTop: 10, fontSize: 14.5, color: pal.bad }} accessibilityLiveRegion="polite">
              {t('ui.wrong')}
            </P>
          ) : null}
        </Card>
      ) : null}

      {/* без задания: «Дальше» засчитывает точку */}
      {!quiz && status === 'current' && !justDone ? (
        <Btn testID="continue" label={t('ui.continue')} onPress={() => finish(0)} style={{ marginTop: 14 }} />
      ) : null}

      {/* находки */}
      {done || justDone ? (
        <View style={{ marginTop: 6 }}>
          {pt.artifacts.map((aid) => (
            <FindCard key={aid} id={aid} fresh={justDone} />
          ))}
          <Btn testID="next" label={nextLabel} onPress={next} style={{ marginTop: 14 }} />
        </View>
      ) : null}
    </Screen>
  );
}

function BeatCard({ beat, pointEra, legend }: { beat: Beat; pointEra: string; legend?: boolean }) {
  const { pal, f, t, tOpt, lang, voice } = useGame();
  const text = storyText(beat.key, lang);
  // озвучка: фирменный голос рассказчика квеста — Александр (ТЗ 7.0); нет файла в манифесте — кнопки нет
  const audio = canPlayAudio() ? resolveAudio(AUDIO_MANIFEST, beat.key, voice, lang, audioBaseUrl(), 'aleksandr') : null;
  const portrait = PORTRAITS[beat.speaker];
  const speaker = tOpt(beat.speaker);
  const layerLabel = beat.layer === 'doc' ? t('layer.doc') : beat.layer === 'sci' ? t('layer.sci') : t('ui.legend');
  const src = legend ? content.legends[beat.key]?.dispute : content.texts[beat.key]?.source;
  const beatEra = beat.era && beat.era !== pointEra ? (beat.era === 'today' ? t('ui.today') : beat.era) : null;

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {portrait ? (
          <View style={{ alignItems: 'center' }}>
            <Image
              source={portrait}
              accessibilityLabel={speaker ?? ''}
              style={{ width: 56, height: 70, borderRadius: 8, borderWidth: 1, borderColor: pal.line }}
              resizeMode="cover"
            />
          </View>
        ) : (
          <SpeakerIcon layer={beat.layer} />
        )}
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={{ color: pal.ink, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700', fontSize: 15 }}>{speaker ?? t('ui.soon')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <LayerChip layer={beat.layer} label={layerLabel} />
            {beatEra ? <Text style={{ color: pal.muted, fontSize: 12, fontFamily: f.body }}>{beatEra}</Text> : null}
          </View>
          {portrait ? <Text style={{ color: pal.muted, fontSize: 11, fontFamily: f.body }}>{t('ui.portrait')}</Text> : null}
        </View>
      </View>
      <View style={{ marginTop: 10, gap: 10 }}>
        {text ? (
          paragraphs(text).map((par, i) => <P key={i}>{par}</P>)
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <Tag label={t('ui.soon')} />
          </View>
        )}
      </View>
      {audio ? (
        <Btn testID={`listen-${beat.key}`} kind="ghost" label={`▶ ${t('ui.listen')}`} onPress={() => playAudio(audio.url)} style={{ marginTop: 10 }} />
      ) : null}
      {text && src ? (
        <Expander title={t('ui.source')}>
          <Text style={{ color: pal.muted, fontSize: 12.5, lineHeight: 19, fontFamily: f.body }}>{src}</Text>
        </Expander>
      ) : null}
    </Card>
  );
}

function FindCard({ id, fresh }: { id: string; fresh: boolean }) {
  const { pal, f, t, tOpt } = useGame();
  const a = content.artifacts[id];
  if (!a) return null;
  const nameTxt = tOpt(a.nameKey);
  const desc = tOpt(a.descKey);
  const kind = tOpt(`ui.kind_${a.kind}`);
  return (
    <View
      testID={`find-${id}`}
      style={{
        marginTop: 12,
        backgroundColor: pal.panel,
        borderWidth: 2,
        borderColor: pal.gold,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
      }}
    >
      <ArtifactIcon icon={a.icon} size={64} />
      <Kicker style={{ marginTop: 8 }}>{fresh ? t('ui.new_find') : t('ui.found')}</Kicker>
      <Text style={{ fontFamily: f.display, fontSize: 18, color: pal.ink, marginTop: 4, textAlign: 'center' }}>{nameTxt ?? t('ui.soon')}</Text>
      {kind ? <Text style={{ color: pal.muted, fontSize: 12, marginTop: 2, fontFamily: f.body }}>{kind}</Text> : null}
      {desc ? <P muted style={{ fontSize: 13.5, lineHeight: 20, marginTop: 6, textAlign: 'center' }}>{desc}</P> : null}
    </View>
  );
}
