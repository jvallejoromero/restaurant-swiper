/**
 * Metro configuration for Expo + Expo Router + NativeWind
 * See:
 *   • Expo Router troubleshooting: require expo-router/metro as your base ⚙️:contentReference[oaicite:0]{index=0}
 *   • Firebase “Component auth” fix: allow .cjs and disable strict exports ⚙️:contentReference[oaicite:1]{index=1}
 *
 * @type {import('expo-router/metro').MetroConfig}
 */
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Grab Expo Router’s default Metro config
const config = getDefaultConfig(__dirname);

// 2. Firebase & package-exports workaround
config.resolver.sourceExts.push('cjs');                    // allow Firebase’s .cjs entrypoints :contentReference[oaicite:2]{index=2}
config.resolver.unstable_enablePackageExports = false;     // bypass strict “exports” checks :contentReference[oaicite:3]{index=3}

// 3. Wrap it with NativeWind (your existing step)
module.exports = withNativeWind(config, {
    input: './app/globals.css',
});
