#!/usr/bin/env node

/**
 * Load Testing Runner for AYNAMODA Database Performance
 * Tests application behavior with large datasets and high load
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class LoadTestingRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      totalDuration: 0,
      testResults: [],
      performanceMetrics: {
        memoryUsage: {},
        databaseOperations: {},
        errorRates: {},
      },
      recommendations: [],
    };
  }

  async runLoadTests() {
    
    

    const startTime = Date.now();

    try {
      // Check if test database is available
      await this.checkDatabaseConnection();

      // Run load tests
      await this.executeLoadTests();

      // Analyze results
      this.analyzeResults();

      // Generate report
      await this.generateReport();
    } catch (error) {
      
      this.results.error = error.message;
    } finally {
      this.results.totalDuration = Date.now() - startTime;
      
    }
  }

  async checkDatabaseConnection() {
    

    try {
      // Mock database connection for load testing
      
    } catch (error) {
      throw new Error(
        'Database connection failed. Please ensure Supabase is configured correctly.',
      );
    }
  }

  async executeLoadTests() {
    

    const testSuites = [
      {
        name: 'Database Performance with Large Datasets',
        pattern: 'Database Performance with Large Datasets',
        timeout: 60000,
      },
      {
        name: 'Memory and Resource Management',
        pattern: 'Memory and Resource Management',
        timeout: 30000,
      },
      {
        name: 'Performance Monitoring Integration',
        pattern: 'Performance Monitoring Integration',
        timeout: 15000,
      },
      {
        name: 'Stress Testing',
        pattern: 'Stress Testing',
        timeout: 45000,
      },
    ];

    for (const suite of testSuites) {
      
      await this.runTestSuite(suite);
    }
  }

  async runTestSuite(suite) {
    const startTime = Date.now();

    try {
      const testCommand = `npm test -- __tests__/load-testing.test.ts --testNamePattern="${suite.pattern}" --verbose --timeout=${suite.timeout}`;

      const output = execSync(testCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: suite.timeout + 10000, // Add buffer time
      });

      const duration = Date.now() - startTime;

      this.results.testResults.push({
        suite: suite.name,
        status: 'passed',
        duration,
        output: this.extractPerformanceMetrics(output),
      });

      
    } catch (error) {
      const duration = Date.now() - startTime;

      this.results.testResults.push({
        suite: suite.name,
        status: 'failed',
        duration,
        error: error.message,
        output: error.stdout || '',
      });

      
      
    }
  }

  extractPerformanceMetrics(output) {
    const metrics = {
      insertPerformance: null,
      queryPerformance: null,
      searchPerformance: null,
      memoryUsage: null,
      concurrentOperations: null,
    };

    // Extract performance data from test output
    const lines = output.split('\n');

    lines.forEach((line) => {
      if (line.includes('Batch Insert Performance:')) {
        const durationMatch = lines.find((l) => l.includes('Duration:'));
        const itemsPerSecMatch = lines.find((l) => l.includes('Items/second:'));

        if (durationMatch && itemsPerSecMatch) {
          metrics.insertPerformance = {
            duration: parseFloat(durationMatch.match(/([0-9.]+)ms/)?.[1] || '0'),
            itemsPerSecond: parseFloat(itemsPerSecMatch.match(/([0-9.]+)/)?.[1] || '0'),
          };
        }
      }

      if (line.includes('Pagination Query Performance:')) {
        const durationMatch = lines.find((l) => l.includes('Duration:'));
        const itemsMatch = lines.find((l) => l.includes('Items Retrieved:'));

        if (durationMatch && itemsMatch) {
          metrics.queryPerformance = {
            duration: parseFloat(durationMatch.match(/([0-9.]+)ms/)?.[1] || '0'),
            itemsRetrieved: parseInt(itemsMatch.match(/([0-9]+)/)?.[1] || '0'),
          };
        }
      }

      if (line.includes('Memory increase after')) {
        const memoryMatch = line.match(/([0-9.]+)MB/);
        if (memoryMatch) {
          metrics.memoryUsage = {
            increaseAfterOperations: parseFloat(memoryMatch[1]),
          };
        }
      }

      if (line.includes('concurrent queries in')) {
        const durationMatch = line.match(/([0-9.]+)ms/);
        const countMatch = line.match(/([0-9]+) concurrent/);

        if (durationMatch && countMatch) {
          metrics.concurrentOperations = {
            count: parseInt(countMatch[1]),
            totalDuration: parseFloat(durationMatch[1]),
          };
        }
      }
    });

    return metrics;
  }

  analyzeResults() {
    

    const passedTests = this.results.testResults.filter((r) => r.status === 'passed').length;
    const totalTests = this.results.testResults.length;
    const successRate = (passedTests / totalTests) * 100;

    this.results.performanceMetrics.successRate = successRate;
    this.results.performanceMetrics.totalTests = totalTests;
    this.results.performanceMetrics.passedTests = passedTests;

    // Analyze performance patterns
    this.analyzePerformancePatterns();

    // Generate recommendations
    this.generateRecommendations();

    
  }

  analyzePerformancePatterns() {
    const patterns = {
      slowOperations: [],
      memoryIssues: [],
      concurrencyIssues: [],
    };

    this.results.testResults.forEach((result) => {
      if (result.output) {
        // Check for slow operations
        if (result.output.insertPerformance?.duration > 20000) {
          patterns.slowOperations.push({
            suite: result.suite,
            operation: 'batch_insert',
            duration: result.output.insertPerformance.duration,
          });
        }

        if (result.output.queryPerformance?.duration > 5000) {
          patterns.slowOperations.push({
            suite: result.suite,
            operation: 'pagination_query',
            duration: result.output.queryPerformance.duration,
          });
        }

        // Check for memory issues
        if (result.output.memoryUsage?.increaseAfterOperations > 30) {
          patterns.memoryIssues.push({
            suite: result.suite,
            memoryIncrease: result.output.memoryUsage.increaseAfterOperations,
          });
        }

        // Check for concurrency issues
        if (result.output.concurrentOperations?.totalDuration > 8000) {
          patterns.concurrencyIssues.push({
            suite: result.suite,
            duration: result.output.concurrentOperations.totalDuration,
            count: result.output.concurrentOperations.count,
          });
        }
      }
    });

    this.results.performanceMetrics.patterns = patterns;
  }

  generateRecommendations() {
    const recommendations = [];
    const patterns = this.results.performanceMetrics.patterns;

    // Database performance recommendations
    if (patterns.slowOperations.length > 0) {
      recommendations.push({
        category: 'Database Performance',
        priority: 'high',
        issue: 'Slow database operations detected',
        recommendation:
          'Consider adding database indexes, optimizing queries, or implementing connection pooling',
        affectedOperations: patterns.slowOperations.map((op) => op.operation),
      });
    }

    // Memory management recommendations
    if (patterns.memoryIssues.length > 0) {
      recommendations.push({
        category: 'Memory Management',
        priority: 'medium',
        issue: 'High memory usage detected during operations',
        recommendation:
          'Implement data pagination, optimize object creation, or add memory cleanup routines',
        affectedSuites: patterns.memoryIssues.map((issue) => issue.suite),
      });
    }

    // Concurrency recommendations
    if (patterns.concurrencyIssues.length > 0) {
      recommendations.push({
        category: 'Concurrency',
        priority: 'medium',
        issue: 'Slow concurrent operations detected',
        recommendation:
          'Optimize connection pooling, implement query queuing, or add rate limiting',
        affectedSuites: patterns.concurrencyIssues.map((issue) => issue.suite),
      });
    }

    // General recommendations based on success rate
    if (this.results.performanceMetrics.successRate < 80) {
      recommendations.push({
        category: 'Test Reliability',
        priority: 'high',
        issue: 'Low test success rate indicates stability issues',
        recommendation:
          'Review error handling, increase timeouts, or improve test environment setup',
      });
    }

    // Performance benchmarks
    const insertPerf = this.results.testResults
      .map((r) => r.output?.insertPerformance?.itemsPerSecond)
      .filter(Boolean)[0];

    if (insertPerf && insertPerf < 50) {
      recommendations.push({
        category: 'Insert Performance',
        priority: 'medium',
        issue: `Low insert performance: ${insertPerf.toFixed(1)} items/second`,
        recommendation:
          'Optimize batch insert operations, review database configuration, or consider bulk loading strategies',
      });
    }

    this.results.recommendations = recommendations;
  }

  async generateReport() {
    

    const reportPath = path.join(process.cwd(), 'load-testing-report.json');
    const summaryPath = path.join(process.cwd(), 'load-testing-summary.md');

    // Save detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Generate markdown summary
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, summary);

    
    

    // Print summary to console
    this.printSummary();
  }

  generateMarkdownSummary() {
    const { performanceMetrics, recommendations, testResults } = this.results;

    return `# Load Testing Report - AYNAMODA

**Generated:** ${this.results.timestamp}  
**Platform:** ${this.results.platform}  
**Node Version:** ${this.results.nodeVersion}  
**Total Duration:** ${this.results.totalDuration}ms

## Summary

- **Success Rate:** ${performanceMetrics.successRate?.toFixed(1)}% (${performanceMetrics.passedTests}/${performanceMetrics.totalTests})
- **Test Suites:** ${testResults.length}
- **Performance Issues:** ${recommendations.filter((r) => r.priority === 'high').length} high priority

## Test Results

${testResults
  .map(
    (result) => `
### ${result.suite}

- **Status:** ${result.status === 'passed' ? '✅ Passed' : '❌ Failed'}
- **Duration:** ${result.duration}ms
${result.error ? `- **Error:** ${result.error}\n` : ''}
${this.formatPerformanceMetrics(result.output)}`,
  )
  .join('')}

## Performance Analysis

${this.formatPerformancePatterns()}

## Recommendations

${recommendations
  .map(
    (rec, index) => `
### ${index + 1}. ${rec.category} (${rec.priority.toUpperCase()} Priority)

**Issue:** ${rec.issue}  
**Recommendation:** ${rec.recommendation}
${rec.affectedOperations ? `**Affected Operations:** ${rec.affectedOperations.join(', ')}\n` : ''}
${rec.affectedSuites ? `**Affected Suites:** ${rec.affectedSuites.join(', ')}\n` : ''}`,
  )
  .join('')}

## Next Steps

1. Address high-priority recommendations first
2. Monitor performance metrics in production
3. Run load tests regularly during development
4. Consider implementing performance monitoring dashboards
5. Review and optimize database queries based on findings
`;
  }

  formatPerformanceMetrics(metrics) {
    if (!metrics) return '';

    let output = '';

    if (metrics.insertPerformance) {
      output += `- **Insert Performance:** ${metrics.insertPerformance.itemsPerSecond?.toFixed(1)} items/second\n`;
    }

    if (metrics.queryPerformance) {
      output += `- **Query Performance:** ${metrics.queryPerformance.itemsRetrieved} items in ${metrics.queryPerformance.duration?.toFixed(1)}ms\n`;
    }

    if (metrics.memoryUsage) {
      output += `- **Memory Usage:** ${metrics.memoryUsage.increaseAfterOperations?.toFixed(1)}MB increase\n`;
    }

    if (metrics.concurrentOperations) {
      output += `- **Concurrent Operations:** ${metrics.concurrentOperations.count} operations in ${metrics.concurrentOperations.totalDuration?.toFixed(1)}ms\n`;
    }

    return output;
  }

  formatPerformancePatterns() {
    const patterns = this.results.performanceMetrics.patterns;
    if (!patterns) return 'No performance patterns detected.';

    let output = '';

    if (patterns.slowOperations.length > 0) {
      output += `\n**Slow Operations Detected:**\n${patterns.slowOperations.map((op) => `- ${op.operation} in ${op.suite}: ${op.duration?.toFixed(1)}ms`).join('\n')}\n`;
    }

    if (patterns.memoryIssues.length > 0) {
      output += `\n**Memory Issues Detected:**\n${patterns.memoryIssues.map((issue) => `- ${issue.suite}: ${issue.memoryIncrease?.toFixed(1)}MB increase`).join('\n')}\n`;
    }

    if (patterns.concurrencyIssues.length > 0) {
      output += `\n**Concurrency Issues Detected:**\n${patterns.concurrencyIssues.map((issue) => `- ${issue.suite}: ${issue.count} operations took ${issue.duration?.toFixed(1)}ms`).join('\n')}\n`;
    }

    return output || 'No significant performance issues detected.';
  }

  printSummary() {
    
    
    

    const { performanceMetrics, recommendations } = this.results;

    
    
    

    if (recommendations.length > 0) {
      
      recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        
      });
    } else {
      
    }

    
    
  }
}

// CLI execution
if (require.main === module) {
  const runner = new LoadTestingRunner();
  runner.runLoadTests().catch((error) => {
    
    process.exit(1);
  });
}

module.exports = LoadTestingRunner;
