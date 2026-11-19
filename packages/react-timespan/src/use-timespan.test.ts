import { renderHook } from '@testing-library/react';
import { useTimespan } from './use-timespan';

describe('useTimespan', () => {
  test('is empty', () => {
    const { result } = renderHook(() => useTimespan());

    expect(result.current).toBeUndefined();
  });
});
