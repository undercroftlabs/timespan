import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { SecondUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

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
   * @throws {Error} if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    assertValidDateRange(startDate, endDate);

    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();

    const secondCount = Math.floor(
      (endMillis - startMillis) / this.millisecondsPerUnit,
    );

    return Math.floor(secondCount);
  }

  /**
   * Adds the specified number of seconds to the given date.
   * @param seconds - The number of seconds to add.
   * @param startDate - The start date.
   * @returns The new date after adding the seconds.
   * @throws {Error} if the input date is invalid or if the number of seconds is negative.
   */
  public add(seconds: number, startDate: Date): Date {
    assertValidDate(startDate);

    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error(
        'Invalid number of seconds: expected zero or a positive number.',
      );
    }

    const time = startDate.getTime() + seconds * this.millisecondsPerUnit;
    if (
      time > Constants.MaxSafeTimestamp ||
      time < Constants.MinSafeTimestamp
    ) {
      throw new Error(
        'Invalid number of seconds: expected a result within the representable date range.',
      );
    }
    return new Date(time);
  }
}
