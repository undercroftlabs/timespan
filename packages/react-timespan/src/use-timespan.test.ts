import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { Timespan } from '@undercroft/timespan';
import { useTimespan, type UseTimespanResult } from './index';

const start = new Date('2024-03-01T00:00:00.000Z');
const end = new Date('2024-03-15T00:00:00.000Z');
const invalidDateMessage = 'Invalid date: expected a valid Date.';
const reversedRangeMessage =
  'Invalid date range: expected the start date to be less than or equal to the end date.';

/**
 * Compare instants by time value. Timespan endpoint getters return copies.
 * @param timespan - Timespan whose endpoints are read.
 * @returns The start and end time values, in that order.
 */
function endpoints(timespan: Timespan): [number, number] {
  return [timespan.start.getTime(), timespan.end.getTime()];
}

/**
 * Render a hook and apply one update. Each call uses its own render so the
 * thrown update is the one under test.
 * @param update - Update to apply.
 * @param message - Error expected from {@link Timespan} when React processes the update.
 */
function expectRejection(
  update: (current: UseTimespanResult) => void,
  message: string,
): void {
  const { result } = renderHook(() => useTimespan(new Timespan(start, end)));

  expect(() => {
    act(() => {
      update(result.current);
    });
  }).toThrow(message);
}

describe('useTimespan', () => {
  test('stores the Timespan given at initialization', () => {
    const initial = new Timespan(start, end);
    const { result } = renderHook(() => useTimespan(initial));

    expect(result.current.timespan).toBe(initial);
    expect(endpoints(result.current.timespan)).toEqual(endpoints(initial));
  });

  test('initializes from a function during the first render', () => {
    const initial = new Timespan(start, end);
    const initializer = vi.fn(() => initial);
    const { result } = renderHook(() => useTimespan(initializer));

    expect(result.current.timespan).toBe(initial);
    expect(initializer).toHaveBeenCalledOnce();
  });

  test('does not call the initializer again on a later render', () => {
    const initializer = vi.fn(() => new Timespan(start, end));
    const { rerender } = renderHook(() => useTimespan(initializer));

    expect(initializer).toHaveBeenCalledOnce();

    rerender();

    expect(initializer).toHaveBeenCalledOnce();
  });

  test('setStart replaces the start and preserves the end', () => {
    const initial = new Timespan(start, end);
    const nextStart = new Date('2024-03-05T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setStart(nextStart);
    });

    expect(result.current.timespan).not.toBe(initial);
    expect(endpoints(result.current.timespan)).toEqual([
      nextStart.getTime(),
      end.getTime(),
    ]);
    expect(endpoints(initial)).toEqual([start.getTime(), end.getTime()]);
  });

  test('setEnd replaces the end and preserves the start', () => {
    const initial = new Timespan(start, end);
    const nextEnd = new Date('2024-03-20T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setEnd(nextEnd);
    });

    expect(result.current.timespan).not.toBe(initial);
    expect(endpoints(result.current.timespan)).toEqual([
      start.getTime(),
      nextEnd.getTime(),
    ]);
    expect(endpoints(initial)).toEqual([start.getTime(), end.getTime()]);
  });

  test('setTimespan stores the replacement instance', () => {
    const initial = new Timespan(start, end);
    const replacement = new Timespan(
      start,
      new Date('2024-04-01T00:00:00.000Z'),
    );
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setTimespan(replacement);
    });

    expect(result.current.timespan).toBe(replacement);
  });

  test('setTimespan applies a function to the latest timespan', () => {
    const initial = new Timespan(start, end);
    const nextEnd = new Date('2024-03-20T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setTimespan(
        (current) => new Timespan(current.start, nextEnd),
      );
    });

    expect(result.current.timespan).not.toBe(initial);
    expect(endpoints(result.current.timespan)).toEqual([
      start.getTime(),
      nextEnd.getTime(),
    ]);
  });

  test('composes updates queued before the next render', () => {
    const initial = new Timespan(start, end);
    const nextStart = new Date('2024-03-04T00:00:00.000Z');
    const nextEnd = new Date('2024-03-20T00:00:00.000Z');
    const finalEnd = new Date('2024-03-25T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setStart(nextStart);
      result.current.setEnd(nextEnd);
      result.current.setTimespan(
        (current) => new Timespan(current.start, finalEnd),
      );
    });

    expect(endpoints(result.current.timespan)).toEqual([
      nextStart.getTime(),
      finalEnd.getTime(),
    ]);
  });

  test('keeps the same setter functions across renders', () => {
    const { result, rerender } = renderHook(() =>
      useTimespan(new Timespan(start, end)),
    );
    const { setStart, setEnd, setTimespan } = result.current;

    rerender();

    expect(result.current.setStart).toBe(setStart);
    expect(result.current.setEnd).toBe(setEnd);
    expect(result.current.setTimespan).toBe(setTimespan);

    act(() => {
      result.current.setEnd(new Date('2024-03-20T00:00:00.000Z'));
    });

    expect(result.current.setStart).toBe(setStart);
    expect(result.current.setEnd).toBe(setEnd);
    expect(result.current.setTimespan).toBe(setTimespan);
  });

  test('reports an invalid date from Timespan when React processes the update', () => {
    expectRejection(
      (current) => current.setStart(new Date(Number.NaN)),
      invalidDateMessage,
    );
    expectRejection(
      (current) => current.setEnd(new Date('not a date')),
      invalidDateMessage,
    );
  });

  test('reports a reversed range from Timespan when React processes the update', () => {
    expectRejection(
      (current) => current.setStart(new Date('2024-04-01T00:00:00.000Z')),
      reversedRangeMessage,
    );
    expectRejection(
      (current) => current.setEnd(new Date('2024-02-01T00:00:00.000Z')),
      reversedRangeMessage,
    );
  });

  test('keeps the stored timespan when the initial argument changes', () => {
    const initial = new Timespan(start, end);
    const replacement = new Timespan(
      start,
      new Date('2024-04-01T00:00:00.000Z'),
    );
    const laterInitializer = vi.fn(() => replacement);
    const initialProps: { initial: Timespan | (() => Timespan) } = {
      initial,
    };
    const { result, rerender } = renderHook(
      ({ initial: next }) => useTimespan(next),
      { initialProps },
    );

    rerender({ initial: replacement });
    rerender({ initial: laterInitializer });

    expect(result.current.timespan).toBe(initial);
    expect(laterInitializer).not.toHaveBeenCalled();
  });

  test('stores a tryCreate success and skips the update when tryCreate fails', () => {
    const initial = new Timespan(start, end);
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useTimespan(initial);
    });
    const rendersAfterMount = renders;

    function updateInterval(nextStart: Date, nextEnd: Date) {
      const created = Timespan.tryCreate(nextStart, nextEnd);
      if (created.success) {
        result.current.setTimespan(created.value);
      }
      return created;
    }

    let rejected: ReturnType<typeof Timespan.tryCreate> | undefined;
    act(() => {
      rejected = updateInterval(
        new Date('2024-04-08T00:00:00.000Z'),
        new Date('2024-04-01T00:00:00.000Z'),
      );
    });

    expect(rejected?.success).toBe(false);
    if (rejected !== undefined && !rejected.success) {
      expect(rejected.error).toBeInstanceOf(Error);
      expect(rejected.error.message).toBe(reversedRangeMessage);
    }
    expect(result.current.timespan).toBe(initial);
    expect(renders).toBe(rendersAfterMount);

    const nextStart = new Date('2024-04-01T00:00:00.000Z');
    const nextEnd = new Date('2024-04-08T00:00:00.000Z');
    let created: ReturnType<typeof Timespan.tryCreate> | undefined;
    act(() => {
      created = updateInterval(nextStart, nextEnd);
    });

    expect(created?.success).toBe(true);
    if (created !== undefined && created.success) {
      expect(created.value).toBeInstanceOf(Timespan);
      expect(result.current.timespan).toBe(created.value);
      expect(endpoints(result.current.timespan)).toEqual([
        nextStart.getTime(),
        nextEnd.getTime(),
      ]);
    }
  });

  test('stores a zero-duration Timespan and can keep that duration', () => {
    const instant = new Date('2024-03-01T00:00:00.000Z');
    const zero = new Timespan(instant, new Date(instant.getTime()));
    const { result } = renderHook(() => useTimespan(zero));

    expect(result.current.timespan.toMilliseconds()).toBe(0);

    act(() => {
      result.current.setStart(new Date(instant.getTime()));
    });

    expect(result.current.timespan).not.toBe(zero);
    expect(result.current.timespan.toMilliseconds()).toBe(0);
    expect(endpoints(zero)).toEqual([instant.getTime(), instant.getTime()]);
  });

  test('applies queued updates to the same endpoint in order', () => {
    const initial = new Timespan(start, end);
    const firstStart = new Date('2024-03-02T00:00:00.000Z');
    const secondStart = new Date('2024-03-06T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setStart(firstStart);
      result.current.setStart(secondStart);
    });

    expect(endpoints(result.current.timespan)).toEqual([
      secondStart.getTime(),
      end.getTime(),
    ]);
  });

  test('applies a functional update to a replacement queued before it', () => {
    const initial = new Timespan(start, end);
    const replacement = new Timespan(
      new Date('2024-04-01T00:00:00.000Z'),
      new Date('2024-04-04T00:00:00.000Z'),
    );
    const nextEnd = new Date('2024-04-10T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setTimespan(replacement);
      result.current.setTimespan(
        (current) => new Timespan(current.start, nextEnd),
      );
    });

    expect(result.current.timespan).not.toBe(replacement);
    expect(endpoints(result.current.timespan)).toEqual([
      replacement.start.getTime(),
      nextEnd.getTime(),
    ]);
  });

  test('applies an endpoint update to a functional update queued before it', () => {
    const initial = new Timespan(start, end);
    const nextEnd = new Date('2024-03-20T00:00:00.000Z');
    const nextStart = new Date('2024-03-10T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setTimespan(
        (current) => new Timespan(current.start, nextEnd),
      );
      result.current.setStart(nextStart);
    });

    expect(endpoints(result.current.timespan)).toEqual([
      nextStart.getTime(),
      nextEnd.getTime(),
    ]);
  });

  test('replaces both endpoints in one update', () => {
    const initial = new Timespan(start, end);
    const nextStart = new Date('2024-04-01T00:00:00.000Z');
    const nextEnd = new Date('2024-04-08T00:00:00.000Z');
    const { result } = renderHook(() => useTimespan(initial));

    act(() => {
      result.current.setTimespan(() => new Timespan(nextStart, nextEnd));
    });

    expect(result.current.timespan).not.toBe(initial);
    expect(endpoints(result.current.timespan)).toEqual([
      nextStart.getTime(),
      nextEnd.getTime(),
    ]);
    expect(endpoints(initial)).toEqual([start.getTime(), end.getTime()]);
  });

  test('does not call the initializer again after a Strict Mode mount', () => {
    const initial = new Timespan(start, end);
    const initializer = vi.fn(() => initial);
    const { result, rerender } = renderHook(() => useTimespan(initializer), {
      wrapper: StrictMode,
    });
    const callsAfterMount = initializer.mock.calls.length;

    expect(callsAfterMount).toBeGreaterThan(0);
    expect(result.current.timespan).toBe(initial);

    rerender();

    expect(initializer).toHaveBeenCalledTimes(callsAfterMount);
  });
});
