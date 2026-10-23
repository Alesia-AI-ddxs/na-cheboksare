// «Лаборатория замеров» (v1.2.0, волна 0) — СКРЫТЫЙ служебный экран для владельца и тестировщиков, не для гостей.
// Вход: 7 касаний подряд по строке «версия содержания» во вкладке «О проекте» (src/app/(tabs)/about.tsx)
// или ссылка nacheboksare://lab (схема из app.json). В меню и на других экранах ссылок на него нет.
// Что меряет: устройство, холодный старт, 2D-нагрузку, 3D-нагрузку по бюджету 3D-актива (≤20 тыс. треугольников, текстура 2K)
// и выдаёт итог «зелёный / жёлтый / красный» по правилу владельца (src/lab/thresholds.ts).
// Без интернета, без разрешений, ничего не сохраняет: отчёт живёт только на этом экране (скопировать / поделиться).
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { TopBar } from '../components/TopBar';
import { Btn, Card, H, P, Screen } from '../components/ui';
import { content, getPoint } from '../content';
import { Bench2D } from '../lab/Bench2D';
import { Bench3D, Bench3DGuard, unavailable3D } from '../lab/Bench3D';
import { LAB_CONFIG } from '../lab/config';
import { collectDeviceInfo } from '../lab/device';
import { buildReport, labVerdict, round1, type DeviceInfo, type Result2D, type Result3D, type Verdict } from '../lab/report';
import { startupTimes } from '../lab/startup';
import { LAB_THRESHOLDS } from '../lab/thresholds';
import { shareText } from '../share';
import { useGame } from '../state/game';

type Phase = '2d' | '3d';

export default function LabScreen() {
  const { pal, f, t, num, p, lang } = useGame();
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [start, setStart] = useState<{ jsToScreenMs: number | null; originToScreenMs: number | null }>({ jsToScreenMs: null, originToScreenMs: null });
  const [queue, setQueue] = useState<Phase[]>([]);
  const [r2d, setR2d] = useState<Result2D | null>(null);
  const [r3d, setR3d] = useState<Result3D | null>(null);
  const [stage3d, setStage3d] = useState(0);
  const [copied, setCopied] = useState(false);
  const phase = queue[0];
  const running = queue.length > 0;

  // сведения об устройстве и старте — после показа экрана (в заранее собранной веб-странице их нет)
  useEffect(() => {
    setDevice(collectDeviceInfo());
    setStart(startupTimes());
  }, []);

  // экран не гаснет, пока идёт замер (без разрешений: флаг «не гасить экран» у окна приложения)
  useEffect(() => {
    if (!running) return;
    activateKeepAwakeAsync('lab').catch(() => undefined);
    return () => {
      deactivateKeepAwake('lab').catch(() => undefined);
    };
  }, [running]);

  // текущая точка маршрута — её виньетка идёт фоном 2D-замера
  const scene = useMemo(() => {
    const ids = content.stages.flatMap((s) => s.points);
    const id = ids.find((x) => !p.done.includes(x)) ?? ids[0];
    return getPoint(id)?.scene ?? 'night';
  }, [p.done]);

  const next = useCallback(() => setQueue((q) => q.slice(1)), []);
  const run = (what: Phase[]) => {
    setCopied(false);
    if (what.includes('2d')) setR2d(null);
    if (what.includes('3d')) {
      setR3d(null);
      setStage3d(0);
    }
    setQueue(what);
  };

  const noData = t('lab.no_data');
  const fmt = (x: number | null | undefined, unit?: string) => {
    if (typeof x !== 'number' || !Number.isFinite(x)) return noData;
    const s = num(round1(x));
    return unit ? t(unit, { value: s }) : s;
  };
  const txt = (x: string | null | undefined) => (x && String(x).trim() ? String(x) : noData);

  const version = String(Constants.expoConfig?.version ?? '');
  const report = device
    ? buildReport({ appVersion: version, contentVersion: content.contentVersionNumber ?? '', appLang: lang, device, start, r2d, r3d }, new Date())
    : '';
  const v: Verdict = labVerdict({ r3d });
  const vColor = v === 'green' ? pal.ok : v === 'yellow' ? pal.gold : v === 'red' ? pal.bad : pal.muted;

  const Row = ({ label, value, testID }: { label: string; value: string; testID?: string }) => (
    <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 5, borderTopWidth: 1, borderColor: pal.line }}>
      <Text style={{ flex: 1, color: pal.muted, fontSize: 13.5, fontFamily: f.body }}>{label}</Text>
      <Text testID={testID} style={{ flexShrink: 1, color: pal.ink, fontSize: 13.5, fontFamily: f.bold, fontWeight: f.bold ? undefined : '700' }}>
        {value}
      </Text>
    </View>
  );

  const d = device;
  const screen =
    d?.screenDp && d.pixelRatio
      ? `${num(Math.round(d.screenDp.w))}×${num(Math.round(d.screenDp.h))} · ×${num(round1(d.pixelRatio))}`
      : noData;

  return (
    <Screen
      header={
        <TopBar title={t('lab.title')} backLabel={t('ui.back')} onBack={() => (router.canGoBack() ? router.back() : router.replace('/about'))} />
      }
    >
      {Platform.OS === 'web' ? (
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      ) : null}
      <Card>
        <H testID="lab-title">{t('lab.title')}</H>
        <P style={{ fontSize: 14, marginTop: 6 }}>{t('lab.intro')}</P>
      </Card>

      {/* а) устройство */}
      <Card>
        <H>{t('lab.section_device')}</H>
        <View style={{ marginTop: 8 }}>
          <Row label={t('lab.maker')} value={txt(d?.manufacturer)} />
          <Row label={t('lab.model')} value={txt(d?.model)} />
          <Row label={t('lab.os')} value={txt(d?.os)} />
          <Row label={t('lab.ram')} value={fmt(d?.ramMb, 'lab.unit_mb')} testID="lab-ram" />
          <Row label={t('lab.year_class')} value={fmt(d?.yearClass)} />
          <Row label={t('lab.cpu')} value={txt([d?.cpuArch, d?.cpuCores ? `×${num(d.cpuCores)}` : null].filter(Boolean).join(' '))} />
          <Row label={t('lab.disk_free')} value={fmt(d?.diskFreeMb, 'lab.unit_mb')} testID="lab-disk" />
          <Row label={t('lab.screen')} value={screen} />
          <Row label={t('lab.phone_lang')} value={txt([d?.phoneLocale, d?.phoneRegion].filter(Boolean).join(' · '))} />
        </View>
      </Card>

      {/* б) холодный старт */}
      <Card>
        <H>{t('lab.section_start')}</H>
        <P muted style={{ fontSize: 13, marginTop: 4 }}>{t('lab.start_hint')}</P>
        <Row label={t('lab.start_js')} value={fmt(start.jsToScreenMs, 'lab.unit_ms')} testID="lab-start" />
      </Card>

      {/* запуск */}
      <View style={{ gap: 10, marginTop: 14 }}>
        <Btn testID="lab-run-all" label={t('lab.run_all', { seconds: num(Math.round(((1 + LAB_CONFIG.stages3d.length) * LAB_CONFIG.stageMs) / 1000)) })} disabled={running} onPress={() => run(['2d', '3d'])} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn testID="lab-run-2d" kind="ghost" label={t('lab.run_2d')} disabled={running} onPress={() => run(['2d'])} style={{ flex: 1 }} />
          <Btn testID="lab-run-3d" kind="ghost" label={t('lab.run_3d')} disabled={running} onPress={() => run(['3d'])} style={{ flex: 1 }} />
        </View>
        {running ? (
          <P bold testID="lab-running" style={{ color: pal.gold }} accessibilityLiveRegion="polite">
            {t('lab.running')}
          </P>
        ) : null}
      </View>

      {/* в) 2D-нагрузка */}
      <Card>
        <H>{t('lab.section_2d')}</H>
        <P muted style={{ fontSize: 13, marginTop: 4 }}>{t('lab.hint_2d', { count: num(LAB_CONFIG.elements2d), seconds: num(LAB_CONFIG.stageMs / 1000) })}</P>
        {phase === '2d' ? (
          <Bench2D
            scene={scene}
            color={pal.gold}
            onDone={(r) => {
              setR2d(r);
              next();
            }}
          />
        ) : null}
        {r2d ? (
          <View style={{ marginTop: 8 }} testID="lab-2d-result">
            <Row label={t('lab.fps_avg')} value={fmt(r2d.stats?.avg, 'lab.unit_fps')} />
            <Row label={t('lab.fps_min')} value={fmt(r2d.stats?.min, 'lab.unit_fps')} />
            <Row label={t('lab.heavy', { ms: num(LAB_THRESHOLDS.heavyFrameMs) })} value={fmt(r2d.stats?.heavyPct, 'lab.unit_pct')} />
          </View>
        ) : phase !== '2d' ? (
          <P muted style={{ fontSize: 13, marginTop: 6 }}>{t('lab.not_run')}</P>
        ) : null}
      </Card>

      {/* г) 3D-нагрузка = бюджет 3D-актива */}
      <Card>
        <H>{t('lab.section_3d')}</H>
        <P muted style={{ fontSize: 13, marginTop: 4 }}>
          {t('lab.hint_3d', {
            tris: num(LAB_CONFIG.sphereSegments * LAB_CONFIG.sphereSegments * 2),
            tex: num(LAB_CONFIG.textureSize),
            seconds: num(LAB_CONFIG.stageMs / 1000),
          })}
        </P>
        {phase === '3d' ? (
          <>
            <P bold style={{ fontSize: 13.5, marginTop: 6 }} testID="lab-3d-stage">
              {t('lab.stage', {
                n: num(stage3d + 1),
                objects: num(LAB_CONFIG.stages3d[stage3d] ?? 0),
                tris: num((LAB_CONFIG.stages3d[stage3d] ?? 0) * LAB_CONFIG.sphereSegments * LAB_CONFIG.sphereSegments * 2),
              })}
            </P>
            <Bench3DGuard
              onFail={(msg) => {
                setR3d(unavailable3D(msg));
                next();
              }}
            >
              <Bench3D
                onStage={setStage3d}
                onDone={(r) => {
                  setR3d(r);
                  next();
                }}
              />
            </Bench3DGuard>
          </>
        ) : null}
        {r3d ? (
          <View style={{ marginTop: 8 }} testID="lab-3d-result">
            {!r3d.available || r3d.errorText ? (
              <P style={{ color: pal.bad, fontSize: 13.5 }} testID="lab-3d-error">
                {t('lab.gl_unavailable')}
                {r3d.errorText ? ` · ${r3d.errorText}` : ''}
              </P>
            ) : null}
            <Row label={t('lab.gpu')} value={txt(r3d.renderer)} />
            <Row label={t('lab.canvas')} value={r3d.canvasPx ? `${num(r3d.canvasPx.w)}×${num(r3d.canvasPx.h)}` : noData} />
            <Row label={t('lab.setup')} value={fmt(r3d.setupMs, 'lab.unit_ms')} />
            {r3d.stages.map((s, i) => (
              <View key={i} style={{ marginTop: 8 }} testID={`lab-3d-s${i + 1}`}>
                <P bold style={{ fontSize: 13.5 }}>
                  {t('lab.stage', { n: num(i + 1), objects: num(s.objects), tris: num(s.triangles) })}
                </P>
                <Row label={t('lab.fps_avg')} value={fmt(s.stats?.avg, 'lab.unit_fps')} />
                <Row label={t('lab.fps_min')} value={fmt(s.stats?.min, 'lab.unit_fps')} />
                <Row label={t('lab.heavy', { ms: num(LAB_THRESHOLDS.heavyFrameMs) })} value={fmt(s.stats?.heavyPct, 'lab.unit_pct')} />
                <Row label={t('lab.first_frame')} value={fmt(s.firstFrameMs, 'lab.unit_ms')} />
                <Row label={t('lab.gl_errors')} value={num(s.glErrors)} testID={`lab-3d-s${i + 1}-errors`} />
              </View>
            ))}
          </View>
        ) : phase !== '3d' ? (
          <P muted style={{ fontSize: 13, marginTop: 6 }}>{t('lab.not_run')}</P>
        ) : null}
      </Card>

      {/* д) итог go/no-go */}
      <Card style={{ borderColor: vColor, borderWidth: 2 }}>
        <H>{t('lab.section_verdict')}</H>
        <P bold testID="lab-verdict" style={{ color: vColor, marginTop: 6 }}>
          {t(`lab.verdict_${v}`)}
        </P>
        <P muted style={{ fontSize: 12.5, marginTop: 6 }}>
          {t('lab.rule', {
            g1: num(LAB_THRESHOLDS.greenStage1Fps),
            g2: num(LAB_THRESHOLDS.greenStage2Fps),
            y1: num(LAB_THRESHOLDS.yellowStage1Fps),
          })}
        </P>
      </Card>

      {/* е) отчёт: только модель и цифры; нигде не хранится */}
      <Card>
        <H>{t('lab.section_report')}</H>
        <P muted style={{ fontSize: 13, marginTop: 4 }}>{t('lab.report_hint')}</P>
        <Text
          testID="lab-report"
          selectable
          style={{
            marginTop: 8,
            color: pal.ink,
            fontSize: 11.5,
            lineHeight: 16,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            writingDirection: 'ltr',
          }}
        >
          {report}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Btn
            testID="lab-copy"
            kind="ghost"
            label={copied ? t('lab.copied') : t('lab.copy')}
            disabled={!report}
            style={{ flex: 1 }}
            onPress={() => {
              Clipboard.setStringAsync(report)
                .then(() => setCopied(true))
                .catch(() => undefined);
            }}
          />
          <Btn testID="lab-share" kind="ghost" label={t('lab.share')} disabled={!report} style={{ flex: 1 }} onPress={() => shareText(report)} />
        </View>
      </Card>
    </Screen>
  );
}
