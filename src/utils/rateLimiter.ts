// Simple in-memory token bucket rate limiter (per key) for edge/local usage
// NOTE: For multi-instance production deploys, replace with Redis / Deno KV.

interface Bucket {
  tokens: number;
  updated: number; // ms timestamp
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function rateLimit(key: string, capacity = 20, refillPerSec = 5): RateLimitResult {
  const now = Date.now();
  const refillRate = refillPerSec; // tokens per second
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, updated: now };
    buckets.set(key, bucket);
  }
  // Refill
  const elapsed = (now - bucket.updated) / 1000;
  const refill = elapsed * refillRate;
  if (refill > 0) {
    bucket.tokens = Math.min(capacity, bucket.tokens + refill);
    bucket.updated = now;
  }
  if (bucket.tokens < 1) {
    const resetIn = ((1 - bucket.tokens) / refillRate) * 1000;
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, Math.round(resetIn)) };
  }
  bucket.tokens -= 1;
  return { allowed: true, remaining: Math.floor(bucket.tokens), resetInMs: 0 };
}

export function clearRateLimiter() {
  buckets.clear();
}

export default rateLimit;
