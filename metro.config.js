const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration para socket.io-client
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      // Polyfills para módulos de Node.js
      crypto: require.resolve('react-native-crypto'),
      stream: require.resolve('readable-stream'),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser.js'),
      path: require.resolve('path-browserify'),
      url: require.resolve('url/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser.js'),
      assert: require.resolve('assert/'),
      constants: require.resolve('constants-browserify'),
      vm: require.resolve('vm-browserify'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
