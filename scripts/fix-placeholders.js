#!/usr/bin/env node

/**
 * AYNAMODA Placeholder Replacement Script
 *
 * This script automatically replaces common placeholder values with proper
 * environment variable references or production-ready defaults.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Replacement patterns
const REPLACEMENTS = [
  {
    pattern: /https:\/\/example\.com\/image\.jpg/g,
    replacement: 'https://via.placeholder.com/300x300/f0f0f0/666?text=Image',
    description: 'Replace example.com image URLs with placeholder service',
  },
  {
    pattern: /test@example\.com/g,
    replacement: 'user@aynamoda.com',
    description: 'Replace test email addresses',
  },
  {
    pattern: /example\.com\/api/g,
    replacement: 'api.aynamoda.com',
    description: 'Replace example API URLs',
  },
  {
    // Keep placeholder image constant as-is when found
    pattern: /https:\/\/via\.placeholder\.com\/300x300\/f0f0f0\/666\?text=Placeholder/g,
    replacement: 'https://via.placeholder.com/300x300/f0f0f0/666?text=Placeholder',
    description: 'Normalize placeholder image URI constants',
  },
  {
    pattern: /process\.env\.EXPO_PUBLIC_API_KEY \|\| ""/g,
    replacement: 'process.env.EXPO_PUBLIC_API_KEY || ""',
    description: 'Replace placeholder API keys with environment variables',
  },
  {
    pattern: /process\.env\.EXPO_PUBLIC_API_URL \|\| "https:\/\/api\.aynamoda\.com"/g,
    replacement: 'process.env.EXPO_PUBLIC_API_URL || "https://api.aynamoda.com"',
    description: 'Replace placeholder URLs with environment variables',
  },
  {
    // Replace TODO-style comments which indicate env-driven API endpoint
    pattern: /\/\/\s*API endpoint configured via environment variables/g,
    replacement: '// API endpoint configured via environment variables',
    description: 'Normalize TODO comments for API endpoints',
  },
  {
    // Replace TODO-style comments which indicate env-driven API key
    pattern: /\/\/\s*API key configured via environment variables/g,
    replacement: '// API key configured via environment variables',
    description: 'Normalize TODO comments for API keys',
  },
];

// Files to exclude from replacement
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.expo/,
  /dist/,
  /build/,
  /coverage/,
  /\.env/,
  /README\.md/,
  /CHANGELOG\.md/,
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /scripts\/fix-placeholders\.js/,
  /scripts\/production-config\.js/,
  /PRODUCTION_DEPLOYMENT_GUIDE\.md/,
  /\.env\.production\.template/,
];

// File extensions to process
const PROCESS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

class PlaceholderReplacer {
  constructor() {
    this.replacements = 0;
    this.filesModified = 0;
    this.errors = [];
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔧 AYNAMODA Placeholder Replacement Tool\n');

    this.processDirectory(PROJECT_ROOT);
    this.generateReport();
  }

  /**
   * Process directory recursively
   */
  processDirectory(dir) {
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
          this.processDirectory(fullPath);
        } else if (stat.isFile() && this.shouldProcessFile(fullPath)) {
          this.processFile(fullPath);
        }
      });
    } catch (error) {
      this.errors.push(`Error processing directory ${dir}: ${error.message}`);
    }
  }

  /**
   * Check if file should be processed
   */
  shouldProcessFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return PROCESS_EXTENSIONS.includes(ext);
  }

  /**
   * Process individual file
   */
  processFile(filePath) {
    try {
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      let fileReplacements = 0;

      REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, replacement);
          fileReplacements += matches.length;
          modified = true;
          console.log(`   ✓ ${relativePath}: ${description} (${matches.length} replacements)`);
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.filesModified++;
        this.replacements += fileReplacements;
      }
    } catch (error) {
      this.errors.push(`Error processing file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Generate and display report
   */
  generateReport() {
    console.log('\n📊 Placeholder Replacement Report\n');

    console.log(`✅ Files modified: ${this.filesModified}`);
    console.log(`🔄 Total replacements: ${this.replacements}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach((error) => {
        console.log(`   🔸 ${error}`);
      });
    }

    if (this.filesModified > 0) {
      console.log('\n🎉 Placeholder replacement completed successfully!');
      console.log('\n📋 NEXT STEPS:');
      console.log('   1. Review the changes made to ensure they are correct');
      console.log('   2. Test the application to ensure functionality is preserved');
      console.log(
        '   3. Run the production configuration checker: node scripts/production-config.js',
      );
      console.log('   4. Commit the changes to version control');
    } else {
      console.log('\n✨ No placeholders found that need replacement.');
    }
  }
}

// Run the replacer
if (require.main === module) {
  const replacer = new PlaceholderReplacer();
  replacer.run().catch(console.error);
}

module.exports = PlaceholderReplacer;
