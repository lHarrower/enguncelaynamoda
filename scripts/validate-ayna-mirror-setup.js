#!/usr/bin/env node

/**
 * AYNA Mirror Setup Validation Script
 * Validates that the enhanced wardrobe service is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating AYNA Mirror Enhanced Wardrobe Service Setup...\n');

// Check if required files exist
const requiredFiles = [
  'services/enhancedWardrobeService.ts',
  'services/aynaMirrorService.ts',
  'types/aynaMirror.ts',
  'supabase/migrations/002_wardrobe_functions.sql',
  '__tests__/enhancedWardrobeService.test.ts',
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) {
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

console.log('\n🧪 Running tests to validate functionality...');

// Run the tests
const { execSync } = require('child_process');

try {
  execSync('npm test -- __tests__/enhancedWardrobeService.test.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('\n✅ All enhanced wardrobe service tests passed!');
  console.log('\n🎉 AYNA Mirror Enhanced Wardrobe Service setup is complete and validated!');

  console.log('\n📋 Summary of implemented features:');
  console.log('  ✅ Usage tracking for wardrobe items');
  console.log('  ✅ Automatic item categorization');
  console.log('  ✅ Color extraction from images');
  console.log('  ✅ Cost-per-wear calculations');
  console.log('  ✅ Neglected items identification (30+ days unworn)');
  console.log('  ✅ Comprehensive unit tests');
  console.log('  ✅ Database functions for intelligence features');
} catch (error) {
  console.log('\n❌ Tests failed! Please check the implementation.');
  process.exit(1);
}
