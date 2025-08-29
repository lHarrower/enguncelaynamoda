#!/usr/bin/env node

/**
 * Comprehensive test runner for AYNAMODA
 * Executes different test suites with appropriate configurations
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test suite configurations
const testSuites = {
  unit: {
    name: 'Unit Tests',
    pattern: '__tests__/**/*.test.{ts,tsx}',
    exclude: ['**/*.{e2e,integration,performance,accessibility}.test.{ts,tsx}'],
    timeout: 10000,
    coverage: true,
    parallel: true,
  },
  integration: {
    name: 'Integration Tests',
    pattern: '__tests__/**/*.integration.test.{ts,tsx}',
    timeout: 30000,
    coverage: true,
    parallel: false,
  },
  e2e: {
    name: 'End-to-End Tests',
    pattern: '__tests__/**/*.e2e.test.{ts,tsx}',
    timeout: 60000,
    coverage: false,
    parallel: false,
  },
  performance: {
    name: 'Performance Tests',
    pattern: '__tests__/**/*.performance.test.{ts,tsx}',
    timeout: 120000,
    coverage: false,
    parallel: false,
  },
  accessibility: {
    name: 'Accessibility Tests',
    pattern: '__tests__/**/*.accessibility.test.{ts,tsx}',
    timeout: 20000,
    coverage: true,
    parallel: true,
  },
};

// Utility functions
function log(message, color = 'reset') {
  process.stdout.write(`${colors[color]}${message}${colors.reset}\n`);
}

function logHeader(message) {
  const border = '='.repeat(message.length + 4);
  log(border, 'cyan');
  log(`  ${message}  `, 'cyan');
  log(border, 'cyan');
}

function logSection(message) {
  log(`\n${'-'.repeat(50)}`, 'blue');
  log(message, 'bright');
  log('-'.repeat(50), 'blue');
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function checkPrerequisites() {
  log('Checking prerequisites...', 'yellow');

  // Check if Jest is installed
  try {
    execSync('npx jest --version', { stdio: 'pipe' });
    log('✓ Jest is available', 'green');
  } catch (error) {
    log('✗ Jest is not installed or not available', 'red');
    process.exit(1);
  }

  // Check if test files exist
  const testDir = path.join(__dirname);
  if (!fs.existsSync(testDir)) {
    log('✗ Test directory not found', 'red');
    process.exit(1);
  }

  log('✓ Prerequisites check passed', 'green');
}

function buildJestCommand(suite, options = {}) {
  const config = testSuites[suite];
  if (!config) {
    throw new Error(`Unknown test suite: ${suite}`);
  }

  let command = 'npx jest';

  // Test pattern
  command += ` --testPathPattern="${config.pattern}"`;

  // Exclude patterns for unit tests
  if (config.exclude) {
    config.exclude.forEach((pattern) => {
      command += ` --testPathIgnorePatterns="${pattern}"`;
    });
  }

  // Timeout
  command += ` --testTimeout=${config.timeout}`;

  // Coverage
  if (config.coverage && !options.noCoverage) {
    command += ' --coverage';
    command += ' --coverageDirectory=coverage';
    command += ' --coverageReporters=text,lcov,html';
  }

  // Parallel execution
  if (config.parallel && !options.noParallel) {
    command += ' --maxWorkers=50%';
  } else {
    command += ' --runInBand';
  }

  // Verbose output
  if (options.verbose) {
    command += ' --verbose';
  }

  // Watch mode
  if (options.watch) {
    command += ' --watch';
  }

  // Bail on first failure
  if (options.bail) {
    command += ' --bail';
  }

  // Silent mode
  if (options.silent) {
    command += ' --silent';
  }

  return command;
}

function runTestSuite(suite, options = {}) {
  const config = testSuites[suite];
  const startTime = Date.now();

  logSection(`Running ${config.name}`);

  try {
    const command = buildJestCommand(suite, options);
    log(`Command: ${command}`, 'blue');

    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });

    const duration = Date.now() - startTime;
    log(`\n✓ ${config.name} completed successfully in ${formatTime(duration)}`, 'green');

    return { success: true, duration, output: result };
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`\n✗ ${config.name} failed after ${formatTime(duration)}`, 'red');

    if (options.verbose) {
      log('Error details:', 'red');
      process.stderr.write(error.stdout || error.message);
    }

    return { success: false, duration, error };
  }
}

function runAllTests(options = {}) {
  const results = {};
  const startTime = Date.now();

  logHeader('AYNAMODA Test Suite Runner');

  checkPrerequisites();

  // Run test suites in order
  const suiteOrder = ['unit', 'integration', 'accessibility', 'performance', 'e2e'];

  for (const suite of suiteOrder) {
    if (options.suites && !options.suites.includes(suite)) {
      log(`Skipping ${testSuites[suite].name}`, 'yellow');
      continue;
    }

    results[suite] = runTestSuite(suite, options);

    // Stop on first failure if bail option is set
    if (options.bail && !results[suite].success) {
      log('Stopping due to test failure (--bail option)', 'red');
      break;
    }
  }

  // Generate summary
  const totalDuration = Date.now() - startTime;
  generateSummary(results, totalDuration);

  // Exit with error code if any tests failed
  const hasFailures = Object.values(results).some((result) => !result.success);
  process.exit(hasFailures ? 1 : 0);
}

function generateSummary(results, totalDuration) {
  logSection('Test Summary');

  const totalTests = 0;
  let passedSuites = 0;
  let failedSuites = 0;

  Object.entries(results).forEach(([suite, result]) => {
    const config = testSuites[suite];
    const status = result.success ? '✓' : '✗';
    const color = result.success ? 'green' : 'red';
    const duration = formatTime(result.duration);

    log(`${status} ${config.name}: ${duration}`, color);

    if (result.success) {
      passedSuites++;
    } else {
      failedSuites++;
    }
  });

  log(`\nTotal Duration: ${formatTime(totalDuration)}`, 'bright');
  log(`Suites Passed: ${passedSuites}`, 'green');
  log(`Suites Failed: ${failedSuites}`, failedSuites > 0 ? 'red' : 'green');

  if (failedSuites === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log(`\n❌ ${failedSuites} test suite(s) failed`, 'red');
  }
}

function showHelp() {
  log('AYNAMODA Test Runner', 'bright');
  log('\nUsage: node runTests.js [options] [suites...]\n');

  log('Options:', 'bright');
  log('  --help, -h          Show this help message');
  log('  --watch, -w         Run tests in watch mode');
  log('  --coverage, -c      Generate coverage report');
  log('  --no-coverage       Disable coverage report');
  log('  --verbose, -v       Verbose output');
  log('  --silent, -s        Silent mode');
  log('  --bail, -b          Stop on first failure');
  log('  --no-parallel       Disable parallel execution');

  log('\nAvailable Test Suites:', 'bright');
  Object.entries(testSuites).forEach(([key, config]) => {
    log(`  ${key.padEnd(12)} ${config.name}`);
  });

  log('\nExamples:', 'bright');
  log('  node runTests.js                    # Run all test suites');
  log('  node runTests.js unit integration   # Run specific suites');
  log('  node runTests.js --watch unit       # Run unit tests in watch mode');
  log('  node runTests.js --coverage         # Run with coverage report');
  log('  node runTests.js --bail             # Stop on first failure');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suites: [],
    watch: false,
    coverage: false,
    noCoverage: false,
    verbose: false,
    silent: false,
    bail: false,
    noParallel: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--coverage':
      case '-c':
        options.coverage = true;
        break;
      case '--no-coverage':
        options.noCoverage = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--silent':
      case '-s':
        options.silent = true;
        break;
      case '--bail':
      case '-b':
        options.bail = true;
        break;
      case '--no-parallel':
        options.noParallel = true;
        break;
      default:
        if (testSuites[arg]) {
          options.suites.push(arg);
        } else if (!arg.startsWith('-')) {
          log(`Unknown test suite: ${arg}`, 'red');
          process.exit(1);
        } else {
          log(`Unknown option: ${arg}`, 'red');
          process.exit(1);
        }
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();

  if (options.watch && options.suites.length === 0) {
    log('Watch mode requires specifying at least one test suite', 'red');
    process.exit(1);
  }

  if (options.watch) {
    // For watch mode, run only the specified suite
    const suite = options.suites[0];
    logHeader(`Running ${testSuites[suite].name} in Watch Mode`);
    runTestSuite(suite, options);
  } else {
    runAllTests(options);
  }
}

module.exports = {
  runTestSuite,
  runAllTests,
  testSuites,
};
