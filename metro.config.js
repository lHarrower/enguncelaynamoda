// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// React Native 0.73+ compatibility with bundle optimization
// Merge configurations manually
config.resolver.alias = {
  '@': './src',
};

// Optimize asset resolution
config.resolver.assetExts = [...config.resolver.assetExts, 'webp'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Enable minification for production
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_keys: true,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  compress: {
    reduce_funcs: false,
  },
};

// Collapse noisy anonymous frames so Metro won't attempt to symbolicate them
config.symbolicator = config.symbolicator || {};
config.symbolicator.customizeFrame = (frame) => {
  try {
    const file = frame?.file || '';
    if (
      file.includes('<anonymous>') ||
      file.includes('\\<anonymous>') ||
      file.includes('/<anonymous>')
    ) {
      return { ...frame, collapse: true };
    }
  } catch (e) {
    // no-op: be conservative if anything goes wrong
  }
  return frame;
};

// Optimize bundle output
// Use default serializer to ensure compatibility with expo-router on web.
module.exports = withNativeWind(config, './tailwind.config.js');
