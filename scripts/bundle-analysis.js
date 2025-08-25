#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes bundle size, dependencies, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: process.cwd(),
  outputDir: path.join(process.cwd(), 'bundle-analysis'),
  targetBundleSize: 20 * 1024 * 1024, // 20MB target
  warningThreshold: 25 * 1024 * 1024, // 25MB warning
  criticalThreshold: 30 * 1024 * 1024, // 30MB critical
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * Utility functions
 */
const utils = {
  formatBytes: (bytes) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileSize: (filePath) => {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  },

  runCommand: (command, options = {}) => {
    try {
      return execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options,
      }).trim();
    } catch (error) {
      console.warn(`Command failed: ${command}`);
      return null;
    }
  },

  writeReport: (filename, data) => {
    const filePath = path.join(CONFIG.outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`📊 Report saved: ${filePath}`);
  },
};

/**
 * Analyze package.json dependencies
 */
function analyzeDependencies() {
  console.log('🔍 Analyzing dependencies...');

  const packageJsonPath = path.join(CONFIG.projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    return null;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  // Get installed package sizes
  const nodeModulesPath = path.join(CONFIG.projectRoot, 'node_modules');
  const packageSizes = {};

  Object.keys(dependencies).forEach((pkg) => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      packageSizes[pkg] = getDirSize(pkgPath);
    }
  });

  // Sort by size
  const sortedPackages = Object.entries(packageSizes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20); // Top 20 largest packages

  const analysis = {
    totalDependencies: Object.keys(dependencies).length,
    totalDevDependencies: Object.keys(devDependencies).length,
    largestPackages: sortedPackages.map(([name, size]) => ({
      name,
      size,
      formattedSize: utils.formatBytes(size),
    })),
    recommendations: generateDependencyRecommendations(dependencies, packageSizes),
  };

  utils.writeReport('dependencies-analysis.json', analysis);
  return analysis;
}

/**
 * Get directory size recursively
 */
function getDirSize(dirPath) {
  let totalSize = 0;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += getDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignore permission errors
  }

  return totalSize;
}

/**
 * Generate dependency optimization recommendations
 */
function generateDependencyRecommendations(dependencies, packageSizes) {
  const recommendations = [];

  // Check for large packages that could be optimized
  const largePackages = Object.entries(packageSizes)
    .filter(([, size]) => size > 1024 * 1024) // > 1MB
    .sort(([, a], [, b]) => b - a);

  largePackages.forEach(([pkg, size]) => {
    if (pkg === 'react-native') {
      recommendations.push({
        type: 'optimization',
        package: pkg,
        size: utils.formatBytes(size),
        suggestion: 'Consider using Hermes engine for better performance and smaller bundle size',
        priority: 'medium',
      });
    } else if (pkg === 'lodash') {
      recommendations.push({
        type: 'tree-shaking',
        package: pkg,
        size: utils.formatBytes(size),
        suggestion: 'Use individual lodash functions instead of the entire library',
        priority: 'high',
      });
    } else if (pkg.includes('expo')) {
      recommendations.push({
        type: 'optimization',
        package: pkg,
        size: utils.formatBytes(size),
        suggestion: 'Consider using Expo managed workflow optimizations',
        priority: 'low',
      });
    } else if (size > 5 * 1024 * 1024) {
      // > 5MB
      recommendations.push({
        type: 'review',
        package: pkg,
        size: utils.formatBytes(size),
        suggestion: 'Review if this large dependency is necessary or can be replaced',
        priority: 'high',
      });
    }
  });

  // Check for duplicate functionality
  const uiLibraries = Object.keys(dependencies).filter(
    (pkg) => pkg.includes('ui') || pkg.includes('component') || pkg.includes('design'),
  );

  if (uiLibraries.length > 2) {
    recommendations.push({
      type: 'consolidation',
      packages: uiLibraries,
      suggestion: 'Consider consolidating UI libraries to reduce bundle size',
      priority: 'medium',
    });
  }

  return recommendations;
}

/**
 * Analyze source code structure
 */
function analyzeSourceCode() {
  console.log('📁 Analyzing source code structure...');

  const srcPath = path.join(CONFIG.projectRoot, 'src');
  if (!fs.existsSync(srcPath)) {
    console.warn('⚠️ src directory not found');
    return null;
  }

  const analysis = {
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    largestFiles: [],
    directories: {},
  };

  function analyzeDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      const relativeItemPath = path.join(relativePath, item);

      if (stats.isDirectory()) {
        analysis.directories[relativeItemPath] = {
          size: getDirSize(itemPath),
          files: 0,
        };
        analyzeDirectory(itemPath, relativeItemPath);
      } else {
        analysis.totalFiles++;
        analysis.totalSize += stats.size;

        const ext = path.extname(item);
        analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;

        analysis.largestFiles.push({
          path: relativeItemPath,
          size: stats.size,
          formattedSize: utils.formatBytes(stats.size),
        });
      }
    }
  }

  analyzeDirectory(srcPath);

  // Sort largest files
  analysis.largestFiles.sort((a, b) => b.size - a.size);
  analysis.largestFiles = analysis.largestFiles.slice(0, 20);

  utils.writeReport('source-code-analysis.json', analysis);
  return analysis;
}

/**
 * Analyze Metro bundle
 */
function analyzeMetroBundle() {
  console.log('📦 Analyzing Metro bundle...');

  try {
    // Use Expo export to generate production bundle
    console.log('Building production bundle with Expo...');
    const exportCommand = 'npx expo export --platform all --dev false --clear';

    utils.runCommand(exportCommand, { cwd: CONFIG.projectRoot });

    // Analyze the generated dist folder
    const distPath = path.join(CONFIG.projectRoot, 'dist');
    if (fs.existsSync(distPath)) {
      const bundleSize = getDirSize(distPath);

      // Also check for specific bundle files
      const bundleResults = {};
      const platforms = ['ios', 'android', 'web'];

      for (const platform of platforms) {
        const platformPath = path.join(distPath, '_expo', 'static', 'js');
        if (fs.existsSync(platformPath)) {
          const platformSize = getDirSize(platformPath);
          bundleResults[platform] = {
            size: platformSize,
            formattedSize: utils.formatBytes(platformSize),
          };
        }
      }

      const analysis = {
        bundleSize,
        formattedSize: utils.formatBytes(bundleSize),
        status: getBundleStatus(bundleSize),
        platforms: bundleResults,
        timestamp: new Date().toISOString(),
        distPath,
      };

      console.log(`✅ Total bundle size: ${utils.formatBytes(bundleSize)}`);

      utils.writeReport('metro-bundle-analysis.json', analysis);
      return analysis;
    } else {
      console.warn('⚠️ Dist folder not found after export');
    }
  } catch (error) {
    console.warn('⚠️ Could not analyze Metro bundle:', error.message);

    // Fallback: estimate bundle size from node_modules and src
    try {
      const srcSize = getDirSize(path.join(CONFIG.projectRoot, 'src'));
      const nodeModulesSize = getDirSize(path.join(CONFIG.projectRoot, 'node_modules'));
      const estimatedSize = srcSize + nodeModulesSize * 0.1; // Rough estimate

      const analysis = {
        bundleSize: estimatedSize,
        formattedSize: utils.formatBytes(estimatedSize),
        status: getBundleStatus(estimatedSize),
        isEstimate: true,
        timestamp: new Date().toISOString(),
      };

      console.log(`📊 Estimated bundle size: ${utils.formatBytes(estimatedSize)}`);
      utils.writeReport('metro-bundle-analysis.json', analysis);
      return analysis;
    } catch (fallbackError) {
      console.error('❌ Failed to estimate bundle size:', fallbackError.message);
    }
  }

  return null;
}

/**
 * Get bundle status based on size
 */
function getBundleStatus(size) {
  if (size <= CONFIG.targetBundleSize) {
    return { level: 'good', message: 'Bundle size is within target' };
  } else if (size <= CONFIG.warningThreshold) {
    return { level: 'warning', message: 'Bundle size exceeds target but is acceptable' };
  } else if (size <= CONFIG.criticalThreshold) {
    return { level: 'critical', message: 'Bundle size is too large and needs optimization' };
  } else {
    return {
      level: 'severe',
      message: 'Bundle size is critically large and requires immediate attention',
    };
  }
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(analyses) {
  const recommendations = [];

  // Bundle size recommendations
  if (analyses.metroBundle) {
    const { bundleSize } = analyses.metroBundle;

    if (bundleSize > CONFIG.targetBundleSize) {
      recommendations.push({
        category: 'bundle-size',
        priority: 'high',
        title: 'Reduce bundle size',
        description: `Current bundle size (${utils.formatBytes(bundleSize)}) exceeds target (${utils.formatBytes(CONFIG.targetBundleSize)})`,
        actions: [
          'Enable code splitting for route-based chunks',
          'Implement lazy loading for heavy components',
          'Use tree shaking to eliminate dead code',
          'Optimize image assets and use WebP format',
          'Remove unused dependencies',
        ],
      });
    }
  }

  // Dependency recommendations
  if (analyses.dependencies) {
    const { largestPackages } = analyses.dependencies;

    if (largestPackages.length > 0) {
      recommendations.push({
        category: 'dependencies',
        priority: 'medium',
        title: 'Optimize large dependencies',
        description: `Found ${largestPackages.length} large packages that could be optimized`,
        actions: [
          'Review necessity of large packages',
          'Use tree shaking for libraries like lodash',
          'Consider lighter alternatives',
          'Implement dynamic imports for non-critical packages',
        ],
      });
    }
  }

  // Source code recommendations
  if (analyses.sourceCode) {
    const { largestFiles } = analyses.sourceCode;

    const largeFiles = largestFiles.filter((file) => file.size > 50 * 1024); // > 50KB
    if (largeFiles.length > 0) {
      recommendations.push({
        category: 'source-code',
        priority: 'medium',
        title: 'Optimize large source files',
        description: `Found ${largeFiles.length} large source files`,
        actions: [
          'Split large components into smaller ones',
          'Extract reusable logic into hooks',
          'Move constants to separate files',
          'Consider code splitting for large features',
        ],
      });
    }
  }

  return recommendations;
}

/**
 * Generate comprehensive report
 */
function generateReport(analyses) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      bundleSize: analyses.metroBundle?.formattedSize || 'Unknown',
      bundleStatus: analyses.metroBundle?.status || {
        level: 'unknown',
        message: 'Could not analyze bundle',
      },
      totalDependencies: analyses.dependencies?.totalDependencies || 0,
      totalSourceFiles: analyses.sourceCode?.totalFiles || 0,
      totalSourceSize: analyses.sourceCode
        ? utils.formatBytes(analyses.sourceCode.totalSize)
        : 'Unknown',
    },
    analyses,
    recommendations: generateOptimizationRecommendations(analyses),
  };

  utils.writeReport('bundle-analysis-report.json', report);

  // Generate human-readable summary
  generateSummaryReport(report);

  return report;
}

/**
 * Generate human-readable summary
 */
function generateSummaryReport(report) {
  const summary = `
# Bundle Analysis Report
Generated: ${new Date(report.timestamp).toLocaleString()}

## Summary
- **Bundle Size**: ${report.summary.bundleSize}
- **Status**: ${report.summary.bundleStatus.level.toUpperCase()} - ${report.summary.bundleStatus.message}
- **Dependencies**: ${report.summary.totalDependencies}
- **Source Files**: ${report.summary.totalSourceFiles}
- **Source Size**: ${report.summary.totalSourceSize}

## Recommendations
${report.recommendations
  .map(
    (rec) => `
### ${rec.title} (${rec.priority.toUpperCase()} priority)
${rec.description}

Actions:
${rec.actions.map((action) => `- ${action}`).join('\n')}
`,
  )
  .join('\n')}

## Next Steps
1. Review the detailed analysis files in the bundle-analysis directory
2. Implement high-priority recommendations first
3. Re-run this analysis after optimizations to track progress
4. Set up automated bundle size monitoring in CI/CD

---
For detailed analysis data, check the JSON files in the bundle-analysis directory.
`;

  fs.writeFileSync(path.join(CONFIG.outputDir, 'SUMMARY.md'), summary);
  console.log('📋 Summary report saved: bundle-analysis/SUMMARY.md');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting bundle analysis...\n');

  const analyses = {
    dependencies: analyzeDependencies(),
    sourceCode: analyzeSourceCode(),
    metroBundle: analyzeMetroBundle(),
  };

  console.log('\n📊 Generating comprehensive report...');
  const report = generateReport(analyses);

  console.log('\n✅ Bundle analysis complete!');
  console.log(`📁 Results saved in: ${CONFIG.outputDir}`);

  // Print quick summary
  console.log('\n📋 Quick Summary:');
  console.log(`Bundle Size: ${report.summary.bundleSize}`);
  console.log(`Status: ${report.summary.bundleStatus.level.toUpperCase()}`);
  console.log(`Recommendations: ${report.recommendations.length}`);

  if (report.recommendations.length > 0) {
    console.log('\n🎯 Top Recommendations:');
    report.recommendations
      .filter((rec) => rec.priority === 'high')
      .slice(0, 3)
      .forEach((rec) => {
        console.log(`- ${rec.title}`);
      });
  }

  console.log('\n📖 Read the full report: bundle-analysis/SUMMARY.md');
}

// Run the analysis
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeDependencies,
  analyzeSourceCode,
  analyzeMetroBundle,
  generateReport,
  utils,
};
