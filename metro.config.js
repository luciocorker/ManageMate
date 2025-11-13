const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable WebView compatibility
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Ensure proper handling of Firebase and other web-based libraries
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
