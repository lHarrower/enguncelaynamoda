/**
 * Deep Link parsing & generation service
 * Public named export: parseDeepLink(url)
 * Default export: { parse, isValid, toURL, processDeepLinkParams }
 *
 * Rules:
 * - Scheme must be aynamoda:// (case-insensitive)
 * - Allowed hosts: item, home, settings, promo
 * - item requires id param
 * - Fallback: { name: 'Home' } on any invalid condition
 * - All params URL-decoded
 */
import { logger } from '../utils/logger';

export interface DeepLinkResult {
  name: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  /** Internal validity marker (not part of public API docs). */
  __valid?: true;
}

type AllowedHost = 'item' | 'home' | 'settings' | 'promo';

interface HostRouteConfig {
  routeName: string;
  requires?: Array<{ key: string }>;
}

const SCHEME = 'aynamoda://';

const HOST_ROUTE_MAP: Record<AllowedHost, HostRouteConfig> = {
  item: { routeName: 'Item', requires: [{ key: 'id' }] },
  home: { routeName: 'Home' },
  settings: { routeName: 'Settings' },
  promo: { routeName: 'Promo' },
};

// Fallback singleton (no __valid flag) distinguished from successful parses.
const FALLBACK: DeepLinkResult = { name: 'Home' };

/**
 * Parse query string into a param record with URL decoding.
 */
function parseQueryParams(query: string): Record<string, string> {
  if (!query) {
    return {};
  }
  return query
    .replace(/^\?/, '')
    .split('&')
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const [rawK, rawV = ''] = pair.split('=');
      try {
        if (rawK === undefined) {
          return acc;
        } // safety guard
        const k = decodeURIComponent(rawK);
        const v = decodeURIComponent(rawV);
        acc[k] = v;
      } catch {
        // Skip malformed components silently
      }
      return acc;
    }, {});
}

/**
 * Internal core parser (no logging).
 */
function coreParse(url: string): DeepLinkResult {
  if (typeof url !== 'string' || !url) {
    return FALLBACK;
  }

  const lower = url.toLowerCase();
  if (!lower.startsWith(SCHEME)) {
    return FALLBACK;
  }

  const withoutScheme = url.slice(SCHEME.length);

  const firstSepIdx = withoutScheme.search(/[/?]/);
  const hostRaw = firstSepIdx === -1 ? withoutScheme : withoutScheme.slice(0, firstSepIdx);
  const host = hostRaw.toLowerCase() as AllowedHost;

  if (!Object.prototype.hasOwnProperty.call(HOST_ROUTE_MAP, host)) {
    return FALLBACK;
  }

  let query = '';
  const qIndex = withoutScheme.indexOf('?');
  if (qIndex >= 0) {
    query = withoutScheme.slice(qIndex);
  }

  const params = parseQueryParams(query);
  const cfg = HOST_ROUTE_MAP[host];

  if (cfg.requires) {
    for (const req of cfg.requires) {
      if (!params[req.key]) {
        return FALLBACK;
      }
    }
  }

  const base: DeepLinkResult = Object.keys(params).length
    ? { name: cfg.routeName, params }
    : { name: cfg.routeName };
  base.__valid = true; // explicit marker for validity checks
  return base;
}

/**
 * Public API: Parse a deep link URL string into a route + params.
 * Fallbacks to { name: 'Home' } when invalid.
 */
export function parseDeepLink(url: string): DeepLinkResult {
  const result = coreParse(url);
  if (result === FALLBACK) {
    logger?.warn?.('deep_link_invalid', {
      url,
      reason: 'invalid_scheme_host_or_params',
    });
  } else {
    logger?.info?.('deep_link_parsed', {
      url,
      name: result.name,
      hasParams: Boolean(result.params && Object.keys(result.params).length),
    });
  }
  return result;
}

/**
 * Validate a deep link without returning parsed params.
 * Valid only if parsing did not yield the shared FALLBACK reference.
 */
function isValid(url: string): boolean {
  const parsed = coreParse(url);
  return parsed.__valid === true; // explicit flag instead of reference identity
}

/**
 * Generate a deep link URL for a given route name and optional params.
 * Unknown names fallback to home.
 */
function toURL(
  name: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  const entry = (Object.entries(HOST_ROUTE_MAP) as Array<[AllowedHost, HostRouteConfig]>).find(
    ([, cfg]) => cfg.routeName === name,
  );
  const host: AllowedHost = entry ? entry[0] : 'home';

  let query = '';
  if (params && Object.keys(params).length) {
    const qp = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v === null ? '' : String(v))}`,
      )
      .join('&');
    if (qp) {
      query = `?${qp}`;
    }
  }
  return `${SCHEME}${host}${query}`;
}

/* -------------------------------------------------------------------------- */
/* Backward-compatible deep link params adapter                               */
/* -------------------------------------------------------------------------- */

export type DeepLinkInput = {
  feedback?: string;
  outfit?: string;
  item?: string;
  [key: string]: unknown;
};

export type DeepLinkNormalized = {
  feedback?: string;
  outfitId?: string;
  itemId?: string;
  extras?: Record<string, unknown>;
};

/**
 * Normalize legacy / raw deep link param objects to consistent shape.
 * - Trims & URL-decodes string fields
 * - Renames outfit -> outfitId, item -> itemId
 * - Collects unknown keys into extras
 * - Returns {} if nothing useful
 */
export function processDeepLinkParams(input?: DeepLinkInput | null): DeepLinkNormalized {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const out: DeepLinkNormalized = {};
  const extras: Record<string, unknown> = {};

  const decodeValue = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return '';
    }
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  };

  if (typeof input.feedback === 'string') {
    const v = decodeValue(input.feedback);
    if (v) {
      out.feedback = v;
    }
  }
  if (typeof input.outfit === 'string') {
    const v = decodeValue(input.outfit);
    if (v) {
      out.outfitId = v;
    }
  }
  if (typeof input.item === 'string') {
    const v = decodeValue(input.item);
    if (v) {
      out.itemId = v;
    }
  }

  for (const [k, v] of Object.entries(input)) {
    if (k === 'feedback' || k === 'outfit' || k === 'item') {
      continue;
    }
    if (v !== undefined) {
      extras[k] = v;
    }
  }

  if (Object.keys(extras).length) {
    out.extras = extras;
  }

  const hasUseful =
    !!out.feedback ||
    !!out.outfitId ||
    !!out.itemId ||
    (out.extras ? Object.keys(out.extras).length > 0 : false);

  logger?.info?.('deep_link_params_processed', {
    hasFeedback: !!out.feedback,
    hasOutfitId: !!out.outfitId,
    hasItemId: !!out.itemId,
  });

  return hasUseful ? out : {};
}

// Default export (stable public API)
const deepLinkAPI = {
  parse: parseDeepLink,
  isValid,
  toURL,
  processDeepLinkParams,
};

export default deepLinkAPI;
