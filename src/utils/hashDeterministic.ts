// Deterministic non-cryptographic hash for stable test selections and seeded logic
// NOTE: Not suitable for security purposes.
export function hashDeterministic(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    // eslint-disable-next-line no-bitwise
    h = (h * 131 + seed.charCodeAt(i)) >>> 0; // 131 chosen for good distribution & speed
  }
  // eslint-disable-next-line no-bitwise
  return h >>> 0;
}

export function pickDeterministic<T>(arr: T[], seed: string | string[]): T | undefined {
  if (!Array.isArray(arr) || arr.length === 0) {
    return undefined;
  }
  const s = Array.isArray(seed) ? seed.join('|') : seed;
  const idx = hashDeterministic(s) % arr.length;
  return arr[idx];
}
