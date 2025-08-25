#!/usr/bin/env node

// AYNA Mirror Navigation Integration Validation Script
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating AYNA Mirror Navigation Integration...\n');

const validations = [
  {
    name: 'AYNA Mirror Tab Screen',
    path: 'app/(app)/ayna-mirror.tsx',
    check: (content) => {
      return (
        content.includes('AynaMirrorScreen') &&
        content.includes('useAuth') &&
        content.includes('useTheme') &&
        content.includes('useLocalSearchParams')
      );
    },
  },
  {
    name: 'AYNA Mirror Settings Screen',
    path: 'app/ayna-mirror-settings.tsx',
    check: (content) => {
      return (
        content.includes('AynaMirrorSettingsScreen') &&
        content.includes('useAuth') &&
        content.includes('useRouter')
      );
    },
  },
  {
    name: 'Tab Navigation Integration',
    path: 'app/(app)/_layout.tsx',
    check: (content) => {
      return content.includes('ayna-mirror') && content.includes('mirror');
    },
  },
  {
    name: 'Deep Linking Configuration',
    path: 'app.json',
    check: (content) => {
      const config = JSON.parse(content);
      return (
        config.expo.linking &&
        config.expo.linking.config &&
        config.expo.linking.config.screens &&
        config.expo.linking.config.screens['ayna-mirror']
      );
    },
  },
  {
    name: 'Notification Handler Service',
    path: 'services/notificationHandler.ts',
    check: (content) => {
      return (
        content.includes('handleNotificationResponse') &&
        content.includes('handleDeepLink') &&
        content.includes('navigateToAynaMirror')
      );
    },
  },
  {
    name: 'Notification Service Deep Links',
    path: 'services/notificationService.ts',
    check: (content) => {
      return content.includes('aynamoda://ayna-mirror') && content.includes('url:');
    },
  },
  {
    name: 'Root Layout Notification Handler',
    path: 'app/_layout.tsx',
    check: (content) => {
      return content.includes('notificationHandler') && content.includes('initialize');
    },
  },
];

let allPassed = true;

validations.forEach((validation) => {
  try {
    const filePath = path.join(process.cwd(), validation.path);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${validation.name}: File not found - ${validation.path}`);
      allPassed = false;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    if (validation.check(content)) {
      console.log(`✅ ${validation.name}: Integration verified`);
    } else {
      console.log(`❌ ${validation.name}: Integration check failed`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${validation.name}: Error checking file - ${error.message}`);
    allPassed = false;
  }
});

console.log('\n📋 Additional Integration Checks:\n');

// Check if AYNA Mirror screens exist
const screenChecks = ['screens/AynaMirrorScreen.tsx', 'screens/AynaMirrorSettingsScreen.tsx'];

screenChecks.forEach((screenPath) => {
  const filePath = path.join(process.cwd(), screenPath);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Screen Component: ${screenPath} exists`);
  } else {
    console.log(`❌ Screen Component: ${screenPath} missing`);
    allPassed = false;
  }
});

// Check if context providers are properly integrated
const contextChecks = [
  { name: 'AuthContext', path: 'context/AuthContext.tsx' },
  { name: 'ThemeContext', path: 'context/ThemeContext.tsx' },
];

contextChecks.forEach((context) => {
  const filePath = path.join(process.cwd(), context.path);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('createContext') && content.includes('Provider')) {
      console.log(`✅ Context Integration: ${context.name} properly structured`);
    } else {
      console.log(`❌ Context Integration: ${context.name} missing Provider pattern`);
      allPassed = false;
    }
  } else {
    console.log(`❌ Context Integration: ${context.path} not found`);
    allPassed = false;
  }
});

console.log('\n🔗 Deep Linking Validation:\n');

// Validate deep linking configuration
try {
  const appConfigPath = path.join(process.cwd(), 'app.json');
  const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

  const linking = appConfig.expo.linking;
  if (linking && linking.prefixes && linking.config) {
    console.log(`✅ Deep Linking: Prefixes configured - ${linking.prefixes.join(', ')}`);

    const screens = linking.config.screens;
    if (screens['ayna-mirror'] || screens['(app)']?.screens?.['ayna-mirror']) {
      console.log('✅ Deep Linking: AYNA Mirror routes configured');
    } else {
      console.log('❌ Deep Linking: AYNA Mirror routes missing');
      allPassed = false;
    }
  } else {
    console.log('❌ Deep Linking: Configuration incomplete');
    allPassed = false;
  }
} catch (error) {
  console.log(`❌ Deep Linking: Configuration error - ${error.message}`);
  allPassed = false;
}

console.log('\n🧪 Test Coverage Validation:\n');

// Check if integration tests exist
const testFiles = [
  '__tests__/aynaMirrorNavigation.test.tsx',
  '__tests__/aynaMirrorAuthIntegration.test.tsx',
];

testFiles.forEach((testFile) => {
  const filePath = path.join(process.cwd(), testFile);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Integration Test: ${testFile} exists`);
  } else {
    console.log(`❌ Integration Test: ${testFile} missing`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('🎉 AYNA Mirror Navigation Integration: ALL CHECKS PASSED!');
  console.log('\n✨ Integration Summary:');
  console.log('   • AYNA Mirror added to tab navigation');
  console.log('   • Authentication integration verified');
  console.log('   • Theme context integration confirmed');
  console.log('   • Deep linking configuration complete');
  console.log('   • Notification handler integrated');
  console.log('   • Integration tests created');
  console.log('\n🚀 Ready for user testing!');
  process.exit(0);
} else {
  console.log('❌ AYNA Mirror Navigation Integration: SOME CHECKS FAILED');
  console.log('\n🔧 Please review the failed checks above and fix any issues.');
  process.exit(1);
}
