const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

// react-native-appwrite still calls the legacy expo-file-system API
// (readAsStringAsync, cacheDirectory) for chunked uploads of files > 5MB.
// Since SDK 54 those throw from the root import, so point the SDK at /legacy.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "expo-file-system" &&
    /[\\/]node_modules[\\/]react-native-appwrite[\\/]/.test(context.originModulePath)
  ) {
    return context.resolveRequest(context, "expo-file-system/legacy", platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './app/global.css' })
