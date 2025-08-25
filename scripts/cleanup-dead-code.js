#!/usr/bin/env node

/**
 * AYNAMODA Dead Code Cleanup Script
 *
 * This script identifies and removes unused exports from files
 * to reduce bundle size and improve maintainability.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeadCodeCleaner {
  constructor() {
    this.projectRoot = process.cwd();
    this.unusedExports = new Map();
    this.filesToClean = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async analyzeUnusedExports() {
    this.log('🔍 Analyzing unused exports...', 'info');

    try {
      const tsPruneOutput = execSync('npx ts-prune -p tsconfig.app.json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const lines = tsPruneOutput.split('\n').filter((line) => line.trim());

      lines.forEach((line) => {
        const match = line.match(/^(.+?):(\d+) - (.+?)( \(used in module\))?$/);
        if (match) {
          const [, filePath, lineNumber, exportName, usedInModule] = match;

          // Skip exports that are used in module (re-exports)
          if (usedInModule) {
            return;
          }

          if (!this.unusedExports.has(filePath)) {
            this.unusedExports.set(filePath, []);
          }

          this.unusedExports.get(filePath).push({
            line: parseInt(lineNumber),
            name: exportName,
            fullLine: line,
          });
        }
      });

      // Identify files with significant unused exports
      this.filesToClean = Array.from(this.unusedExports.entries())
        .filter(([, exports]) => exports.length >= 5)
        .map(([filePath, exports]) => ({ filePath, exports }));

      this.log(
        `Found ${this.filesToClean.length} files with significant unused exports`,
        'warning',
      );
    } catch (error) {
      this.log(`Error analyzing unused exports: ${error.message}`, 'error');
    }
  }

  cleanComponentsIndex() {
    const componentsIndexPath = path.join(this.projectRoot, 'src', 'components', 'index.ts');

    if (!fs.existsSync(componentsIndexPath)) {
      this.log('Components index file not found', 'warning');
      return;
    }

    this.log('🧹 Cleaning components index file...', 'info');

    const content = fs.readFileSync(componentsIndexPath, 'utf8');
    const lines = content.split('\n');

    // Keep only essential exports and remove unused feature collections
    const essentialExports = [
      // Core atomic design exports
      "export * from '@/components/atoms';",
      "export * from '@/components/molecules';",
      "export * from '@/components/organisms';",
      "export * from '@/components/shared';",

      // Essential individual components
      "export { default as ErrorBoundary } from '@/components/error/ErrorBoundary';",
      "export { default as ModernLoading } from '@/components/ModernLoading';",
      "export { default as PermissionManager } from '@/components/PermissionManager';",

      // Core feature collections that are actively used
      "export * as AuthComponents from '@/components/auth';",
      "export * as NavigationComponents from '@/components/navigation';",
      "export * as WardrobeComponents from '@/components/wardrobe';",
      "export * as OnboardingComponents from '@/components/onboarding';",
      "export * as HomeComponents from '@/components/home';",
    ];

    const newContent = `/**
 * Components Index
 *
 * Main entry point for core components following atomic design principles.
 * Only exports actively used components to optimize bundle size.
 */

// Atomic Design Exports
export * from '@/components/atoms';
export * from '@/components/molecules';
export * from '@/components/organisms';
export * from '@/components/shared';

// Essential Individual Components
export { default as ErrorBoundary } from '@/components/error/ErrorBoundary';
export { default as ModernLoading } from '@/components/ModernLoading';
export { default as PermissionManager } from '@/components/PermissionManager';

// Core Feature Collections
export * as AuthComponents from '@/components/auth';
export * as NavigationComponents from '@/components/navigation';
export * as WardrobeComponents from '@/components/wardrobe';
export * as OnboardingComponents from '@/components/onboarding';
export * as HomeComponents from '@/components/home';

/**
 * Atomic Design Component Categories
 *
 * ATOMS: Basic building blocks (Button, Input, Text, etc.)
 * MOLECULES: Functional combinations of atoms (FormField, Card, etc.)
 * ORGANISMS: Complex interface sections (Header, Form, Dashboard, etc.)
 *
 * This structure promotes:
 * - Reusability and consistency
 * - Clear component hierarchy
 * - Easier testing and maintenance
 * - Better design system adherence
 */
`;

    fs.writeFileSync(componentsIndexPath, newContent, 'utf8');
    this.log('✅ Components index file cleaned', 'success');
  }

  cleanConstantsFiles() {
    const constantsFiles = [
      'src/constants/AppConstants.ts',
      'src/constants/AppThemeV2.ts',
      'src/constants/AynaModaVisionTheme.ts',
    ];

    constantsFiles.forEach((filePath) => {
      const fullPath = path.join(this.projectRoot, filePath);

      if (!fs.existsSync(fullPath)) {
        return;
      }

      const fileExports = this.unusedExports.get(`\\${filePath.replace(/\//g, '\\')}`);
      if (!fileExports || fileExports.length === 0) {
        return;
      }

      this.log(`🧹 Cleaning ${filePath}...`, 'info');

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      // Remove lines with unused exports
      const cleanedLines = lines.filter((line, index) => {
        const lineNumber = index + 1;
        const hasUnusedExport = fileExports.some((exp) => exp.line === lineNumber);

        if (hasUnusedExport) {
          this.log(`  Removing unused export at line ${lineNumber}`, 'warning');
          return false;
        }

        return true;
      });

      fs.writeFileSync(fullPath, cleanedLines.join('\n'), 'utf8');
      this.log(`✅ Cleaned ${filePath}`, 'success');
    });
  }

  cleanMetricsConfig() {
    const metricsConfigPath = path.join(this.projectRoot, 'src', 'config', 'metricsConfig.ts');

    if (!fs.existsSync(metricsConfigPath)) {
      return;
    }

    this.log('🧹 Cleaning metrics config...', 'info');

    const content = fs.readFileSync(metricsConfigPath, 'utf8');

    // Keep only essential metrics exports
    const cleanedContent = content
      .split('\n')
      .filter((line) => {
        // Keep core metrics but remove unused detailed configurations
        if (
          line.includes('export') &&
          (line.includes('DetailedMetric') ||
            line.includes('AdvancedMetric') ||
            line.includes('ExperimentalMetric'))
        ) {
          return false;
        }
        return true;
      })
      .join('\n');

    fs.writeFileSync(metricsConfigPath, cleanedContent, 'utf8');
    this.log('✅ Metrics config cleaned', 'success');
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    this.log('📊 DEAD CODE CLEANUP REPORT', 'info');
    console.log('='.repeat(60));

    if (this.filesToClean.length === 0) {
      this.log('🎉 No significant dead code found!', 'success');
      return;
    }

    this.log(`📁 Files processed: ${this.filesToClean.length}`, 'info');

    this.filesToClean.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.filePath}`);
      console.log(`   Unused exports: ${file.exports.length}`);

      // Show first few unused exports
      file.exports.slice(0, 3).forEach((exp) => {
        console.log(`     - Line ${exp.line}: ${exp.name}`);
      });

      if (file.exports.length > 3) {
        console.log(`     ... and ${file.exports.length - 3} more`);
      }
    });

    console.log('\n' + '='.repeat(60));
    this.log('📋 CLEANUP ACTIONS TAKEN:', 'info');
    console.log('✅ Cleaned components index file');
    console.log('✅ Cleaned constants files');
    console.log('✅ Cleaned metrics configuration');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Test the application to ensure functionality is preserved');
    console.log('2. Run tests: npm test');
    console.log('3. Check for any import errors');
    console.log('4. Commit the changes if everything works correctly');
  }

  async cleanup() {
    await this.analyzeUnusedExports();
    this.cleanComponentsIndex();
    this.cleanConstantsFiles();
    this.cleanMetricsConfig();
    this.printReport();
  }
}

if (require.main === module) {
  const cleaner = new DeadCodeCleaner();

  cleaner.cleanup().catch((error) => {
    console.error('Cleanup failed:', error);
    process.exitCode = 1;
  });
}

module.exports = DeadCodeCleaner;
