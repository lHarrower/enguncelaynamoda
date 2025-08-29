// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Expo'nun varsayılan yapılandırmasını al
const config = getDefaultConfig(__dirname);

// --- NİHAİ DÜZELTME BAŞLANGICI ---

// Metro'ya projenin 'src' klasörünü izlemesini söyle
config.watchFolders = [path.resolve(__dirname, 'src')];

// Metro'nun resolver'ına (adres çözümleyici) '@' takma adının
// projenin 'src' klasörü anlamına geldiğini öğret
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
};

// --- NİHAİ DÜZELTME SONU ---

module.exports = config;
