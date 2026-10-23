// Настройки сборщика Metro (v1.2.0). Всё по умолчанию Expo, кроме одного:
// expo-gl («Лаборатория замеров», 3D-замер) пробует подключить react-native-reanimated для необязательных «ворклетов».
// Пакет лежит в node_modules транзитивно (через expo-router), поэтому Metro клал его в сборку целиком (+≈1 МБ JS).
// Для запросов ИЗ expo-gl подставляем заглушку, которая сразу бросает ошибку, — expo-gl ловит её и работает без ворклетов.
// Остальной код (если когда-нибудь подключит reanimated сам) получает настоящий пакет.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const SHIM = path.resolve(__dirname, 'metro-shims/expo-gl-no-reanimated.js');
const FROM_EXPO_GL = /[\\/]node_modules[\\/]expo-gl[\\/]/;
const upstream = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-reanimated' && FROM_EXPO_GL.test(context.originModulePath)) {
    return { type: 'sourceFile', filePath: SHIM };
  }
  return upstream ? upstream(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
