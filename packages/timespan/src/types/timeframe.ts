/**
 * Remainder breakdown of one timespan.
 *
 * `Timespan.toTimeframe` returns a copy. `years` is the completed UTC year
 * count. Every other field is what remains after the larger units have been
 * removed. `toMonths()`, `toDays()`, and the other total methods count the
 * whole interval, so those totals can be larger than the field of the same name.
 */
export interface TimeFrame {
  /**
   * Milliseconds left after `seconds`. A whole second is 1,000.
   */
  milliseconds: number;
  /**
   * Whole seconds left after `minutes`. A whole minute is 60.
   */
  seconds: number;
  /**
   * Whole minutes left after `hours`. A whole hour is 60.
   */
  minutes: number;
  /**
   * Whole hours left after `days`. A whole day is 24.
   */
  hours: number;
  /**
   * Whole 24-hour days left after `weeks`.
   */
  days: number;
  /**
   * Whole weeks left after the year and month anniversaries. A week is 7 days of 24 hours.
   */
  weeks: number;
  /**
   * Completed UTC months left after `years`.
   */
  months: number;
  /**
   * Completed UTC years. This matches `Timespan.toYears()`.
   */
  years: number;
}
