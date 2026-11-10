import Constants from '../constants';
import { TimeUnit } from '../types';

/**
 * Represents a converter for a specific date unit.
 */
export abstract class DateUnitConverter {
  /**
   * The default name of the date unit.
   */
  public abstract default: string;

  /**
   * The plural name of the date unit.
   */
  public abstract plural: string;

  /**
   * The abbreviated name of the date unit.
   */
  public abstract abbreviation: string;

  /**
   * An array of aliases for the date unit.
   */
  public abstract aliases: Array<TimeUnit>;

  /**
   * The number of milliseconds per unit for conversions.
   */
  public abstract millisecondsPerUnit: number;

  /**
   * Calculates the number of units between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of units between the two dates.
   */
  public abstract between(startDate: Date, endDate: Date): number;

  /**
   * Adds the specified number of units to the given date.
   * @param value - The number of units to add.
   * @param startDate - The start date.
   * @returns The new date after adding the units.
   */
  public abstract add(value: number, startDate: Date): Date;

  /**
   * Checks if the given year is a leap year.
   * @param year - The year.
   * @returns True if the year is a leap year, false otherwise.
   */
  public isLeapYear(year: number): boolean {
    return (
      (DateUnitConverter.isDivisibleByLeapYearDivisor(year) &&
        !DateUnitConverter.isDivisibleByCenturyDivisor(year)) ||
      DateUnitConverter.isDivisibleByQuadricentennialDivisor(year)
    );
  }

  private static isDivisibleByLeapYearDivisor(year: number): boolean {
    return year % Constants.LeapYearDivisor === 0;
  }

  private static isDivisibleByCenturyDivisor(year: number): boolean {
    return year % Constants.CenturyDivisor === 0;
  }

  private static isDivisibleByQuadricentennialDivisor(year: number): boolean {
    return year % Constants.QuadricentennialDivisor === 0;
  }
}
