import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { YearUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

/**
 * Represents a converter for the year unit.
 */
export class YearConverter extends DateUnitConverter {
  private static readonly february28 = 28;
  private static readonly february29 = 29;
  private static readonly february = 1;
  /**
   * The default name of the year unit.
   */
  public readonly default: YearUnit = 'year';

  /**
   * The plural name of the year unit.
   */
  public readonly plural: YearUnit = 'years';

  /**
   * The abbreviated name of the year unit.
   */
  public readonly abbreviation: YearUnit = 'y';

  /**
   * The number of milliseconds per year.
   */
  public readonly millisecondsPerUnit =
    Constants.DaysPerYear *
    Constants.HoursPerDay *
    Constants.MinutesPerHour *
    Constants.SecondsPerMinute *
    Constants.MillisecondsPerSecond;

  /**
   * An array of aliases for the year unit.
   */
  public readonly aliases: Array<YearUnit> = [
    'years',
    'year',
    'yrs',
    'yr',
    'y',
  ];

  /**
   * Calculates the number of years between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of years between the two dates.
   * @throws {Error} if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    assertValidDateRange(startDate, endDate);

    let years = endDate.getUTCFullYear() - startDate.getUTCFullYear();
    // Calendar-year subtraction counts a January 1 crossing as a full year.
    // A year has elapsed only once add() would land on or before the end.
    if (years > 0 && this.add(years, startDate).getTime() > endDate.getTime()) {
      years--;
    }
    return years;
  }

  /**
   * Adds the specified number of years to the given date.
   * @param years - The number of years to add.
   * @param startDate - The start date.
   * @returns The new date after adding the years.
   * @throws {Error} if the input date is invalid or if the number of years is negative.
   */
  public add(years: number, startDate: Date): Date {
    assertValidDate(startDate);

    this.assertAddAmount(years);

    const startYear = startDate.getUTCFullYear();
    const targetYear = startYear + years;

    // Check if the starting date is on February 29th
    const isStartDateOnLeapYearDay =
      startDate.getUTCMonth() === YearConverter.february &&
      startDate.getUTCDate() === YearConverter.february29;

    const dateWithYearsAdded = new Date(startDate.getTime());
    dateWithYearsAdded.setUTCFullYear(targetYear);

    // If the starting date is on February 29th and the target year is not a leap year,
    // set the date to February 28th
    if (isStartDateOnLeapYearDay && !this.isLeapYear(targetYear)) {
      dateWithYearsAdded.setUTCMonth(YearConverter.february);
      dateWithYearsAdded.setUTCDate(YearConverter.february28);
    }

    this.assertTimestampInRange(dateWithYearsAdded.getTime());
    return dateWithYearsAdded;
  }
}
