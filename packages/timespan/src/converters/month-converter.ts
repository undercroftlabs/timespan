import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { MonthUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

/**
 * Represents a converter for the month unit.
 */
export class MonthConverter extends DateUnitConverter {
  private static readonly daysPerMonth = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];

  /**
   * The default name of the month unit.
   */
  public readonly default: MonthUnit = 'month';

  /**
   * The plural name of the month unit.
   */
  public readonly plural: MonthUnit = 'months';

  /**
   * The abbreviated name of the month unit.
   */
  public readonly abbreviation: MonthUnit = 'M';

  /**
   * The number of milliseconds per month (-1).
   */
  public readonly millisecondsPerUnit = -1;

  /**
   * An array of aliases for the month unit.
   */
  public readonly aliases: Array<MonthUnit> = [
    'months',
    'month',
    'mos',
    'mo',
    'M',
  ];

  /**
   * Calculates the number of months between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of months between the two dates.
   * @throws {Error} if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    assertValidDateRange(startDate, endDate);

    const startYear = startDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const endYear = endDate.getUTCFullYear();
    const endMonth = endDate.getUTCMonth();

    let months =
      (endYear - startYear) * Constants.MonthsPerYear + (endMonth - startMonth);
    // Day-of-month comparison ignores time, so Jan 15 12:00 to Feb 15 11:00
    // would count as a full month. A month has elapsed only once the
    // anniversary is representable and lands on or before the end.
    if (months > 0 && !this.anniversaryHasLanded(months, startDate, endDate)) {
      months--;
    }
    return Math.floor(months);
  }

  /**
   * Adds the specified number of months to the given date.
   * @param months - The number of months to add.
   * @param startDate - The start date.
   * @returns The new date after adding the months.
   * @throws {Error} if the input date is invalid or if the number of months is negative.
   */
  public add(months: number, startDate: Date): Date {
    assertValidDate(startDate);

    this.assertAddAmount(months);

    const time = this.timestampAfterAddingMonths(months, startDate);
    this.assertTimestampInRange(time);
    return new Date(time);
  }

  /**
   * A month has landed when its anniversary is a real timestamp on or before the end.
   * An anniversary past the representable range has not landed.
   * @param months - Whole month count from the calendar difference.
   * @param startDate - Valid range start.
   * @param endDate - Valid range end.
   * @returns True when the anniversary is representable and on or before `endDate`.
   */
  private anniversaryHasLanded(
    months: number,
    startDate: Date,
    endDate: Date,
  ): boolean {
    const time = this.timestampAfterAddingMonths(months, startDate);
    return this.isTimestampInRange(time) && time <= endDate.getTime();
  }

  private timestampAfterAddingMonths(months: number, startDate: Date): number {
    const newDate = new Date(startDate.getTime());
    const originalDay = newDate.getUTCDate();
    const originalHours = newDate.getUTCHours();
    const originalMinutes = newDate.getUTCMinutes();
    const originalSeconds = newDate.getUTCSeconds();
    const originalMilliseconds = newDate.getUTCMilliseconds();

    // Move to the first of the month first so setUTCMonth cannot overflow
    // into a later month (Jan 31 + 1 month would otherwise become Mar 3).
    newDate.setUTCDate(1);
    newDate.setUTCMonth(newDate.getUTCMonth() + months);
    newDate.setUTCDate(Math.min(originalDay, this.lastDayOfMonth(newDate)));
    newDate.setUTCHours(
      originalHours,
      originalMinutes,
      originalSeconds,
      originalMilliseconds,
    );
    return newDate.getTime();
  }

  /**
   * Day count of the month containing `date`. The UTC last-day lookup is used
   * while that day exists; otherwise the Gregorian length is used so a shorter
   * day in the same month is not cleared by an unrepresentable last day.
   * @param date - Date already moved onto the target month.
   * @returns The last calendar day of that month.
   */
  private lastDayOfMonth(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    if (Number.isFinite(lastDay)) {
      return lastDay;
    }
    if (month === 1) {
      return this.isLeapYear(year) ? 29 : 28;
    }
    return MonthConverter.daysPerMonth[month];
  }
}
