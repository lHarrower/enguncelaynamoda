import { callWrapped } from '@/utils/supabaseQueryHelpers';
import { logger } from '@/lib/logger';

jest.mock('@/lib/logger');

test('retry once on 40001', async () => {
  // İlk çağrı hata, ikinci çağrı başarı simülasyonu
  const mockOperation = jest
    .fn()
    .mockRejectedValueOnce({ code: '40001' })
    .mockResolvedValueOnce('success');

  await callWrapped(mockOperation);
  expect(mockOperation).toHaveBeenCalledTimes(2);
});
