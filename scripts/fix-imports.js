const fs = require('fs');
const path = require('path');

// Dosya uzantıları
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Değiştirilecek import pattern'ları
const importPatterns = [
  { from: /from\s+['"]\.\.\//g, to: "from '@/" },
  { from: /import\s+['"]\.\.\//g, to: "import '@/" },
  { from: /require\s*\(['"]\.\.\//g, to: "require('@/" },
  { from: /jest\.mock\s*\(['"]\.\.\//g, to: "jest.mock('@/" },
  { from: /jest\.doMock\s*\(['"]\.\.\//g, to: "jest.doMock('@/" },
  { from: /jest\.requireActual\s*\(['"]\.\.\//g, to: "jest.requireActual('@/" },
  { from: /jest\.requireMock\s*\(['"]\.\.\//g, to: "jest.requireMock('@/" }
];

// Dosyaları tarama fonksiyonu
function scanDirectory(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // node_modules, .git gibi klasörleri atla
      if (!['node_modules', '.git', '.expo', 'dist', 'build', 'coverage'].includes(item)) {
        files.push(...scanDirectory(fullPath));
      }
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Import yollarını düzeltme fonksiyonu
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Her pattern için kontrol et
    for (const pattern of importPatterns) {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }
    
    // Eğer değişiklik varsa dosyayı kaydet
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Ana fonksiyon
function main() {
  console.log('🔍 Scanning for files with relative imports...');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const testDir = path.join(__dirname, '..', '__tests__');
  
  const files = [
    ...scanDirectory(srcDir),
    ...scanDirectory(testDir)
  ];
  
  console.log(`📁 Found ${files.length} files to check`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log('✨ Import path standardization complete!');
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { fixImports, scanDirectory };