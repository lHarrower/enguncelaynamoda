import { parseDeepLink } from '@/services/deepLinkService';

test('deeplink hard limits', () => {
  const big = 'a'.repeat(3000);
  const qp = Array.from({ length: 55 }, (_, i) => `k${i}=${big}`).join('&');
  const url = `aynamoda://item?${qp}`;
  const r = parseDeepLink(url);
  expect(r.name).toBe('Home');
});
