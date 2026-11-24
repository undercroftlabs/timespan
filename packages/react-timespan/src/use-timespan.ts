import { Timespan } from '@undercroft/timespan';
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

/**
 * A value for the first render, or a function React calls to produce it.
 *
 * React calls the function while initializing state. A later `initial` leaves
 * the stored value in place.
 *
 * @template T - Value stored by the hook.
 */
type InitialState<T> = T | (() => T);

/**
 * The timespan from {@link useTimespan}, and the functions that update it.
 */
export interface UseTimespanResult {
  /**
   * Timespan for this render.
   */
  timespan: Timespan;

  /**
   * Store a new {@link Timespan} that starts at `start` and keeps the latest end.
   *
   * The end is the one already stored, including updates queued earlier in this
   * turn. {@link Timespan} rejects an invalid date or a reversed range when
   * React processes the update.
   *
   * A separate call that moves the other endpoint can reject a reversed
   * intermediate range even when the final pair of instants is valid. Use
   * `setTimespan` to change both endpoints in one update.
   *
   * @param start - New start instant.
   */
  setStart: (start: Date) => void;

  /**
   * Store a new {@link Timespan} that keeps the latest start and ends at `end`.
   *
   * The start is the one already stored, including updates queued earlier in
   * this turn. {@link Timespan} rejects an invalid date or a reversed range
   * when React processes the update.
   *
   * A separate call that moves the other endpoint can reject a reversed
   * intermediate range even when the final pair of instants is valid. Use
   * `setTimespan` to change both endpoints in one update.
   *
   * @param end - New end instant.
   */
  setEnd: (end: Date) => void;

  /**
   * Replace the stored timespan, or derive the next one from the latest value.
   *
   * Pass a {@link Timespan} to store that instance. Pass a function to receive
   * the latest timespan, including updates already queued, and return the
   * instance to store. Use that function to change both endpoints together.
   *
   * @param value - Next timespan, or a function of the latest timespan.
   * @example
   * setTimespan(new Timespan(start, end));
   * setTimespan((current) => new Timespan(newStart, newEnd));
   */
  setTimespan: Dispatch<SetStateAction<Timespan>>;
}

/**
 * Hold a {@link Timespan} in React state.
 *
 * Pass a `Timespan`, or a function that returns one. React calls that function
 * while initializing state. Changing `initial` on a later render leaves the
 * stored timespan in place. The stored value stays put until a setter runs.
 * It does not follow the current time.
 *
 * `setStart` and `setEnd` each store a new `Timespan` built from the latest
 * pending value. Queued updates run in order, and each intermediate interval
 * has to be valid. Use `setTimespan` to change both endpoints in one update.
 * `setTimespan` stores a `Timespan`, or applies a function to the latest one.
 * {@link Timespan} rejects an invalid date or a reversed range when React
 * processes the update. {@link Timespan.tryCreate} checks a whole interval
 * before that update is scheduled.
 *
 * @param initial - Timespan for the first render, or a function that returns one.
 * @returns The current timespan and the functions that update it.
 * @see {@link Timespan}
 *
 * @example
 * ```tsx
 * import { Timespan } from '@undercroft/timespan';
 * import { useTimespan } from '@undercroft/react-timespan';
 *
 * const opening = new Date('2024-03-01T00:00:00.000Z');
 * const closing = new Date('2024-03-15T00:00:00.000Z');
 *
 * function BookingWindow() {
 *   const { timespan, setEnd } = useTimespan(new Timespan(opening, closing));
 *
 *   return (
 *     <button
 *       type="button"
 *       onClick={() => setEnd(new Date('2024-03-20T00:00:00.000Z'))}
 *     >
 *       {timespan.toString()}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Shift() {
 *   const { timespan, setStart } = useTimespan(() =>
 *     Timespan.fromDays(14, new Date('2024-03-01T00:00:00.000Z')),
 *   );
 *
 *   return (
 *     <button
 *       type="button"
 *       onClick={() => setStart(new Date('2024-02-28T00:00:00.000Z'))}
 *     >
 *       {timespan.toString()}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTimespan(
  initial: InitialState<Timespan>,
): UseTimespanResult {
  const [timespan, setTimespan] = useState<Timespan>(initial);

  const setStart = useCallback((start: Date) => {
    setTimespan((current) => new Timespan(start, current.end));
  }, []);

  const setEnd = useCallback((end: Date) => {
    setTimespan((current) => new Timespan(current.start, end));
  }, []);

  return {
    timespan,
    setStart,
    setEnd,
    setTimespan,
  };
}
