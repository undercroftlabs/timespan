import { DateUnitConverter } from './date-unit-converter';
import Constants from '../constants';
import { MinuteUnit } from '../types';

/**
 * Represents a converter for the minute unit.
 */
export class MinuteConverter extends DateUnitConverter {
  /**
   * The default name of the minute unit.
   */
  public readonly default: MinuteUnit = 'minute';

  /**
   * The plural name of the minute unit.
   */
  public readonly plural: MinuteUnit = 'minutes';

  /**
   * The abbreviated name of the minute unit.
   */
  public readonly abbreviation: MinuteUnit = 'm';

  /**
   * The number of milliseconds per minute (60 * 1000).
   */
  public readonly millisecondsPerUnit =
    Constants.SecondsPerMinute * Constants.MillisecondsPerSecond;

  /**
   * An array of aliases for the minute unit.
   */
  public readonly aliases: Array<MinuteUnit> = [
    'minutes',
    'minute',
    'mins',
    'min',
    'm',
  ];

  /**
   * Calculates the number of minutes between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of minutes between the two dates.
   * @throws Error if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / this.millisecondsPerUnit,
    );
  }

  /**
   * Adds the specified number of minutes to the given date.
   * @param minutes - The number of minutes to add.
   * @param startDate - The start date.
   * @returns The new date after adding the minutes.
   * @throws Error if the input date is invalid or if the number of minutes is negative.
   */
  public add(minutes: number, startDate: Date): Date {
    return new Date(startDate.getTime() + minutes * this.millisecondsPerUnit);
  }
}
