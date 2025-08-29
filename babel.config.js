// babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/theme': './src/theme',
            '@/types': './src/types',
            '@/utils': './src/utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-class-static-block',
    ],
  };
};
