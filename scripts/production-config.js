#!/usr/bin/env node

/**
 * AYNAMODA Production Configuration Script
 *
 * This script helps identify and replace placeholder values throughout the codebase
 * for production deployment preparation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PLACEHOLDER_PATTERNS = [
  /your_.*_here/gi,
  /example\.com/gi,
  /localhost:\d+/gi,
  /PLACEHOLDER/gi,
  /TODO.*API/gi,
  /CHANGEME/gi,
  /votekgezalqzmjtzebgi/gi, // Invalid Supabase domain
  /https:\/\/example/gi,
  /test@example\.com/gi,
  /your-project-id/gi,
];

const CRITICAL_FILES = [
  '.env',
  '.env.production',
  'app.config.ts',
  'eas.json',
  'src/config/supabaseClient.ts',
  'src/config/openai.ts',
  'src/config/sentry.ts',
];

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.expo/,
  /dist/,
  /build/,
  /coverage/,
  /\.env\.example/,
  /\.env\..*\.template/,
  /README\.md/,
  /CHANGELOG\.md/,
  /\.md$/,
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /scripts\/production-config\.js/,
];

class ProductionConfigChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔍 AYNAMODA Production Configuration Checker\n');

    this.checkEnvironmentFiles();
    this.scanForPlaceholders();
    this.checkCriticalConfigurations();
    this.generateReport();
  }

  /**
   * Check environment configuration files
   */
  checkEnvironmentFiles() {
    console.log('📋 Checking environment configuration...');

    const envFile = path.join(PROJECT_ROOT, '.env');
    const envExampleFile = path.join(PROJECT_ROOT, '.env.example');
    const envProductionTemplate = path.join(PROJECT_ROOT, '.env.production.template');

    if (!fs.existsSync(envFile)) {
      this.issues.push({
        type: 'missing_file',
        file: '.env',
        message: 'Missing .env file. Copy from .env.example or .env.production.template',
        severity: 'critical',
      });
    } else {
      this.checkEnvFileContent(envFile);
    }

    if (!fs.existsSync(envExampleFile)) {
      this.warnings.push({
        type: 'missing_template',
        file: '.env.example',
        message: 'Missing .env.example template file',
      });
    }

    if (fs.existsSync(envProductionTemplate)) {
      this.suggestions.push({
        type: 'template_available',
        message: 'Use .env.production.template as a guide for production configuration',
      });
    }
  }

  /**
   * Check .env file content for placeholder values
   */
  checkEnvFileContent(envFile) {
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (value) {
            PLACEHOLDER_PATTERNS.forEach((pattern) => {
              if (pattern.test(value)) {
                this.issues.push({
                  type: 'placeholder_value',
                  file: '.env',
                  line: index + 1,
                  key: key,
                  value: value,
                  message: `Placeholder value detected: ${key}=${value}`,
                  severity: 'high',
                });
              }
            });
          } else if (key && key.includes('EXPO_PUBLIC_')) {
            this.warnings.push({
              type: 'empty_value',
              file: '.env',
              line: index + 1,
              key: key,
              message: `Empty value for required variable: ${key}`,
            });
          }
        }
      });
    } catch (error) {
      this.issues.push({
        type: 'file_read_error',
        file: '.env',
        message: `Cannot read .env file: ${error.message}`,
        severity: 'critical',
      });
    }
  }

  /**
   * Scan codebase for placeholder patterns
   */
  scanForPlaceholders() {
    console.log('🔎 Scanning codebase for placeholders...');

    this.scanDirectory(PROJECT_ROOT);
  }

  /**
   * Recursively scan directory for placeholder patterns
   */
  scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(PROJECT_ROOT, fullPath);

        // Skip excluded patterns
        if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(relativePath))) {
          return;
        }

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stat.isFile() && this.shouldScanFile(fullPath)) {
          this.scanFile(fullPath);
        }
      });
    } catch (error) {
      // Skip directories we can't read
    }
  }

  /**
   * Check if file should be scanned
   */
  shouldScanFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const scanExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt'];
    return scanExtensions.includes(ext);
  }

  /**
   * Scan individual file for placeholder patterns
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(PROJECT_ROOT, filePath);

      lines.forEach((line, index) => {
        PLACEHOLDER_PATTERNS.forEach((pattern) => {
          if (pattern.test(line)) {
            this.issues.push({
              type: 'placeholder_in_code',
              file: relativePath,
              line: index + 1,
              content: line.trim(),
              message: `Placeholder pattern found: ${pattern}`,
              severity: 'medium',
            });
          }
        });
      });
    } catch (error) {
      // Skip files we can't read
    }
  }

  /**
   * Check critical configuration files
   */
  checkCriticalConfigurations() {
    console.log('⚙️  Checking critical configurations...');

    CRITICAL_FILES.forEach((file) => {
      const filePath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(filePath)) {
        this.checkCriticalFile(filePath);
      } else if (file === '.env') {
        // Already handled in checkEnvironmentFiles
      } else {
        this.warnings.push({
          type: 'missing_critical_file',
          file: file,
          message: `Critical configuration file missing: ${file}`,
        });
      }
    });
  }

  /**
   * Check critical configuration file
   */
  checkCriticalFile(filePath) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);

    // Add specific checks based on file type
    if (relativePath.includes('supabaseClient')) {
      this.checkSupabaseConfig(filePath);
    } else if (relativePath.includes('app.config')) {
      this.checkAppConfig(filePath);
    } else if (relativePath.includes('eas.json')) {
      this.checkEasConfig(filePath);
    }
  }

  /**
   * Check Supabase configuration
   */
  checkSupabaseConfig(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('votekgezalqzmjtzebgi')) {
        this.issues.push({
          type: 'invalid_supabase_url',
          file: path.relative(PROJECT_ROOT, filePath),
          message: 'Invalid Supabase URL detected in configuration',
          severity: 'critical',
        });
      }
    } catch (error) {
      // Skip if can't read
    }
  }

  /**
   * Check app configuration
   */
  checkAppConfig(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('com.yourcompany.yourapp')) {
        this.issues.push({
          type: 'placeholder_bundle_id',
          file: path.relative(PROJECT_ROOT, filePath),
          message: 'Placeholder bundle identifier found in app config',
          severity: 'high',
        });
      }
    } catch (error) {
      // Skip if can't read
    }
  }

  /**
   * Check EAS configuration
   */
  checkEasConfig(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(content);

      if (config.build && config.build.production) {
        const prodConfig = config.build.production;

        if (!prodConfig.env || Object.keys(prodConfig.env).length === 0) {
          this.warnings.push({
            type: 'missing_production_env',
            file: path.relative(PROJECT_ROOT, filePath),
            message: 'No production environment variables configured in EAS',
          });
        }
      }
    } catch (error) {
      this.warnings.push({
        type: 'invalid_eas_config',
        file: path.relative(PROJECT_ROOT, filePath),
        message: 'Invalid EAS configuration file',
      });
    }
  }

  /**
   * Generate and display report
   */
  generateReport() {
    console.log('\n📊 Production Configuration Report\n');

    // Critical issues
    const criticalIssues = this.issues.filter((issue) => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Must fix before production):');
      criticalIssues.forEach((issue) => {
        console.log(`   ❌ ${issue.file}${issue.line ? `:${issue.line}` : ''} - ${issue.message}`);
      });
      console.log('');
    }

    // High priority issues
    const highIssues = this.issues.filter((issue) => issue.severity === 'high');
    if (highIssues.length > 0) {
      console.log('⚠️  HIGH PRIORITY ISSUES:');
      highIssues.forEach((issue) => {
        console.log(`   🔸 ${issue.file}${issue.line ? `:${issue.line}` : ''} - ${issue.message}`);
      });
      console.log('');
    }

    // Medium priority issues
    const mediumIssues = this.issues.filter((issue) => issue.severity === 'medium');
    if (mediumIssues.length > 0) {
      console.log('📋 MEDIUM PRIORITY ISSUES:');
      mediumIssues.forEach((issue) => {
        console.log(`   🔹 ${issue.file}${issue.line ? `:${issue.line}` : ''} - ${issue.message}`);
      });
      console.log('');
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚡ WARNINGS:');
      this.warnings.forEach((warning) => {
        console.log(
          `   💡 ${warning.file || 'General'}${warning.line ? `:${warning.line}` : ''} - ${warning.message}`,
        );
      });
      console.log('');
    }

    // Suggestions
    if (this.suggestions.length > 0) {
      console.log('💡 SUGGESTIONS:');
      this.suggestions.forEach((suggestion) => {
        console.log(`   ✨ ${suggestion.message}`);
      });
      console.log('');
    }

    // Summary
    const totalIssues = this.issues.length;
    const totalWarnings = this.warnings.length;

    console.log('📈 SUMMARY:');
    console.log(
      `   Issues: ${totalIssues} (${criticalIssues.length} critical, ${highIssues.length} high, ${mediumIssues.length} medium)`,
    );
    console.log(`   Warnings: ${totalWarnings}`);
    console.log(`   Suggestions: ${this.suggestions.length}`);

    if (criticalIssues.length === 0 && highIssues.length === 0) {
      console.log('\n✅ Ready for production deployment!');
    } else {
      console.log(
        '\n❌ Not ready for production. Please address critical and high priority issues.',
      );
    }

    // Next steps
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Copy .env.production.template to .env');
    console.log('   2. Fill in all required environment variables');
    console.log('   3. Configure Supabase project and get real API keys');
    console.log('   4. Set up Google OAuth credentials');
    console.log('   5. Configure Cloudinary for image uploads');
    console.log('   6. Set up Sentry for error monitoring');
    console.log('   7. Run this script again to verify configuration');
    console.log('   8. Test production build: npm run build');
  }
}

// Run the checker
if (require.main === module) {
  const checker = new ProductionConfigChecker();
  checker.run().catch(console.error);
}

module.exports = ProductionConfigChecker;
