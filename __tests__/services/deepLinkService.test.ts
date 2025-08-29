import deepLinkAPI, {
  parseDeepLink,
  processDeepLinkParams,
  DeepLinkResult,
  DeepLinkInput,
  DeepLinkNormalized,
} from '@/services/deepLinkService';
import { logger } from '@/utils/logger';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('DeepLinkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseDeepLink', () => {
    it('should parse valid item deep link with id', () => {
      const url = 'aynamoda://item?id=123';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        name: 'Item',
        params: { id: '123' },
        __valid: true,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('deep_link_parsed', {
        url,
        name: 'Item',
        hasParams: true,
      });
    });

    it('should parse valid home deep link', () => {
      const url = 'aynamoda://home';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        name: 'Home',
        __valid: true,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('deep_link_parsed', {
        url,
        name: 'Home',
        hasParams: false,
      });
    });

    it('should parse valid settings deep link', () => {
      const url = 'aynamoda://settings';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        name: 'Settings',
        __valid: true,
      });
    });

    it('should parse valid promo deep link', () => {
      const url = 'aynamoda://promo';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        name: 'Promo',
        __valid: true,
      });
    });

    it('should handle case-insensitive scheme', () => {
      const url = 'AYNAMODA://home';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        name: 'Home',
        __valid: true,
      });
    });

    it('should handle URL decoding in params', () => {
      const url = 'aynamoda://item?id=test%20item&category=shirt%26pants';
      const result = parseDeepLink(url);

      expect(result).toEqual({
        name: 'Item',
        params: {
          id: 'test item',
          category: 'shirt&pants',
        },
        __valid: true,
      });
    });

    it('should fallback to Home for invalid scheme', () => {
      const url = 'invalid://item?id=123';
      const result = parseDeepLink(url);

      expect(result).toEqual({ name: 'Home' });
      expect(mockLogger.warn).toHaveBeenCalledWith('deep_link_invalid', {
        url,
        reason: 'invalid_scheme_host_or_params',
      });
    });

    it('should fallback to Home for invalid host', () => {
      const url = 'aynamoda://invalid';
      const result = parseDeepLink(url);

      expect(result).toEqual({ name: 'Home' });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fallback to Home for item without required id param', () => {
      const url = 'aynamoda://item';
      const result = parseDeepLink(url);

      expect(result).toEqual({ name: 'Home' });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fallback to Home for empty or null URL', () => {
      expect(parseDeepLink('')).toEqual({ name: 'Home' });
      expect(parseDeepLink(null as any)).toEqual({ name: 'Home' });
      expect(parseDeepLink(undefined as any)).toEqual({ name: 'Home' });
    });

    it('should handle malformed query params gracefully', () => {
      const url = 'aynamoda://item?id=123&malformed=%ZZ';
      const result = parseDeepLink(url);

      expect(result.name).toBe('Item');
      expect(result.params?.id).toBe('123');
    });
  });

  describe('isValid', () => {
    it('should return true for valid deep links', () => {
      expect(deepLinkAPI.isValid('aynamoda://home')).toBe(true);
      expect(deepLinkAPI.isValid('aynamoda://item?id=123')).toBe(true);
      expect(deepLinkAPI.isValid('aynamoda://settings')).toBe(true);
      expect(deepLinkAPI.isValid('aynamoda://promo')).toBe(true);
    });

    it('should return false for invalid deep links', () => {
      expect(deepLinkAPI.isValid('invalid://home')).toBe(false);
      expect(deepLinkAPI.isValid('aynamoda://invalid')).toBe(false);
      expect(deepLinkAPI.isValid('aynamoda://item')).toBe(false); // missing required id
      expect(deepLinkAPI.isValid('')).toBe(false);
    });
  });

  describe('toURL', () => {
    it('should generate URL for Home route', () => {
      const url = deepLinkAPI.toURL('Home');
      expect(url).toBe('aynamoda://home');
    });

    it('should generate URL for Item route with params', () => {
      const url = deepLinkAPI.toURL('Item', { id: '123', category: 'shirt' });
      expect(url).toBe('aynamoda://item?id=123&category=shirt');
    });

    it('should generate URL for Settings route', () => {
      const url = deepLinkAPI.toURL('Settings');
      expect(url).toBe('aynamoda://settings');
    });

    it('should generate URL for Promo route', () => {
      const url = deepLinkAPI.toURL('Promo');
      expect(url).toBe('aynamoda://promo');
    });

    it('should handle URL encoding in params', () => {
      const url = deepLinkAPI.toURL('Item', { id: 'test item', category: 'shirt&pants' });
      expect(url).toBe('aynamoda://item?id=test%20item&category=shirt%26pants');
    });

    it('should filter out undefined params', () => {
      const url = deepLinkAPI.toURL('Item', { id: '123', category: undefined, brand: 'nike' });
      expect(url).toBe('aynamoda://item?id=123&brand=nike');
    });

    it('should handle null params as empty strings', () => {
      const url = deepLinkAPI.toURL('Item', { id: '123', category: null });
      expect(url).toBe('aynamoda://item?id=123&category=');
    });

    it('should fallback to home for unknown route names', () => {
      const url = deepLinkAPI.toURL('UnknownRoute');
      expect(url).toBe('aynamoda://home');
    });

    it('should handle boolean and number params', () => {
      const url = deepLinkAPI.toURL('Item', { id: '123', featured: true, price: 99.99 });
      expect(url).toBe('aynamoda://item?id=123&featured=true&price=99.99');
    });
  });

  describe('processDeepLinkParams', () => {
    it('should process valid input with all fields', () => {
      const input: DeepLinkInput = {
        feedback: 'great item',
        outfit: 'outfit123',
        item: 'item456',
        extra: 'value',
      };

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        feedback: 'great item',
        outfitId: 'outfit123',
        itemId: 'item456',
        extras: { extra: 'value' },
      });

      expect(mockLogger.info).toHaveBeenCalledWith('deep_link_params_processed', {
        hasFeedback: true,
        hasOutfitId: true,
        hasItemId: true,
      });
    });

    it('should handle URL-encoded values', () => {
      const input: DeepLinkInput = {
        feedback: 'great%20item',
        outfit: 'outfit%26test',
        item: 'item%20456',
      };

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        feedback: 'great item',
        outfitId: 'outfit&test',
        itemId: 'item 456',
      });
    });

    it('should trim whitespace from values', () => {
      const input: DeepLinkInput = {
        feedback: '  great item  ',
        outfit: '\toutfit123\n',
        item: ' item456 ',
      };

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        feedback: 'great item',
        outfitId: 'outfit123',
        itemId: 'item456',
      });
    });

    it('should handle malformed URL encoding gracefully', () => {
      const input: DeepLinkInput = {
        feedback: 'great%ZZitem', // invalid encoding
        outfit: 'outfit123',
      };

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        feedback: 'great%ZZitem', // falls back to original
        outfitId: 'outfit123',
      });
    });

    it('should filter out empty strings after trimming', () => {
      const input: DeepLinkInput = {
        feedback: '   ',
        outfit: 'outfit123',
        item: '',
      };

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        outfitId: 'outfit123',
      });
    });

    it('should return empty object for null or undefined input', () => {
      expect(processDeepLinkParams(null)).toEqual({});
      expect(processDeepLinkParams(undefined)).toEqual({});
      expect(processDeepLinkParams({} as any)).toEqual({});
    });

    it('should return empty object when no useful data', () => {
      const input: DeepLinkInput = {
        feedback: '',
        outfit: '   ',
        item: '',
      };

      const result = processDeepLinkParams(input);
      expect(result).toEqual({});
    });

    it('should handle non-string values for known fields', () => {
      const input = {
        feedback: 123, // not a string
        outfit: 'outfit123',
        item: null,
      } as any;

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        outfitId: 'outfit123',
      });
    });

    it('should collect unknown fields into extras', () => {
      const input: DeepLinkInput = {
        outfit: 'outfit123',
        customField: 'value',
        anotherField: 42,
        boolField: true,
      };

      const result = processDeepLinkParams(input);

      expect(result).toEqual({
        outfitId: 'outfit123',
        extras: {
          customField: 'value',
          anotherField: 42,
          boolField: true,
        },
      });
    });
  });
});
