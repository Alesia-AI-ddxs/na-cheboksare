// Кнопка «Открыть в 3D» на экране точки — «вариант Э» (отдельное 3D-приложение по диплинку, волна 0).
// Показывается, только если в app.json задана схема 3D-приложения (extra.unity3dScheme) И:
//   - 3D-приложение установлено (Linking.canOpenURL) — открываем сцену точки;
//   - или не установлено, но задан адрес в магазине (extra.unity3dStoreUrl) — открываем магазин.
// Схема пустая (сейчас) — кнопки нет вовсе. В браузере кнопки нет (3D-приложение — для телефона).
// Интернет приложению не нужен: ссылку открывает система.
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Btn } from '../components/ui';
import { CODE_RE, useGame } from '../state/game';
import { unity3dLink } from './appLink';
import { UNITY_APP_SCHEME, UNITY_APP_STORE_URL } from './config';

export function Open3DButton({ pointId }: { pointId: number }) {
  const { t, lang, p } = useGame();
  const url = unity3dLink(UNITY_APP_SCHEME, pointId, lang, CODE_RE.test(p.code) ? p.code : undefined);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!url || Platform.OS === 'web') {
      setTarget(null);
      return;
    }
    Linking.canOpenURL(url)
      .then((ok) => alive && setTarget(ok ? url : UNITY_APP_STORE_URL || null))
      .catch(() => alive && setTarget(UNITY_APP_STORE_URL || null));
    return () => {
      alive = false;
    };
  }, [url]);

  if (!target) return null;
  return <Btn testID="open-3d" kind="volga" label={t('ui.open_3d')} onPress={() => Linking.openURL(target).catch(() => undefined)} style={{ marginTop: 10 }} />;
}
