#!/usr/bin/env node

/**
 * AYNAMODA Production Environment Validation Script
 * 
 * This script validates that all required environment variables
 * are properly configured for production deployment.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Required environment variables for production
const REQUIRED_ENV_VARS = {
  // Supabase
  'EXPO_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    critical: true
  },
  'EXPO_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anonymous key',
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    critical: true
  },
  
  // Google OAuth
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID': {
    description: 'Google OAuth Web Client ID',
    pattern: /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/,
    critical: true
  },
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID': {
    description: 'Google OAuth Android Client ID',
    pattern: /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/,
    critical: false
  },
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID': {
    description: 'Google OAuth iOS Client ID',
    pattern: /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/,
    critical: false
  },
  
  // AI Services
  'EXPO_PUBLIC_HUGGINGFACE_TOKEN': {
    description: 'Hugging Face API token',
    pattern: /^hf_[a-zA-Z0-9]{34}$/,
    critical: true
  },
  'EXPO_PUBLIC_OPENAI_API_KEY': {
    description: 'OpenAI API key',
    pattern: /^sk-[a-zA-Z0-9]{48}$/,
    critical: false
  },
  
  // Cloudinary
  'EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME': {
    description: 'Cloudinary cloud name',
    pattern: /^[a-zA-Z0-9_-]+$/,
    critical: true
  },
  'EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET': {
    description: 'Cloudinary upload preset',
    pattern: /^[a-zA-Z0-9_-]+$/,
    critical: true
  },
  
  // Monitoring
  'EXPO_PUBLIC_SENTRY_DSN': {
    description: 'Sentry DSN for error monitoring',
    pattern: /^https:\/\/[a-f0-9]+@[a-z0-9.-]+\/[0-9]+$/,
    critical: true
  },
  
  // Optional services
  'EXPO_PUBLIC_WEATHER_API_KEY': {
    description: 'Weather API key',
    pattern: /^[a-zA-Z0-9]+$/,
    critical: false
  }
};

// App Store submission variables
const APP_STORE_VARS = {
  'APPLE_ID': {
    description: 'Apple ID email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    critical: true
  },
  'ASC_APP_ID': {
    description: 'App Store Connect App ID',
    pattern: /^[0-9]{10}$/,
    critical: true
  },
  'APPLE_TEAM_ID': {
    description: 'Apple Team ID',
    pattern: /^[A-Z0-9]{10}$/,
    critical: true
  }
};

class ProductionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logError(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'red');
  }

  logWarning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logSuccess(message) {
    this.passed.push(message);
    this.log(`✅ ${message}`, 'green');
  }

  validateEnvironmentVariable(name, config) {
    const value = process.env[name];
    
    if (!value) {
      if (config.critical) {
        this.logError(`Missing critical environment variable: ${name}`);
        this.logError(`  Description: ${config.description}`);
      } else {
        this.logWarning(`Missing optional environment variable: ${name}`);
        this.logWarning(`  Description: ${config.description}`);
      }
      return false;
    }

    if (config.pattern && !config.pattern.test(value)) {
      this.logError(`Invalid format for ${name}`);
      this.logError(`  Expected pattern: ${config.pattern}`);
      this.logError(`  Description: ${config.description}`);
      return false;
    }

    this.logSuccess(`${name}: Valid`);
    return true;
  }

  async validateSupabaseConnection() {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      this.logError('Cannot validate Supabase connection: missing URL or key');
      return false;
    }

    try {
      const response = await this.makeHttpRequest(`${url}/rest/v1/`, {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      });

      if (response.statusCode === 200) {
        this.logSuccess('Supabase connection: Valid');
        return true;
      } else {
        this.logError(`Supabase connection failed: HTTP ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.logError(`Supabase connection error: ${error.message}`);
      return false;
    }
  }

  async validateSentryDSN() {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    
    if (!dsn) {
      this.logError('Cannot validate Sentry: missing DSN');
      return false;
    }

    try {
      // Extract the base URL from DSN
      const url = new URL(dsn);
      const baseUrl = `${url.protocol}//${url.host}`;
      
      const response = await this.makeHttpRequest(baseUrl);
      
      if (response.statusCode < 400) {
        this.logSuccess('Sentry DSN: Valid');
        return true;
      } else {
        this.logError(`Sentry DSN validation failed: HTTP ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.logError(`Sentry DSN validation error: ${error.message}`);
      return false;
    }
  }

  makeHttpRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { headers }, (response) => {
        resolve(response);
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  validateFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.logSuccess(`${description}: Found`);
      return true;
    } else {
      this.logError(`${description}: Not found at ${filePath}`);
      return false;
    }
  }

  validateAppConfig() {
    const configPath = path.join(process.cwd(), 'app.config.ts');
    
    if (!this.validateFileExists(configPath, 'App configuration')) {
      return false;
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // Check for required configurations
      const requiredConfigs = [
        'bundleIdentifier',
        'package',
        'name',
        'slug',
        'version'
      ];

      let allConfigsFound = true;
      requiredConfigs.forEach(config => {
        if (!configContent.includes(config)) {
          this.logError(`Missing configuration in app.config.ts: ${config}`);
          allConfigsFound = false;
        }
      });

      if (allConfigsFound) {
        this.logSuccess('App configuration: Complete');
      }

      return allConfigsFound;
    } catch (error) {
      this.logError(`Error reading app.config.ts: ${error.message}`);
      return false;
    }
  }

  validateEASConfig() {
    const easConfigPath = path.join(process.cwd(), 'eas.json');
    
    if (!this.validateFileExists(easConfigPath, 'EAS configuration')) {
      return false;
    }

    try {
      const easConfig = JSON.parse(fs.readFileSync(easConfigPath, 'utf8'));
      
      // Check for production build profile
      if (!easConfig.build || !easConfig.build.production) {
        this.logError('Missing production build profile in eas.json');
        return false;
      }

      // Check for submit configuration
      if (!easConfig.submit || !easConfig.submit.production) {
        this.logWarning('Missing production submit configuration in eas.json');
      }

      this.logSuccess('EAS configuration: Valid');
      return true;
    } catch (error) {
      this.logError(`Error parsing eas.json: ${error.message}`);
      return false;
    }
  }

  async runValidation() {
    this.log('\n🔍 AYNAMODA Production Environment Validation', 'cyan');
    this.log('=' .repeat(50), 'cyan');

    // Validate environment variables
    this.log('\n📋 Validating Environment Variables...', 'blue');
    Object.entries(REQUIRED_ENV_VARS).forEach(([name, config]) => {
      this.validateEnvironmentVariable(name, config);
    });

    // Validate App Store variables
    this.log('\n🍎 Validating App Store Variables...', 'blue');
    Object.entries(APP_STORE_VARS).forEach(([name, config]) => {
      this.validateEnvironmentVariable(name, config);
    });

    // Validate configuration files
    this.log('\n📄 Validating Configuration Files...', 'blue');
    this.validateAppConfig();
    this.validateEASConfig();

    // Validate service connections
    this.log('\n🌐 Validating Service Connections...', 'blue');
    await this.validateSupabaseConnection();
    await this.validateSentryDSN();

    // Validate required files
    this.log('\n📁 Validating Required Files...', 'blue');
    this.validateFileExists(
      path.join(process.cwd(), 'keys', 'google-play-service-account.json'),
      'Google Play Service Account Key'
    );

    // Summary
    this.log('\n📊 Validation Summary', 'magenta');
    this.log('=' .repeat(30), 'magenta');
    this.log(`✅ Passed: ${this.passed.length}`, 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errors: ${this.errors.length}`, 'red');

    if (this.errors.length > 0) {
      this.log('\n🚨 Critical Issues Found:', 'red');
      this.errors.forEach(error => {
        this.log(`  • ${error}`, 'red');
      });
      this.log('\n❌ Production deployment is NOT ready!', 'red');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings Found:', 'yellow');
      this.warnings.forEach(warning => {
        this.log(`  • ${warning}`, 'yellow');
      });
      this.log('\n✅ Production deployment is ready with warnings.', 'yellow');
    } else {
      this.log('\n🎉 All validations passed! Production deployment is ready!', 'green');
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new ProductionValidator();
  validator.runValidation().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionValidator;