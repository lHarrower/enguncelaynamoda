#!/usr/bin/env node

// AYNA Mirror Navigation Integration Validation Script
const fs = require('fs');
const path = require('path');



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
      
      allPassed = false;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    if (validation.check(content)) {
      
    } else {
      
      allPassed = false;
    }
  } catch (error) {
    
    allPassed = false;
  }
});



// Check if AYNA Mirror screens exist
const screenChecks = ['screens/AynaMirrorScreen.tsx', 'screens/AynaMirrorSettingsScreen.tsx'];

screenChecks.forEach((screenPath) => {
  const filePath = path.join(process.cwd(), screenPath);
  if (fs.existsSync(filePath)) {
    
  } else {
    
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
      
    } else {
      
      allPassed = false;
    }
  } else {
    
    allPassed = false;
  }
});



// Validate deep linking configuration
try {
  const appConfigPath = path.join(process.cwd(), 'app.json');
  const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

  const linking = appConfig.expo.linking;
  if (linking && linking.prefixes && linking.config) {
    

    const screens = linking.config.screens;
    if (screens['ayna-mirror'] || screens['(app)']?.screens?.['ayna-mirror']) {
      
    } else {
      
      allPassed = false;
    }
  } else {
    
    allPassed = false;
  }
} catch (error) {
  
  allPassed = false;
}



// Check if integration tests exist
const testFiles = [
  '__tests__/aynaMirrorNavigation.test.tsx',
  '__tests__/aynaMirrorAuthIntegration.test.tsx',
];

testFiles.forEach((testFile) => {
  const filePath = path.join(process.cwd(), testFile);
  if (fs.existsSync(filePath)) {
    
  } else {
    
    allPassed = false;
  }
});



if (allPassed) {
  
  
  
  
  
  
  
  
  
  process.exit(0);
} else {
  
  
  process.exit(1);
}
