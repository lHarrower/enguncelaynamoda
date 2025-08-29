#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Dönüştürülecek dosya uzantıları
const FILE_EXTENSIONS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

// Hariç tutulacak klasörler
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '.expo/**',
  'android/**',
  'ios/**'
];

// Relative import'ları @/ formatına dönüştüren fonksiyon
function convertRelativeImports(content, filePath) {
  const lines = content.split('\n');
  const convertedLines = lines.map(line => {
    // Import satırlarını yakala
    const importMatch = line.match(/^(\s*import\s+.*?from\s+['"])(\.\.\/.*?)(['"];?)(.*)$/);
    if (importMatch) {
      const [, prefix, relativePath, suffix, rest] = importMatch;
      
      // Dosyanın bulunduğu klasörü hesapla
      const fileDir = path.dirname(filePath);
      const absolutePath = path.resolve(fileDir, relativePath);
      const projectRoot = process.cwd();
      
      // src klasörüne göre relative path hesapla
      const srcPath = path.join(projectRoot, 'src');
      
      if (absolutePath.startsWith(srcPath)) {
        const relativeToSrc = path.relative(srcPath, absolutePath);
        const aliasPath = '@/' + relativeToSrc.replace(/\\/g, '/');
        return `${prefix}${aliasPath}${suffix}${rest}`;
      }
    }
    
    return line;
  });
  
  return convertedLines.join('\n');
}

// Ana dönüştürme fonksiyonu
function convertImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const convertedContent = convertRelativeImports(content, filePath);
    
    if (content !== convertedContent) {
      fs.writeFileSync(filePath, convertedContent, 'utf8');
      
      return true;
    }
    
    return false;
  } catch (error) {
    
    return false;
  }
}

// Tüm dosyaları işle
function convertAllImports() {
  
  
  let totalFiles = 0;
  let convertedFiles = 0;
  
  FILE_EXTENSIONS.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      absolute: true
    });
    
    files.forEach(file => {
      totalFiles++;
      if (convertImportsInFile(file)) {
        convertedFiles++;
      }
    });
  });
  
  
  
  
  
}

// Script'i çalıştır
if (require.main === module) {
  convertAllImports();
}

module.exports = { convertAllImports, convertRelativeImports };
