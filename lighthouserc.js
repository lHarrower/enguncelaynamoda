/**
 * Lighthouse CI Configuration
 * Performance monitoring configuration for CI/CD pipeline
 */
module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000',
        'http://localhost:3000/wardrobe',
        'http://localhost:3000/mirror',
        'http://localhost:3000/profile',
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Chrome flags for headless testing
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
      },
    },
    assert: {
      // Performance thresholds
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],

        // Core Web Vitals thresholds
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'max-potential-fid': ['warn', { maxNumericValue: 100 }],
        interactive: ['warn', { maxNumericValue: 3000 }],

        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],

        // Image optimization
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        'efficiently-encode-images': ['warn', { maxNumericValue: 100000 }],
        'properly-size-images': ['warn', { maxNumericValue: 100000 }],
      },
    },
    upload: {
      // Store results in local directory for now
      target: 'filesystem',
      outputDir: './audit/out/lighthouse-ci',
    },
    server: {
      // Optional: Configure LHCI server for historical data
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com'
    },
  },
};
