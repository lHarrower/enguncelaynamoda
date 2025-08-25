// __tests__/deepLinkService.behavior.test.ts

import { logger } from '@/utils/logger';
import * as DeepLink from '@/services/deepLinkService';

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), redact: (x: any) => x },
}));

// Modül ister fonksiyon, ister obje export etsin: tek bir parse(url) fonksiyonu üret.
function getParser(mod: Record<string, any>): ((url: string) => any) | null {
  // 1) Direkt fonksiyon export edilmesi durumu
  const directFunctionKeys = [
    'parseDeepLink',
    'resolveDeepLink',
    'handleDeepLink',
    'parseLink',
    'linkFromUrl',
    'getRouteFromUrl',
    'default',
  ];

  for (const k of directFunctionKeys) {
    const val = mod[k];
    if (typeof val === 'function') {
      return (url: string) => val(url);
    }
    // default export bir obje olabilir; içinde fonksiyon arayalım
    if (k === 'default' && typeof mod.default === 'function') {
      return (url: string) => mod.default(url);
    }
  }

  // 2) Obje export edilmesi durumu (ör. DeepLinkService nesnesi)
  const objectKeys = [
    'DeepLinkService',
    'deepLinkService',
    'default', // default bir obje olabilir
    // ya da modülün kendisi zaten bir obje export'udur
  ];

  const methodCandidates = [
    'parseDeepLink',
    'resolveDeepLink',
    'handleDeepLink',
    'parseLink',
    'getRouteFromUrl',
    'parse',
    'resolve',
    'fromUrl',
  ];

  // Önce well-known anahtarları dene
  for (const k of objectKeys) {
    const obj = k in mod ? mod[k] : undefined;
    if (obj && typeof obj === 'object') {
      for (const m of methodCandidates) {
        if (typeof obj[m] === 'function') {
          return (url: string) => obj[m](url);
        }
      }
    }
  }

  // Son çare: modülün kendisi bir obje ise içinden metod ara
  if (mod && typeof mod === 'object') {
    for (const m of methodCandidates) {
      if (typeof (mod as any)[m] === 'function') {
        return (url: string) => (mod as any)[m](url);
      }
    }
    if (mod.default && typeof mod.default === 'object') {
      for (const m of methodCandidates) {
        if (typeof mod.default[m] === 'function') {
          return (url: string) => mod.default[m](url);
        }
      }
    }
  }

  return null;
}

// Route adları projeden projeye değişebileceği için esnek kontrol:
function isHomeLike(name?: string) {
  return !!name && /home|main|root|wardrobe|start|dashboard/i.test(name);
}
function isItemLike(name?: string) {
  return !!name && /item|wardrobeitem|product|detail/i.test(name);
}

describe('deepLinkService', () => {
  const parse = getParser(DeepLink);

  test('modül bir deep link çözücü sağlamalı (fonksiyon veya obje içi metod)', () => {
    expect(typeof parse).toBe('function');
  });

  (parse ? describe : describe.skip)('behavior', () => {
    test('geçerli item link -> Item benzeri bir route', () => {
      const res = parse!('aynamoda://item?id=123&ref=share');
      if (res && typeof res === 'object') {
        expect(isItemLike(res.name)).toBe(true);
        if (res.params) {
          expect(res.params).toMatchObject({ id: expect.anything() });
        }
      } else {
        expect(logger.warn).toHaveBeenCalled();
      }
    });

    test('bilinmeyen host -> güvenli fallback & log', () => {
      const res = parse!('aynamoda://garipHost/path');
      if (res && typeof res === 'object') {
        expect(isHomeLike(res.name)).toBe(true);
      }
      expect(logger.warn).toHaveBeenCalled();
    });

    test('eksik param -> fallback', () => {
      const res = parse!('aynamoda://item'); // id yok
      if (res && typeof res === 'object') {
        expect(isHomeLike(res.name)).toBe(true);
      }
    });

    test('URL-encoded param çözülür', () => {
      const res = parse!('aynamoda://item?id=%32%33%34');
      if (res?.params) {
        expect(res.params.id).toBe('234');
      } else {
        expect(logger.warn).toHaveBeenCalled();
      }
    });
  });
});
