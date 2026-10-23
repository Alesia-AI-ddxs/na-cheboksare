// Плагин сборки «вариант Э» (v1.2.0): разрешить приложению УЗНАТЬ, установлено ли отдельное 3D-приложение.
// Это НЕ разрешение (permission) и не доступ к данным — только объявление «я буду открывать ссылки этой схемы».
//  - Android 11+ без записи <queries> отвечает «не установлено» на любую чужую схему (Linking.canOpenURL → false),
//    поэтому кнопка «Открыть в 3D» никогда бы не появилась. Плагин добавляет в манифест:
//      <queries><intent><action android:name="android.intent.action.VIEW"/><data android:scheme="<схема>"/></intent></queries>
//  - iOS: схема добавляется в LSApplicationQueriesSchemes (без этого canOpenURL тоже отвечает «нет»).
// Если app.json → expo.extra.unity3dScheme ПУСТОЙ (сейчас) — плагин ничего не меняет: манифест как в 1.1.1.
const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins');

function schemeOf(config) {
  const s = String((config.extra && config.extra.unity3dScheme) || '')
    .trim()
    .replace(/:\/\/.*$/, '')
    .replace(/:$/, '')
    .toLowerCase();
  return /^[a-z][a-z0-9+.-]*$/.test(s) ? s : '';
}

module.exports = function withUnity3dQueries(config) {
  const scheme = schemeOf(config);
  if (!scheme) return config;

  config = withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    manifest.queries = manifest.queries || [];
    const has = manifest.queries.some((q) =>
      (q.intent || []).some((i) => (i.data || []).some((d) => d.$ && d.$['android:scheme'] === scheme)),
    );
    if (!has) {
      manifest.queries.push({
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': scheme } }],
          },
        ],
      });
    }
    return c;
  });

  config = withInfoPlist(config, (c) => {
    const list = Array.isArray(c.modResults.LSApplicationQueriesSchemes) ? c.modResults.LSApplicationQueriesSchemes : [];
    if (!list.includes(scheme)) list.push(scheme);
    c.modResults.LSApplicationQueriesSchemes = list;
    return c;
  });
  return config;
};
