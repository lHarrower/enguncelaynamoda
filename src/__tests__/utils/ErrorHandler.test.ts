// Unit tests for ErrorHandler
import {
  ErrorHandler,
  AppError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
} from '../../utils/ErrorHandler';
import { createMockError } from '../utils/testUtils';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);
jest.mock('../../services/ErrorReporting', () => ({
  ErrorReportingService: {
    getInstance: jest.fn(() => ({
      reportError: jest.fn(),
      addBreadcrumb: jest.fn(),
      setUserContext: jest.fn(),
    })),
  },
}));
jest.mock('c:/AYNAMODA/src/config/supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: jest.fn().mockResolvedValue({ data: [], error: null }),
      delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe('Hata İşleyici', () => {
  let errorHandler: ErrorHandler;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  describe('getInstance', () => {
    it('singleton örneği döndürmeli', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('createError', () => {
    it('gerekli tüm alanlarla hata oluşturmalı', () => {
      const error = errorHandler.createError(
        'TEST_ERROR',
        'Test error message',
        ErrorSeverity.MEDIUM,
        ErrorCategory.NETWORK,
        { userId: '123' },
      );

      expect(error).toMatchObject({
        code: 'TEST_ERROR',
        message: 'Test error message',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        context: { userId: '123' },
        timestamp: expect.any(Number),
        userMessage: expect.any(String),
        recoveryStrategies: expect.any(Array),
      });
    });

    it('uygun kullanıcı mesajları oluşturmalı', () => {
      const networkError = errorHandler.createError(
        'NETWORK_ERROR',
        'Failed to connect',
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK,
      );

      const authError = errorHandler.createError(
        'AUTH_ERROR',
        'Invalid credentials',
        ErrorSeverity.HIGH,
        ErrorCategory.AUTHENTICATION,
      );

      expect(networkError.userMessage).toContain('connection');
      expect(authError.userMessage).toContain('sign in');
    });

    it('kategoriye göre kurtarma stratejileri atamalı', () => {
      const networkError = errorHandler.createError(
        'NETWORK_ERROR',
        'Connection failed',
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK,
      );

      const uiError = errorHandler.createError(
        'UI_ERROR',
        'Component crashed',
        ErrorSeverity.MEDIUM,
        ErrorCategory.UI,
      );

      expect(networkError.recoveryStrategies).toContain(RecoveryStrategy.RETRY);
      expect(uiError.recoveryStrategies).toContain(RecoveryStrategy.REFRESH_COMPONENT);
    });
  });

  describe('handleError', () => {
    it('kritik hataları uygun şekilde işlemeli', async () => {
      const criticalError = createMockError({
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.SYSTEM,
      });

      await errorHandler.handleError(criticalError);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[CRITICAL ERROR]',
        expect.objectContaining({
          code: criticalError.code,
          message: criticalError.message,
        }),
      );
    });

    it('orta önem dereceli hataları uyarılarla işlemeli', async () => {
      const mediumError = createMockError({
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UI,
      });

      await errorHandler.handleError(mediumError);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[MEDIUM ERROR]',
        expect.objectContaining({
          code: mediumError.code,
          message: mediumError.message,
        }),
      );
    });

    it('toplu raporlama için hataları kuyruğa almalı', async () => {
      const errors = [
        createMockError({ code: 'ERROR_1' }),
        createMockError({ code: 'ERROR_2' }),
        createMockError({ code: 'ERROR_3' }),
      ];

      for (const error of errors) {
        await errorHandler.handleError(error);
      }

      // Verify errors are queued
      const queuedErrors = errorHandler.getErrorQueue();
      expect(queuedErrors).toHaveLength(3);
    });

    it('hata kısıtlamasına uymalı', async () => {
      const duplicateError = createMockError({ code: 'DUPLICATE_ERROR' });

      // Handle the same error multiple times quickly
      await errorHandler.handleError(duplicateError);
      await errorHandler.handleError(duplicateError);
      await errorHandler.handleError(duplicateError);

      // Only first occurrence should be logged
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
    });

    it("hataları AsyncStorage'da saklamalı", async () => {
      const error = createMockError();

      await errorHandler.handleError(error);

      expect(mocks.asyncStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringContaining(String(error.code)),
      );
    });
  });

  describe('yeniden deneme mekanizması', () => {
    it('üstel geri çekilme ile işlemleri yeniden denemeli', async () => {
      let attemptCount = 0;
      const failingOperation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Operation failed');
        }
        return 'success';
      });

      const result = await errorHandler.retryOperation(failingOperation, {
        maxAttempts: 3,
        baseDelay: 100,
      });

      expect(result).toBe('success');
      expect(failingOperation).toHaveBeenCalledTimes(3);
    });

    it('maksimum denemeden sonra vazgeçmeli', async () => {
      const alwaysFailingOperation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        errorHandler.retryOperation(alwaysFailingOperation, { maxAttempts: 2 }),
      ).rejects.toThrow('Always fails');

      expect(alwaysFailingOperation).toHaveBeenCalledTimes(2);
    });

    it('sürü etkisini önlemek için jitter uygulamalı', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      await errorHandler.retryOperation(operation, {
        maxAttempts: 3,
        baseDelay: 100,
        jitter: true,
      });
      const endTime = Date.now();

      // Should take at least base delay time (with some tolerance)
      expect(endTime - startTime).toBeGreaterThan(150);
    });
  });

  describe('kurtarma eylemleri', () => {
    it('bileşen yenileme kurtarmasını yürütmeli', async () => {
      const mockComponent = {
        forceUpdate: jest.fn(),
        setState: jest.fn(),
      };

      await errorHandler.executeRecoveryAction(RecoveryStrategy.REFRESH_COMPONENT, {
        component: mockComponent,
      });

      expect(mockComponent.forceUpdate).toHaveBeenCalled();
    });

    it('önbellek temizleme kurtarmasını yürütmeli', async () => {
      await errorHandler.executeRecoveryAction(RecoveryStrategy.CLEAR_CACHE, {
        cacheKeys: ['wardrobe_cache', 'user_cache'],
      });

      expect(mocks.asyncStorage.removeItem).toHaveBeenCalledWith('wardrobe_cache');
      expect(mocks.asyncStorage.removeItem).toHaveBeenCalledWith('user_cache');
    });

    it('çıkış kurtarmasını yürütmeli', async () => {
      const mockAuthService = {
        logout: jest.fn().mockResolvedValue(undefined),
      };

      await errorHandler.executeRecoveryAction(RecoveryStrategy.LOGOUT, {
        authService: mockAuthService,
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('bilinmeyen kurtarma stratejilerini zarif bir şekilde işlemeli', async () => {
      await expect(
        errorHandler.executeRecoveryAction('UNKNOWN_STRATEGY' as RecoveryStrategy, {}),
      ).resolves.not.toThrow();
    });
  });

  describe('hata kategorilendirme', () => {
    it('ağ hatalarını doğru kategorilendirmeli', () => {
      const networkErrors = [
        new Error('Network request failed'),
        new Error('Connection timeout'),
        new Error('DNS resolution failed'),
        new Error('ERR_NETWORK'),
      ];

      networkErrors.forEach((error) => {
        const appError = errorHandler.categorizeError(error);
        expect(appError.category).toBe(ErrorCategory.NETWORK);
      });
    });

    it('kimlik doğrulama hatalarını doğru kategorilendirmeli', () => {
      const authErrors = [
        new Error('Invalid credentials'),
        new Error('Token expired'),
        new Error('Unauthorized access'),
        new Error('Authentication failed'),
      ];

      authErrors.forEach((error) => {
        const appError = errorHandler.categorizeError(error);
        expect(appError.category).toBe(ErrorCategory.AUTHENTICATION);
      });
    });

    it('doğrulama hatalarını doğru kategorilendirmeli', () => {
      const validationErrors = [
        new Error('Required field missing'),
        new Error('Invalid email format'),
        new Error('Password too short'),
        new Error('Validation failed'),
      ];

      validationErrors.forEach((error) => {
        const appError = errorHandler.categorizeError(error);
        expect(appError.category).toBe(ErrorCategory.VALIDATION);
      });
    });

    it('uygun önem derecesi seviyeleri atamalı', () => {
      const criticalError = new Error('Database connection lost');
      const mediumError = new Error('Image upload failed');
      const lowError = new Error('Cache miss');

      expect(errorHandler.categorizeError(criticalError).severity).toBe(ErrorSeverity.CRITICAL);
      expect(errorHandler.categorizeError(mediumError).severity).toBe(ErrorSeverity.MEDIUM);
      expect(errorHandler.categorizeError(lowError).severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('hata filtreleme ve temizleme', () => {
    it('hata bağlamından hassas bilgileri filtrelemeli', () => {
      const sensitiveContext = {
        password: 'secret123',
        token: 'bearer-token',
        apiKey: 'api-key-123',
        email: 'user@aynamoda.app',
        userId: '12345',
      };

      const error = errorHandler.createError(
        'TEST_ERROR',
        'Test message',
        ErrorSeverity.MEDIUM,
        ErrorCategory.AUTHENTICATION,
        sensitiveContext,
      );

      expect(error.context.password).toBe('[REDACTED]');
      expect(error.context.token).toBe('[REDACTED]');
      expect(error.context.apiKey).toBe('[REDACTED]');
      expect(error.context.email).toBe('user@aynamoda.app'); // Email should be preserved
      expect(error.context.userId).toBe('12345'); // User ID should be preserved
    });

    it('hata mesajlarını temizlemeli', () => {
      const sensitiveMessage = 'Authentication failed for user secret123 with token bearer-xyz';

      const error = errorHandler.createError(
        'AUTH_ERROR',
        sensitiveMessage,
        ErrorSeverity.HIGH,
        ErrorCategory.AUTHENTICATION,
      );

      expect(error.message).not.toContain('secret123');
      expect(error.message).not.toContain('bearer-xyz');
    });
  });

  describe('hata istatistikleri ve izleme', () => {
    it('hata sıklığını takip etmeli', async () => {
      const errors = [
        createMockError({ code: 'NETWORK_ERROR' }),
        createMockError({ code: 'NETWORK_ERROR' }),
        createMockError({ code: 'AUTH_ERROR' }),
      ];

      for (const error of errors) {
        await errorHandler.handleError(error);
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.errorCounts.NETWORK_ERROR).toBe(2);
      expect(stats.errorCounts.AUTH_ERROR).toBe(1);
    });

    it('zaman içindeki hata eğilimlerini takip etmeli', async () => {
      const error = createMockError();

      await errorHandler.handleError(error);

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(1);
      expect(stats.recentErrors).toContain(error.code);
    });

    it('hata kalıplarını tanımlamalı', async () => {
      // Simulate rapid succession of same error
      const rapidErrors = Array(5)
        .fill(null)
        .map(() => createMockError({ code: 'RAPID_ERROR' }));

      for (const error of rapidErrors) {
        await errorHandler.handleError(error);
      }

      const patterns = errorHandler.detectErrorPatterns();
      expect(patterns.rapidSuccession).toContain('RAPID_ERROR');
    });
  });

  describe('yapılandırma ve özelleştirme', () => {
    it('özel hata işleyicilerine izin vermeli', () => {
      const customHandler = jest.fn();

      errorHandler.setCustomHandler(ErrorCategory.AI_SERVICE, customHandler);

      const aiError = createMockError({ category: ErrorCategory.AI_SERVICE });
      errorHandler.handleError(aiError);

      expect(customHandler).toHaveBeenCalledWith(aiError);
    });

    it('yapılandırma güncellemelerine izin vermeli', () => {
      const newConfig = {
        enableReporting: false,
        maxQueueSize: 200,
        throttleWindow: 10000,
      };

      errorHandler.updateConfig(newConfig);

      const config = errorHandler.getConfig();
      expect(config.enableReporting).toBe(false);
      expect(config.maxQueueSize).toBe(200);
      expect(config.throttleWindow).toBe(10000);
    });

    it('özel kurtarma stratejilerini desteklemeli', async () => {
      const customRecovery = jest.fn().mockResolvedValue(undefined);

      errorHandler.registerRecoveryStrategy('CUSTOM_RECOVERY', customRecovery);

      await errorHandler.executeRecoveryAction('CUSTOM_RECOVERY' as RecoveryStrategy, {});

      expect(customRecovery).toHaveBeenCalled();
    });
  });

  describe('sağlık ve erişilebilirlik', () => {
    it('sağlık modu için sakinleştirici hata mesajları sağlamalı', () => {
      errorHandler.updateConfig({ wellnessMode: true });

      const error = errorHandler.createError(
        'NETWORK_ERROR',
        'Connection failed',
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK,
      );

      expect(error.userMessage).toMatch(/gentle|moment|breathe|okay/);
    });

    it('erişilebilirlik dostu hata raporlamasını desteklemeli', () => {
      errorHandler.updateConfig({ accessibilityMode: true });

      const error = createMockError();

      expect(error.userMessage).toBeDefined();
      expect(error.userMessage.length).toBeGreaterThan(10); // Descriptive message
    });

    it('ekran okuyucular için hata bağlamı sağlamalı', () => {
      const error = errorHandler.createError(
        'FORM_ERROR',
        'Validation failed',
        ErrorSeverity.MEDIUM,
        ErrorCategory.VALIDATION,
        { fieldName: 'email' },
      );

      expect(error.accessibilityLabel).toContain('email');
      expect(error.accessibilityHint).toBeDefined();
    });
  });
});
