/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
module.exports = {
  mutate: [
    'src/services/**/*.ts',
    'src/hooks/**/*.ts',
    'src/utils/**/*.ts',
    'src/context/**/*.ts',
    'src/providers/**/*.ts',
    '!src/**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFindRelatedTests: false
  },
  reporters: ['clear-text', 'progress', 'json'],
  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json'
  },
  coverageAnalysis: 'off',
  timeoutMS: 120000,
  maxConcurrentTestRunners: 2,
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  tempDirName: 'stryker-tmp'
};
