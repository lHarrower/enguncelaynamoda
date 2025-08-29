#!/usr/bin/env node

/**
 * Chaos Engineering Test Runner for AYNAMODA
 *
 * This script runs chaos engineering tests to validate application resilience
 * under various failure scenarios including:
 * - Database connection failures
 * - API service timeouts
 * - Storage quota issues
 * - Memory pressure
 * - Network instability
 * - Cascading failures
 *
 * Usage: node scripts/run-chaos-testing.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
  testFile: '__tests__/chaos-engineering.test.ts',
  outputDir: path.join(process.cwd(), 'chaos-testing-reports'),
  timeout: 300000, // 5 minutes
  retries: 2,
};

// Chaos test scenarios
const CHAOS_SCENARIOS = [
  {
    name: 'Database Resilience',
    pattern: 'Database Resilience Testing',
    description: 'Tests database connection failures and recovery',
  },
  {
    name: 'API Service Resilience',
    pattern: 'API Service Resilience Testing',
    description: 'Tests API timeouts and fallback mechanisms',
  },
  {
    name: 'Storage Resilience',
    pattern: 'Storage Resilience Testing',
    description: 'Tests storage quota and access issues',
  },
  {
    name: 'Memory Pressure',
    pattern: 'Memory Pressure Testing',
    description: 'Tests application behavior under memory constraints',
  },
  {
    name: 'Network Instability',
    pattern: 'Network Instability Testing',
    description: 'Tests intermittent network failures and retry logic',
  },
  {
    name: 'Cascading Failures',
    pattern: 'Cascading Failure Testing',
    description: 'Tests multiple simultaneous service failures',
  },
  {
    name: 'Data Corruption',
    pattern: 'Data Corruption Resilience',
    description: 'Tests handling of corrupted or malformed data',
  },
  {
    name: 'Recovery Testing',
    pattern: 'Recovery Testing',
    description: 'Tests service recovery and restoration',
  },
];

// Utility functions
function createOutputDirectory() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

function checkTestEnvironment() {
  

  // Check if test file exists
  if (!fs.existsSync(CONFIG.testFile)) {
    throw new Error(`Chaos test file not found: ${CONFIG.testFile}`);
  }

  // Check Node.js version
  const nodeVersion = process.version;
  

  // Check available memory
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  console.log(
    `   Available Memory: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB / ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB`,
  );

  // Check if Jest is available
  try {
    execSync('npm list jest', { stdio: 'pipe' });
    
  } catch (error) {
    
  }

  
}

function runChaosTestSuite(scenario) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    

    const testCommand = [
      'npm',
      'test',
      '--',
      CONFIG.testFile,
      '--testNamePattern',
      `"${scenario.pattern}"`,
      '--verbose',
      '--detectOpenHandles',
      '--forceExit',
    ];

    const testProcess = spawn(testCommand[0], testCommand.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      testProcess.kill('SIGKILL');
      reject(new Error(`Test timeout after ${CONFIG.timeout}ms`));
    }, CONFIG.timeout);

    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        scenario: scenario.name,
        description: scenario.description,
        success: code === 0,
        duration,
        exitCode: code,
        stdout,
        stderr,
        timestamp: getCurrentTimestamp(),
      };

      if (code === 0) {
        
      } else {
        
      }

      resolve(result);
    });

    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function extractChaosMetrics(testOutput) {
  const metrics = {
    totalScenarios: 0,
    passedScenarios: 0,
    failedScenarios: 0,
    totalDuration: 0,
    memoryMetrics: [],
    resilienceMetrics: [],
    recoveryMetrics: [],
  };

  // Extract test results
  const testSuiteMatch = testOutput.match(/Test Suites: (\d+) (passed|failed), (\d+) total/);
  if (testSuiteMatch) {
    metrics.totalScenarios = parseInt(testSuiteMatch[3]);
    if (testSuiteMatch[2] === 'passed') {
      metrics.passedScenarios = parseInt(testSuiteMatch[1]);
    } else {
      metrics.failedScenarios = parseInt(testSuiteMatch[1]);
    }
  }

  // Extract performance metrics
  const durationMatches = testOutput.match(/Duration: ([\d.]+)ms/g);
  if (durationMatches) {
    durationMatches.forEach((match) => {
      const duration = parseFloat(match.match(/([\d.]+)/)[1]);
      metrics.totalDuration += duration;
    });
  }

  // Extract memory metrics
  const memoryMatches = testOutput.match(/Memory Delta: ([\d.]+)(KB|MB)/g);
  if (memoryMatches) {
    memoryMatches.forEach((match) => {
      const [, value, unit] = match.match(/Memory Delta: ([\d.]+)(KB|MB)/);
      const memoryMB = unit === 'KB' ? parseFloat(value) / 1024 : parseFloat(value);
      metrics.memoryMetrics.push(memoryMB);
    });
  }

  // Extract resilience metrics
  const resilienceMatches = testOutput.match(
    /(Fallback|Recovery|Retry) (Duration|Attempts): ([\d.]+)/g,
  );
  if (resilienceMatches) {
    resilienceMatches.forEach((match) => {
      const [, type, metric, value] = match.match(
        /(Fallback|Recovery|Retry) (Duration|Attempts): ([\d.]+)/,
      );
      metrics.resilienceMetrics.push({
        type: type.toLowerCase(),
        metric: metric.toLowerCase(),
        value: parseFloat(value),
      });
    });
  }

  return metrics;
}

function analyzeResults(results) {
  const analysis = {
    overallSuccess: true,
    successRate: 0,
    totalDuration: 0,
    averageDuration: 0,
    criticalFailures: [],
    recommendations: [],
    resilienceScore: 0,
  };

  const successfulTests = results.filter((r) => r.success);
  analysis.successRate = (successfulTests.length / results.length) * 100;
  analysis.overallSuccess = analysis.successRate >= 80; // 80% threshold

  analysis.totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  analysis.averageDuration = analysis.totalDuration / results.length;

  // Identify critical failures
  results.forEach((result) => {
    if (!result.success) {
      const isCritical =
        result.scenario.includes('Database') ||
        result.scenario.includes('Cascading') ||
        result.duration > 30000;

      if (isCritical) {
        analysis.criticalFailures.push({
          scenario: result.scenario,
          reason: result.stderr || 'Unknown failure',
          duration: result.duration,
        });
      }
    }
  });

  // Generate recommendations
  if (analysis.successRate < 100) {
    analysis.recommendations.push('Improve error handling and fallback mechanisms');
  }

  if (analysis.averageDuration > 10000) {
    analysis.recommendations.push('Optimize response times for failure scenarios');
  }

  if (analysis.criticalFailures.length > 0) {
    analysis.recommendations.push('Address critical failure scenarios immediately');
    analysis.recommendations.push('Implement circuit breaker patterns for external dependencies');
  }

  // Calculate resilience score (0-100)
  let score = analysis.successRate;
  if (analysis.averageDuration < 5000) score += 10;
  if (analysis.criticalFailures.length === 0) score += 10;
  analysis.resilienceScore = Math.min(100, score);

  return analysis;
}

function generateReport(results, analysis) {
  const timestamp = getCurrentTimestamp();
  const reportData = {
    timestamp,
    platform: os.platform(),
    nodeVersion: process.version,
    testResults: results,
    analysis,
    summary: {
      totalScenarios: results.length,
      successfulScenarios: results.filter((r) => r.success).length,
      failedScenarios: results.filter((r) => !r.success).length,
      totalDuration: analysis.totalDuration,
      resilienceScore: analysis.resilienceScore,
    },
  };

  // Save detailed JSON report
  const jsonReportPath = path.join(CONFIG.outputDir, 'chaos-testing-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));

  // Generate markdown summary
  const markdownReport = `# Chaos Engineering Report - AYNAMODA

**Generated:** ${timestamp}  
**Platform:** ${os.platform()}  
**Node Version:** ${process.version}  
**Total Duration:** ${formatDuration(analysis.totalDuration)}

## Summary

- **Resilience Score:** ${analysis.resilienceScore}/100
- **Success Rate:** ${analysis.successRate.toFixed(1)}% (${results.filter((r) => r.success).length}/${results.length})
- **Critical Failures:** ${analysis.criticalFailures.length}
- **Average Response Time:** ${formatDuration(analysis.averageDuration)}

## Test Results

${results
  .map(
    (result) => `
### ${result.scenario}

- **Status:** ${result.success ? '✅ Passed' : '❌ Failed'}
- **Duration:** ${formatDuration(result.duration)}
- **Description:** ${result.description}
${!result.success ? `- **Error:** ${result.stderr.split('\n')[0] || 'Unknown error'}` : ''}
`,
  )
  .join('')}

## Analysis

${
  analysis.overallSuccess
    ? '✅ **Overall Status:** Application demonstrates good resilience under chaos conditions.'
    : '⚠️ **Overall Status:** Application resilience needs improvement.'
}

### Critical Failures

${
  analysis.criticalFailures.length === 0
    ? 'No critical failures detected.'
    : analysis.criticalFailures
        .map(
          (failure) =>
            `- **${failure.scenario}:** ${failure.reason} (${formatDuration(failure.duration)})`,
        )
        .join('\n')
}

### Recommendations

${
  analysis.recommendations.length === 0
    ? 'No specific recommendations. Continue monitoring resilience in production.'
    : analysis.recommendations.map((rec) => `- ${rec}`).join('\n')
}

## Next Steps

1. Address critical failures first
2. Implement recommended improvements
3. Run chaos tests regularly in staging environment
4. Monitor resilience metrics in production
5. Update chaos scenarios based on real-world failures
`;

  const markdownReportPath = path.join(CONFIG.outputDir, 'chaos-testing-summary.md');
  fs.writeFileSync(markdownReportPath, markdownReport);

  
  

  return { jsonReportPath, markdownReportPath };
}

// Main execution
async function main() {
  const startTime = Date.now();

  
  

  try {
    // Setup
    checkTestEnvironment();
    createOutputDirectory();

    

    // Run chaos test scenarios
    const results = [];
    for (const scenario of CHAOS_SCENARIOS) {
      try {
        const result = await runChaosTestSuite(scenario);
        results.push(result);
      } catch (error) {
        
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          success: false,
          duration: 0,
          exitCode: 1,
          stdout: '',
          stderr: error.message,
          timestamp: getCurrentTimestamp(),
        });
      }
    }

    
    const analysis = analyzeResults(results);

    
    

    
    generateReport(results, analysis);

    // Display summary
    
    
    

    
    
    
    

    if (analysis.criticalFailures.length > 0) {
      
      analysis.criticalFailures.forEach((failure) => {
        
      });
    }

    if (analysis.recommendations.length > 0) {
      
      analysis.recommendations.forEach((rec) => {
        
      });
    }

    if (analysis.overallSuccess) {
      
    } else {
      
    }

    
    
  } catch (error) {
    
    process.exit(1);
  }

  const endTime = Date.now();
  
}

// Run the chaos testing suite
if (require.main === module) {
  main().catch((error) => {
    
    process.exit(1);
  });
}

module.exports = {
  runChaosTestSuite,
  extractChaosMetrics,
  analyzeResults,
  generateReport,
  CHAOS_SCENARIOS,
};
