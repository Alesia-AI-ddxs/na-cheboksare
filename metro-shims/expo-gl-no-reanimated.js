// Заглушка (v1.2.0) вместо react-native-reanimated ТОЛЬКО для expo-gl (подключает metro.config.js).
// expo-gl пробует require('react-native-reanimated') ради необязательной работы в «ворклетах» (нам не нужна)
// и при ошибке спокойно работает без неё (try/catch в expo-gl/build/GLWorkletContextManager.js).
// Без заглушки Metro кладёт в сборку весь reanimated + worklets (≈1 МБ JS), хотя приложение их не использует.
throw new Error('react-native-reanimated отключён для expo-gl (metro.config.js)');
