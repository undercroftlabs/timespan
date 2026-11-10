import { DateUnitConverter } from './date-unit-converter';
import { SecondUnit } from '../types';

/**
 * Represents a converter for the second unit.
 */
export class SecondConverter extends DateUnitConverter {
  /**
   * The default name of the second unit.
   */
  public readonly default: SecondUnit = 'second';

  /**
   * The plural name of the second unit.
   */
  public readonly plural: SecondUnit = 'seconds';

  /**
   * The abbreviated name of the second unit.
   */
  public readonly abbreviation: SecondUnit = 's';

  /**
   * The number of milliseconds per second.
   */
  public readonly millisecondsPerUnit = 1000;

  /**
   * An array of aliases for the second unit.
   */
  public readonly aliases: Array<SecondUnit> = [
    'seconds',
    'second',
    'secs',
    'sec',
    's',
  ];

  /**
   * Calculates the number of seconds between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of seconds between the two dates.
   * @throws Error if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / this.millisecondsPerUnit,
    );
  }

  /**
   * Adds the specified number of seconds to the given date.
   * @param seconds - The number of seconds to add.
   * @param startDate - The start date.
   * @returns The new date after adding the seconds.
   * @throws Error if the input date is invalid or if the number of seconds is negative.
   */
  public add(seconds: number, startDate: Date): Date {
    return new Date(startDate.getTime() + seconds * this.millisecondsPerUnit);
  }
}
