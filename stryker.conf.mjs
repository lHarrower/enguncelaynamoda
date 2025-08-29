// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  testRunnerNodeArgs: ['--max_old_space_size=4096'],
  coverageAnalysis: 'off',
  mutate: ['src/services/accessibilityService.ts', 'src/utils/validation.ts'],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '__tests__',
    '*.config.js',
    '*.config.ts',
  ],
  thresholds: {
    high: 60,
    low: 40,
    break: 20,
  },
  timeoutMS: 60000,
  timeoutFactor: 1.5,
  concurrency: 1,
  tempDirName: 'stryker-tmp',
  cleanTempDir: true,
  logLevel: 'info',
  fileLogLevel: 'trace',
  allowConsoleColors: true,
  dashboard: {
    reportType: 'full',
  },
  htmlReporter: {
    fileName: 'mutation-report.html',
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
};

export default config;
