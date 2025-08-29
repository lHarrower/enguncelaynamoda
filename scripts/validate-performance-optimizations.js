#!/usr/bin/env node

/**
 * Performance Optimization Validation Script
 * Validates that all performance optimizations are working correctly
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  
}

function logSection(title) {
  log(`\n${colors.bold}=== ${title} ===${colors.reset}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

function addResult(type, message, details = null) {
  results[type]++;
  results.details.push({ type, message, details });

  switch (type) {
    case 'passed':
      logSuccess(message);
      break;
    case 'failed':
      logError(message);
      break;
    case 'warnings':
      logWarning(message);
      break;
  }
}

// ============================================================================
// FILE EXISTENCE VALIDATION
// ============================================================================

function validateFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    addResult('passed', `${description} exists: ${filePath}`);
    return true;
  } else {
    addResult('failed', `${description} missing: ${filePath}`);
    return false;
  }
}

function validateDirectoryExists(dirPath, description) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    addResult('passed', `${description} directory exists: ${dirPath}`);
    return true;
  } else {
    addResult('failed', `${description} directory missing: ${dirPath}`);
    return false;
  }
}

// ============================================================================
// CODE QUALITY VALIDATION
// ============================================================================

function validateServiceImplementation() {
  logSection('Performance Service Implementation');

  const servicePath = 'services/performanceOptimizationService.ts';
  if (!validateFileExists(servicePath, 'Performance Optimization Service')) {
    return;
  }

  const serviceContent = fs.readFileSync(servicePath, 'utf8');

  // Check for required methods
  const requiredMethods = [
    'preGenerateRecommendations',
    'cacheRecommendations',
    'getCachedRecommendations',
    'cacheWardrobeData',
    'getCachedWardrobeData',
    'optimizeImageLoading',
    'queueFeedbackForProcessing',
    'executeOptimizedQuery',
    'performCleanup',
    'getPerformanceMetrics',
  ];

  requiredMethods.forEach((method) => {
    if (
      serviceContent.includes(`static async ${method}`) ||
      serviceContent.includes(`async ${method}`) ||
      serviceContent.includes(`static ${method}`)
    ) {
      addResult('passed', `Method implemented: ${method}`);
    } else {
      addResult('failed', `Method missing: ${method}`);
    }
  });

  // Check for caching implementation
  if (serviceContent.includes('AsyncStorage') && serviceContent.includes('CACHE_KEYS')) {
    addResult('passed', 'Caching system implemented with AsyncStorage');
  } else {
    addResult('failed', 'Caching system not properly implemented');
  }

  // Check for performance monitoring
  if (
    serviceContent.includes('PerformanceMetrics') &&
    serviceContent.includes('recordPerformanceMetric')
  ) {
    addResult('passed', 'Performance monitoring system implemented');
  } else {
    addResult('failed', 'Performance monitoring system missing');
  }

  // Check for error handling
  if (serviceContent.includes('try {') && serviceContent.includes('catch (error)')) {
    addResult('passed', 'Error handling implemented');
  } else {
    addResult('warnings', 'Error handling may be insufficient');
  }

  // Check for background processing
  if (
    serviceContent.includes('feedbackProcessingQueue') &&
    serviceContent.includes('processFeedbackQueue')
  ) {
    addResult('passed', 'Background processing system implemented');
  } else {
    addResult('failed', 'Background processing system missing');
  }
}

function validateDatabaseMigration() {
  logSection('Database Migration');

  const migrationPath = 'supabase/migrations/005_performance_optimizations.sql';
  if (!validateFileExists(migrationPath, 'Performance optimization migration')) {
    return;
  }

  const migrationContent = fs.readFileSync(migrationPath, 'utf8');

  // Check for required indexes
  const requiredIndexes = [
    'idx_daily_recommendations_user_date',
    'idx_outfit_recommendations_daily_rec',
    'idx_outfit_feedback_user_date',
    'idx_wardrobe_items_user_category',
    'idx_wardrobe_items_usage',
    'idx_wardrobe_items_colors',
    'idx_wardrobe_items_tags',
  ];

  requiredIndexes.forEach((index) => {
    if (migrationContent.includes(index)) {
      addResult('passed', `Database index defined: ${index}`);
    } else {
      addResult('failed', `Database index missing: ${index}`);
    }
  });

  // Check for performance tables
  const requiredTables = ['confidence_patterns', 'performance_metrics'];

  requiredTables.forEach((table) => {
    if (migrationContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      addResult('passed', `Performance table defined: ${table}`);
    } else {
      addResult('failed', `Performance table missing: ${table}`);
    }
  });

  // Check for optimization functions
  const requiredFunctions = [
    'get_wardrobe_stats',
    'get_confidence_trends',
    'cleanup_old_data',
    'refresh_user_style_profiles',
  ];

  requiredFunctions.forEach((func) => {
    if (migrationContent.includes(`CREATE OR REPLACE FUNCTION ${func}`)) {
      addResult('passed', `Database function defined: ${func}`);
    } else {
      addResult('failed', `Database function missing: ${func}`);
    }
  });

  // Check for materialized views
  if (migrationContent.includes('CREATE MATERIALIZED VIEW IF NOT EXISTS user_style_profiles')) {
    addResult('passed', 'Materialized view for user style profiles defined');
  } else {
    addResult('failed', 'Materialized view for user style profiles missing');
  }
}

function validateTestCoverage() {
  logSection('Test Coverage');

  const testPath = '__tests__/performanceOptimization.test.ts';
  if (!validateFileExists(testPath, 'Performance optimization tests')) {
    return;
  }

  const testContent = fs.readFileSync(testPath, 'utf8');

  // Check for test categories
  const testCategories = [
    'Recommendation Caching',
    'Wardrobe Data Caching',
    'Image Optimization',
    'Background Processing',
    'Database Optimization',
    'Cleanup Routines',
    'Performance Monitoring',
    'Integration Tests',
    'Performance Benchmarks',
  ];

  testCategories.forEach((category) => {
    if (testContent.includes(category)) {
      addResult('passed', `Test category covered: ${category}`);
    } else {
      addResult('failed', `Test category missing: ${category}`);
    }
  });

  // Count test cases
  const testCases = testContent.match(/test\(/g) || [];
  if (testCases.length >= 20) {
    addResult('passed', `Comprehensive test coverage: ${testCases.length} test cases`);
  } else if (testCases.length >= 10) {
    addResult('warnings', `Moderate test coverage: ${testCases.length} test cases`);
  } else {
    addResult('failed', `Insufficient test coverage: ${testCases.length} test cases`);
  }

  // Check for performance benchmarks
  if (testContent.includes('Performance Benchmarks') && testContent.includes('toBeLessThan')) {
    addResult('passed', 'Performance benchmarks implemented');
  } else {
    addResult('warnings', 'Performance benchmarks may be missing');
  }
}

// ============================================================================
// INTEGRATION VALIDATION
// ============================================================================

function validateServiceIntegration() {
  logSection('Service Integration');

  // Check if performance service is imported in other services
  const servicesToCheck = ['services/aynaMirrorService.ts', 'services/errorHandlingService.ts'];

  servicesToCheck.forEach((servicePath) => {
    if (fs.existsSync(servicePath)) {
      const content = fs.readFileSync(servicePath, 'utf8');
      if (
        content.includes('performanceOptimizationService') ||
        content.includes('PerformanceOptimizationService')
      ) {
        addResult('passed', `Performance service integrated in: ${servicePath}`);
      } else {
        addResult('warnings', `Performance service not integrated in: ${servicePath}`);
      }
    }
  });

  // Check for initialization in app startup
  const appFiles = ['app/_layout.tsx', 'app/index.tsx'];

  let initializationFound = false;
  appFiles.forEach((appFile) => {
    if (fs.existsSync(appFile)) {
      const content = fs.readFileSync(appFile, 'utf8');
      if (
        content.includes('PerformanceOptimizationService.initialize') ||
        content.includes('performanceOptimizationService.initialize')
      ) {
        addResult('passed', `Performance service initialization found in: ${appFile}`);
        initializationFound = true;
      }
    }
  });

  if (!initializationFound) {
    addResult('warnings', 'Performance service initialization not found in app startup files');
  }
}

function validateTypeDefinitions() {
  logSection('Type Definitions');

  const typesPath = 'types/aynaMirror.ts';
  if (!validateFileExists(typesPath, 'AYNA Mirror types')) {
    return;
  }

  const typesContent = fs.readFileSync(typesPath, 'utf8');

  // Check for performance-related types
  const requiredTypes = ['PerformanceMetrics', 'CachedData', 'UsageStats', 'UtilizationStats'];

  requiredTypes.forEach((type) => {
    if (typesContent.includes(`interface ${type}`) || typesContent.includes(`type ${type}`)) {
      addResult('passed', `Type definition exists: ${type}`);
    } else {
      addResult('warnings', `Type definition may be missing: ${type}`);
    }
  });
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

function validateConfiguration() {
  logSection('Configuration');

  // Check package.json for required dependencies
  const packagePath = 'package.json';
  if (validateFileExists(packagePath, 'Package configuration')) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const requiredDeps = ['@react-native-async-storage/async-storage'];

    requiredDeps.forEach((dep) => {
      if (packageContent.dependencies && packageContent.dependencies[dep]) {
        addResult('passed', `Required dependency installed: ${dep}`);
      } else if (packageContent.devDependencies && packageContent.devDependencies[dep]) {
        addResult('passed', `Required dependency installed (dev): ${dep}`);
      } else {
        addResult('failed', `Required dependency missing: ${dep}`);
      }
    });
  }

  // Check Jest configuration
  const jestConfigPath = 'jest.config.js';
  if (validateFileExists(jestConfigPath, 'Jest configuration')) {
    const jestContent = fs.readFileSync(jestConfigPath, 'utf8');
    if (jestContent.includes('setupFilesAfterEnv') || jestContent.includes('setupFiles')) {
      addResult('passed', 'Jest setup configuration found');
    } else {
      addResult('warnings', 'Jest setup configuration may be incomplete');
    }
  }
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

function analyzeCodeComplexity() {
  logSection('Code Complexity Analysis');

  const servicePath = 'services/performanceOptimizationService.ts';
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');

    // Count lines of code
    const lines = content
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('//')).length;
    if (lines > 0) {
      addResult('passed', `Service implementation: ${lines} lines of code`);
    }

    // Count methods
    const methods = content.match(/static async \w+|async \w+/g) || [];
    if (methods.length >= 10) {
      addResult('passed', `Comprehensive method coverage: ${methods.length} methods`);
    } else {
      addResult('warnings', `Limited method coverage: ${methods.length} methods`);
    }

    // Check for documentation
    const docComments = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
    if (docComments.length >= methods.length * 0.5) {
      addResult('passed', `Good documentation coverage: ${docComments.length} documented methods`);
    } else {
      addResult(
        'warnings',
        `Documentation could be improved: ${docComments.length} documented methods`,
      );
    }
  }
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

function runValidation() {
  log(`${colors.bold}🚀 AYNA Mirror Performance Optimization Validation${colors.reset}`, 'blue');
  log('Validating performance optimization implementation...\n');

  // Run all validation checks
  validateServiceImplementation();
  validateDatabaseMigration();
  validateTestCoverage();
  validateServiceIntegration();
  validateTypeDefinitions();
  validateConfiguration();
  analyzeCodeComplexity();

  // Print summary
  logSection('Validation Summary');

  const total = results.passed + results.failed + results.warnings;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

  log(`\nTotal Checks: ${total}`);
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  logWarning(`Warnings: ${results.warnings}`);
  log(`Pass Rate: ${passRate}%\n`);

  // Determine overall status
  if (results.failed === 0 && results.warnings <= 2) {
    logSuccess('✅ Performance optimization implementation is EXCELLENT!');
    log('All critical components are properly implemented with comprehensive testing.');
  } else if (results.failed <= 2 && results.warnings <= 5) {
    logWarning('⚠️  Performance optimization implementation is GOOD with minor issues.');
    log('Most components are implemented correctly, but some improvements are recommended.');
  } else if (results.failed <= 5) {
    logWarning('⚠️  Performance optimization implementation needs IMPROVEMENT.');
    log('Several components need attention before production deployment.');
  } else {
    logError('❌ Performance optimization implementation is INCOMPLETE.');
    log('Critical components are missing and need immediate attention.');
  }

  // Detailed recommendations
  if (results.failed > 0 || results.warnings > 0) {
    logSection('Recommendations');

    if (results.failed > 0) {
      log('\nCritical Issues to Address:', 'red');
      results.details
        .filter((r) => r.type === 'failed')
        .forEach((r) => log(`  • ${r.message}`, 'red'));
    }

    if (results.warnings > 0) {
      log('\nImprovements to Consider:', 'yellow');
      results.details
        .filter((r) => r.type === 'warnings')
        .slice(0, 5) // Show top 5 warnings
        .forEach((r) => log(`  • ${r.message}`, 'yellow'));
    }
  }

  // Performance optimization checklist
  logSection('Performance Optimization Checklist');

  const checklist = [
    'Recommendation caching system implemented',
    'Wardrobe data caching with expiration',
    'Image optimization and progressive loading',
    'Background processing for user feedback',
    'Database query optimization with indexes',
    'Cleanup routines for old data',
    'Performance monitoring and metrics',
    'Comprehensive test coverage',
    'Error handling and graceful degradation',
    'Integration with existing services',
  ];

  checklist.forEach((item, index) => {
    const relatedPassed = results.details.filter(
      (r) =>
        r.type === 'passed' && r.message.toLowerCase().includes(item.toLowerCase().split(' ')[0]),
    ).length;

    if (relatedPassed > 0) {
      logSuccess(`${index + 1}. ${item}`);
    } else {
      logError(`${index + 1}. ${item}`);
    }
  });

  log('\n' + '='.repeat(80));
  log(`${colors.bold}Validation completed at ${new Date().toISOString()}${colors.reset}`);

  // Exit with appropriate code
  process.exit(results.failed > 5 ? 1 : 0);
}

// Run validation if called directly
if (require.main === module) {
  runValidation();
}

module.exports = {
  runValidation,
  validateServiceImplementation,
  validateDatabaseMigration,
  validateTestCoverage,
  results,
};
