#!/usr/bin/env node

/**
 * AYNAMODA Bundle Optimization Script
 *
 * This script optimizes the bundle by:
 * 1. Removing unused dependencies
 * 2. Cleaning up dead code exports
 * 3. Analyzing bundle size
 * 4. Providing optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleOptimizer {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    this.unusedDeps = [];
    this.unusedDevDeps = [];
    this.deadCodeFiles = [];
    this.optimizations = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
    };
    
  }

  async analyzeUnusedDependencies() {
    this.log('🔍 Analyzing unused dependencies...', 'info');

    try {
      const depcheckOutput = execSync('npx depcheck --skip-missing=true --json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const result = JSON.parse(depcheckOutput);
      this.unusedDeps = result.dependencies || [];
      this.unusedDevDeps = result.devDependencies || [];

      // Filter out dependencies that might be used in production but not detected
      const keepDeps = [
        'expo-updates', // Used in production builds
        'react-dom', // Needed for web builds
        '@sentry/browser', // Platform-specific Sentry
        '@sentry/react', // Platform-specific Sentry
      ];

      this.unusedDeps = this.unusedDeps.filter((dep) => !keepDeps.includes(dep));

      this.log(`Found ${this.unusedDeps.length} unused dependencies`, 'warning');
      this.log(`Found ${this.unusedDevDeps.length} unused dev dependencies`, 'warning');
    } catch (error) {
      this.log(`Error analyzing dependencies: ${error.message}`, 'error');
    }
  }

  async analyzeDeadCode() {
    this.log('🔍 Analyzing dead code...', 'info');

    try {
      const tsPruneOutput = execSync('npx ts-prune -p tsconfig.app.json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Parse ts-prune output to identify files with many unused exports
      const lines = tsPruneOutput.split('\n').filter((line) => line.trim());
      const fileStats = {};

      lines.forEach((line) => {
        const match = line.match(/^(.+?):(\d+) - (.+)/);
        if (match) {
          const [, filePath] = match;
          fileStats[filePath] = (fileStats[filePath] || 0) + 1;
        }
      });

      // Identify files with many unused exports (potential for cleanup)
      this.deadCodeFiles = Object.entries(fileStats)
        .filter(([, count]) => count >= 5)
        .map(([filePath, count]) => ({ filePath, unusedExports: count }));

      this.log(`Found ${this.deadCodeFiles.length} files with significant dead code`, 'warning');
    } catch (error) {
      this.log(`Error analyzing dead code: ${error.message}`, 'error');
    }
  }

  generateOptimizations() {
    this.log('💡 Generating optimization recommendations...', 'info');

    // Dependency optimizations
    if (this.unusedDeps.length > 0) {
      this.optimizations.push({
        type: 'dependencies',
        priority: 'high',
        description: 'Remove unused dependencies',
        action: `npm uninstall ${this.unusedDeps.join(' ')}`,
        impact: 'Reduces bundle size and installation time',
        dependencies: this.unusedDeps,
      });
    }

    if (this.unusedDevDeps.length > 0) {
      this.optimizations.push({
        type: 'devDependencies',
        priority: 'medium',
        description: 'Remove unused dev dependencies',
        action: `npm uninstall ${this.unusedDevDeps.join(' ')}`,
        impact: 'Reduces development environment size',
        dependencies: this.unusedDevDeps,
      });
    }

    // Dead code optimizations
    if (this.deadCodeFiles.length > 0) {
      this.optimizations.push({
        type: 'deadCode',
        priority: 'medium',
        description: 'Clean up files with many unused exports',
        action: 'Manual review and cleanup required',
        impact: 'Reduces bundle size and improves maintainability',
        files: this.deadCodeFiles,
      });
    }

    // Bundle analysis optimization
    this.optimizations.push({
      type: 'analysis',
      priority: 'low',
      description: 'Analyze bundle composition',
      action: 'npm run bundle:analyze',
      impact: 'Identifies largest bundle contributors',
    });
  }

  async removeDependencies(deps, isDev = false) {
    if (deps.length === 0) {
      return;
    }

    const depType = isDev ? 'dev dependencies' : 'dependencies';
    this.log(`🗑️  Removing unused ${depType}...`, 'info');

    try {
      const command = `npm uninstall ${deps.join(' ')}`;
      execSync(command, { stdio: 'inherit' });
      this.log(`✅ Successfully removed ${deps.length} unused ${depType}`, 'success');
    } catch (error) {
      this.log(`❌ Error removing ${depType}: ${error.message}`, 'error');
    }
  }

  printReport() {
    
    this.log('📊 BUNDLE OPTIMIZATION REPORT', 'info');
    

    if (this.optimizations.length === 0) {
      this.log('🎉 No optimizations needed! Bundle is already optimized.', 'success');
      return;
    }

    this.optimizations.forEach((opt, index) => {
      
      
      
      

      if (opt.dependencies) {
        
      }

      if (opt.files) {
        
        opt.files.slice(0, 5).forEach((file) => {
          
        });
      }
    });

    
    this.log('📋 NEXT STEPS:', 'info');
    
    
    
    
    
  }

  async optimize(autoFix = false) {
    this.log('🚀 Starting bundle optimization...', 'info');

    await this.analyzeUnusedDependencies();
    await this.analyzeDeadCode();
    this.generateOptimizations();

    if (autoFix) {
      this.log('🔧 Auto-fixing enabled. Removing unused dependencies...', 'warning');
      await this.removeDependencies(this.unusedDeps, false);
      await this.removeDependencies(this.unusedDevDeps, true);
    }

    this.printReport();

    if (!autoFix && (this.unusedDeps.length > 0 || this.unusedDevDeps.length > 0)) {
      this.log('\n💡 Run with --auto-fix to automatically remove unused dependencies', 'info');
    }
  }
}

// CLI execution
if (require.main === module) {
  const autoFix = process.argv.includes('--auto-fix');
  const optimizer = new BundleOptimizer();

  optimizer.optimize(autoFix).catch((error) => {
    
    process.exit(1);
  });
}

module.exports = BundleOptimizer;
