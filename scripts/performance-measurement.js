#!/usr/bin/env node
/**
 * Performance Measurement Script for AYNAMODA
 * Measures app startup time, bundle size, and memory usage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance metrics collection
const performanceMetrics = {
  timestamp: new Date().toISOString(),
  bundleSize: {},
  buildTime: null,
  testExecutionTime: null,
  lintTime: null,
  typeCheckTime: null,
};

function measureBundleSize() {
  console.log('📦 Measuring bundle size...');

  try {
    // Check if dist directories exist
    const androidDist = path.join(process.cwd(), 'dist-android');
    const iosDist = path.join(process.cwd(), 'dist-ios');

    if (fs.existsSync(androidDist)) {
      const androidSize = getFolderSize(androidDist);
      performanceMetrics.bundleSize.android = {
        totalSize: androidSize,
        formattedSize: formatBytes(androidSize),
      };
    }

    if (fs.existsSync(iosDist)) {
      const iosSize = getFolderSize(iosDist);
      performanceMetrics.bundleSize.ios = {
        totalSize: iosSize,
        formattedSize: formatBytes(iosSize),
      };
    }

    // Check node_modules size
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const nodeModulesSize = getFolderSize(nodeModulesPath);
      performanceMetrics.bundleSize.nodeModules = {
        totalSize: nodeModulesSize,
        formattedSize: formatBytes(nodeModulesSize),
      };
    }
  } catch (error) {
    console.error('❌ Error measuring bundle size:', error.message);
  }
}

function getFolderSize(folderPath) {
  let totalSize = 0;

  function calculateSize(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }

  calculateSize(folderPath);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function measureBuildTime() {
  console.log('⏱️ Measuring build time...');

  try {
    const startTime = Date.now();
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    const endTime = Date.now();

    performanceMetrics.buildTime = {
      duration: endTime - startTime,
      formattedDuration: `${(endTime - startTime) / 1000}s`,
    };
  } catch (error) {
    console.error('❌ Error measuring build time:', error.message);
  }
}

function measureTestTime() {
  console.log('🧪 Measuring test execution time...');

  try {
    const startTime = Date.now();
    execSync('npm test -- --passWithNoTests --silent', { stdio: 'pipe' });
    const endTime = Date.now();

    performanceMetrics.testExecutionTime = {
      duration: endTime - startTime,
      formattedDuration: `${(endTime - startTime) / 1000}s`,
    };
  } catch (error) {
    console.error('❌ Error measuring test time:', error.message);
  }
}

function measureLintTime() {
  console.log('🔍 Measuring lint time...');

  try {
    const startTime = Date.now();
    try {
      execSync('npx eslint . --quiet', { stdio: 'pipe' });
    } catch (lintError) {
      // ESLint might exit with non-zero code due to warnings/errors
    }
    const endTime = Date.now();

    performanceMetrics.lintTime = {
      duration: endTime - startTime,
      formattedDuration: `${(endTime - startTime) / 1000}s`,
      note: 'Completed (may have warnings/errors)',
    };
  } catch (error) {
    console.error('❌ Error measuring lint time:', error.message);
    performanceMetrics.lintTime = {
      duration: 0,
      formattedDuration: 'N/A',
      note: 'Failed to measure',
    };
  }
}

function generateReport() {
  console.log('📊 Generating performance report...');

  const reportPath = path.join(process.cwd(), 'performance-report.json');

  // Add summary
  performanceMetrics.summary = {
    totalBundleSize: Object.values(performanceMetrics.bundleSize).reduce(
      (total, bundle) => total + (bundle.totalSize || 0),
      0,
    ),
    measurementDate: new Date().toISOString(),
    status: 'completed',
  };

  fs.writeFileSync(reportPath, JSON.stringify(performanceMetrics, null, 2));

  console.log('✅ Performance report generated:', reportPath);
  console.log('\n📈 Performance Summary:');

  if (performanceMetrics.bundleSize.android) {
    console.log(`   Android Bundle: ${performanceMetrics.bundleSize.android.formattedSize}`);
  }

  if (performanceMetrics.bundleSize.ios) {
    console.log(`   iOS Bundle: ${performanceMetrics.bundleSize.ios.formattedSize}`);
  }

  if (performanceMetrics.buildTime) {
    console.log(`   Build Time: ${performanceMetrics.buildTime.formattedDuration}`);
  }

  if (performanceMetrics.testExecutionTime) {
    console.log(`   Test Time: ${performanceMetrics.testExecutionTime.formattedDuration}`);
  }

  if (performanceMetrics.lintTime) {
    console.log(`   Lint Time: ${performanceMetrics.lintTime.formattedDuration}`);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting AYNAMODA Performance Measurement\n');

  measureBundleSize();
  measureBuildTime();
  measureTestTime();
  measureLintTime();

  generateReport();

  console.log('\n✨ Performance measurement completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  measureBundleSize,
  measureBuildTime,
  measureTestTime,
  measureLintTime,
  generateReport,
  performanceMetrics,
};
