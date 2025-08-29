#!/usr/bin/env node

/**
 * AYNA Mirror Setup Validation Script
 * Validates that the enhanced wardrobe service is properly configured
 */

const fs = require('fs');
const path = require('path');



// Check if required files exist
const requiredFiles = [
  'services/enhancedWardrobeService.ts',
  'services/aynaMirrorService.ts',
  'types/aynaMirror.ts',
  'supabase/migrations/002_wardrobe_functions.sql',
  '__tests__/enhancedWardrobeService.test.ts',
];

let allFilesExist = true;


requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  
  if (!exists) {
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  
  process.exit(1);
}



// Run the tests
const { execSync } = require('child_process');

try {
  execSync('npm test -- __tests__/enhancedWardrobeService.test.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  
  

  
  
  
  
  
  
  
  
} catch (error) {
  
  process.exit(1);
}
