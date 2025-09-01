# AYNAMODA Testing Suite

Comprehensive testing setup for the AYNAMODA wardrobe management application, covering unit tests, integration tests, end-to-end tests, performance tests, and accessibility tests.

## 📁 Test Structure

```
__tests__/
├── setup.ts                           # Global test setup and configuration
├── runTests.js                         # Test runner script
├── README.md                           # This documentation
├── utils/
│   └── testUtils.tsx                   # Test utilities and helpers
├── mocks/
│   └── index.ts                        # Mock implementations
├── services/
│   ├── WardrobeService.test.ts         # WardrobeService unit tests
│   ├── AIService.test.ts               # AIService unit tests
│   └── ErrorHandler.test.ts            # ErrorHandler unit tests
├── components/
│   ├── WardrobeCard.test.tsx           # WardrobeCard component tests
│   └── ErrorBoundary.test.tsx          # ErrorBoundary component tests
├── hooks/
│   └── useErrorRecovery.test.ts        # Error recovery hooks tests
├── integration/
│   └── ErrorHandling.integration.test.tsx  # Integration tests
├── e2e/
│   └── WardrobeManagement.e2e.test.tsx     # End-to-end tests
├── performance/
│   └── WardrobeService.performance.test.ts # Performance tests
└── accessibility/
    └── Accessibility.test.tsx          # Accessibility tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- React Native development environment set up
- Jest and testing dependencies installed

### Installation

```bash
# Install testing dependencies (if not already installed)
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### Running Tests

```bash
# Run all tests
node src/__tests__/runTests.js

# Run specific test suites
node src/__tests__/runTests.js unit integration

# Run with coverage
node src/__tests__/runTests.js --coverage

# Run in watch mode (for development)
node src/__tests__/runTests.js --watch unit

# Run with verbose output
node src/__tests__/runTests.js --verbose

# Stop on first failure
node src/__tests__/runTests.js --bail
```

### Using npm scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "node src/__tests__/runTests.js",
    "test:unit": "node src/__tests__/runTests.js unit",
    "test:integration": "node src/__tests__/runTests.js integration",
    "test:e2e": "node src/__tests__/runTests.js e2e",
    "test:performance": "node src/__tests__/runTests.js performance",
    "test:accessibility": "node src/__tests__/runTests.js accessibility",
    "test:watch": "node src/__tests__/runTests.js --watch unit",
    "test:coverage": "node src/__tests__/runTests.js --coverage"
  }
}
```

## 📋 Test Suites

### 1. Unit Tests

**Purpose**: Test individual components, services, and utilities in isolation.

**Coverage**:

- ✅ WardrobeService (CRUD operations, caching, error handling)
- ✅ AIService (image analysis, outfit suggestions, error handling)
- ✅ ErrorHandler (error management, recovery, statistics)
- ✅ WardrobeCard component (rendering, interactions, accessibility)
- ✅ ErrorBoundary component (error catching, recovery, UI)
- ✅ Error recovery hooks (retry logic, circuit breaker, batch operations)

**Run**: `npm run test:unit`

### 2. Integration Tests

**Purpose**: Test how different parts of the application work together.

**Coverage**:

- ✅ Error handling system integration
- ✅ Component and service interactions
- ✅ Context providers and state management
- ✅ Error propagation and recovery

**Run**: `npm run test:integration`

### 3. End-to-End Tests

**Purpose**: Test complete user workflows from start to finish.

**Coverage**:

- ✅ Wardrobe viewing and navigation
- ✅ Adding new items (photo capture, AI analysis, form submission)
- ✅ Item details and editing
- ✅ Search and filtering
- ✅ Favorite management
- ✅ Error handling and recovery
- ✅ Offline scenarios

**Run**: `npm run test:e2e`

### 4. Performance Tests

**Purpose**: Ensure the application performs well under various conditions.

**Coverage**:

- ✅ Large dataset handling (1000+ items)
- ✅ Caching performance and memory usage
- ✅ Concurrent operations
- ✅ Search and filtering performance
- ✅ Bulk operations

**Run**: `npm run test:performance`

### 5. Accessibility Tests

**Purpose**: Ensure the application is accessible to users with disabilities.

**Coverage**:

- ✅ Screen reader support
- ✅ Voice control compatibility
- ✅ Keyboard navigation
- ✅ Color contrast and visual accessibility
- ✅ Focus management
- ✅ Reduced motion support
- ✅ WCAG 2.1 compliance

**Run**: `npm run test:accessibility`

## 🛠 Test Utilities

### `testUtils.tsx`

Provides comprehensive utilities for testing:

```typescript
import { renderWithProviders, createMockWardrobeItem } from '@/__tests__/utils/testUtils';

// Render component with all necessary providers
const { getByText } = renderWithProviders(<YourComponent />);

// Create mock data
const mockItem = createMockWardrobeItem({
  name: 'Test Item',
  category: WardrobeCategory.TOPS
});
```

### Mock Implementations

All external dependencies are mocked in `mocks/index.ts`:

- 🔄 Supabase client
- 🔥 Firebase services
- 🤖 AI services (OpenAI, Google Vision)
- 📱 React Native modules
- 📷 Image picker
- 📍 Location services
- 💾 AsyncStorage

## 📊 Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Format**: `coverage/lcov.info`
- **Text Summary**: Displayed in terminal

### Coverage Targets

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## 🔧 Configuration

### Jest Configuration

The main Jest configuration is in `jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  // ... other configurations
};
```

### Test Setup

Global test setup in `setup.ts` includes:

- 🔇 Console suppression for cleaner output
- ⏰ Fake timers for consistent timing
- 🧹 Automatic cleanup after each test
- 📱 React Native module mocking
- 🎯 Custom Jest matchers

## 🎯 Best Practices

### Writing Tests

1. **Arrange, Act, Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Mock External Dependencies**: Keep tests isolated
5. **Test Behavior, Not Implementation**: Focus on what, not how

### Example Test Structure

```typescript
describe('WardrobeCard', () => {
  describe('rendering', () => {
    it('should display item name and category', () => {
      // Arrange
      const mockItem = createMockWardrobeItem({
        name: 'Blue Dress',
        category: WardrobeCategory.DRESSES
      });

      // Act
      const { getByText } = render(
        <WardrobeCard item={mockItem} onPress={jest.fn()} />
      );

      // Assert
      expect(getByText('Blue Dress')).toBeTruthy();
      expect(getByText('Dresses')).toBeTruthy();
    });
  });
});
```

### Accessibility Testing

```typescript
it('should have proper accessibility labels', () => {
  const { getByTestId } = render(<Component />);
  const element = getByTestId('test-element');

  expect(element.props.accessibilityRole).toBe('button');
  expect(element.props.accessibilityLabel).toBe('Expected label');
  expect(element.props.accessibilityHint).toBe('Expected hint');
});
```

### Performance Testing

```typescript
it('should handle large datasets efficiently', async () => {
  const startTime = performance.now();

  // Perform operation
  await service.processLargeDataset(largeDataset);

  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(1000); // Should complete in <1s
});
```

## 🐛 Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for async operations
2. **Timer Issues**: Use `jest.useFakeTimers()` and `jest.advanceTimersByTime()`
3. **Mock Issues**: Ensure mocks are properly reset between tests
4. **Memory Leaks**: Check for proper cleanup in `afterEach`

### Debugging Tips

```typescript
// Debug component output
const { debug } = render(<Component />);
debug(); // Prints component tree

// Debug specific elements
const element = getByTestId('test-id');
// Debug: element.props

// Debug async operations
await waitFor(() => {
  // Debug: Waiting for condition...
  expect(condition).toBeTruthy();
});
```

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v1
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test"
    }
  }
}
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

## 🤝 Contributing

When adding new features:

1. **Write Tests First**: Follow TDD when possible
2. **Update Existing Tests**: Ensure existing tests still pass
3. **Add New Test Cases**: Cover new functionality
4. **Update Documentation**: Keep this README current
5. **Check Coverage**: Maintain coverage targets

### Test Checklist

- [ ] Unit tests for new components/services
- [ ] Integration tests for new workflows
- [ ] Accessibility tests for new UI elements
- [ ] Performance tests for data-heavy operations
- [ ] E2E tests for new user journeys
- [ ] Error handling tests
- [ ] Edge case coverage
- [ ] Documentation updates

---

**Happy Testing! 🧪✨**

For questions or issues with the testing setup, please refer to the project documentation or create an issue in the repository.
