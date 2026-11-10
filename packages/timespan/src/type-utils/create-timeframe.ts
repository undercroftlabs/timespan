import { TimeFrame } from '../types/timeframe';

/**
 * Creates a new TimeFrame object with all values initialized to zero.
 * @returns A new TimeFrame object.
 */
export function createTimeframe(): TimeFrame {
  return {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };
}
