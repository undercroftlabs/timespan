/**
 * Represents a time frame with various units of time.
 */
export interface TimeFrame {
  [key: string]: number | string | undefined;

  /**
   * The amount of time in milliseconds.
   */
  milliseconds: number;
  /**
   * The amount of time in seconds.
   */
  seconds: number;
  /**
   * The amount of time in minutes.
   */
  minutes: number;
  /**
   * The amount of time in hours.
   */
  hours: number;
  /**
   * The amount of time in days.
   */
  days: number;
  /**
   * The amount of time in weeks.
   */
  weeks: number;
  /**
   * The amount of time in months.
   */
  months: number;
  /**
   * The amount of time in years.
   */
  years: number;
}
