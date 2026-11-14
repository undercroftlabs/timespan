import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { TimeFrame } from '../types/timeframe';
import { getConverter } from './unit-conversion-map';

/**
 * Calculate the TimeFrame representation of the timespan.
 * @param startDate - The start date of the timespan.
 * @param endDate - The end date of the timespan.
 * @returns The TimeFrame object representing the timespan.
 * @throws {Error} `Invalid date: expected a valid Date.`
 * @throws {Error} `Invalid date range: expected the start date to be less than or equal to the end date.`
 */
export function calculateTimeFrame(startDate: Date, endDate: Date): TimeFrame {
  assertValidDate(startDate);
  assertValidDate(endDate);
  assertValidDateRange(startDate, endDate);

  const timeFrame: TimeFrame = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };
  const yearConverter = getConverter('years');
  const monthConverter = getConverter('months');

  timeFrame.years = yearConverter.between(startDate, endDate);

  // Months left after the whole years. Month and year anniversaries can disagree
  // by a short month or a leap day, so the remainder is not totalMonths % 12.
  const totalMonths = monthConverter.between(startDate, endDate);
  timeFrame.months = Math.floor(
    totalMonths - timeFrame.years * Constants.MonthsPerYear,
  );

  // add() clamps 31 January and 29 February. setUTCMonth and setUTCFullYear
  // would roll those dates into the next month and make the remainder negative.
  const cursor = monthConverter.add(
    timeFrame.months,
    yearConverter.add(timeFrame.years, startDate),
  );
  let remainingTime = endDate.getTime() - cursor.getTime();

  const millisecondsPerWeek = getConverter('week').millisecondsPerUnit;
  const millisecondsPerDay = getConverter('days').millisecondsPerUnit;
  const millisecondsPerHour = getConverter('hours').millisecondsPerUnit;
  const millisecondsPerMinute = getConverter('minutes').millisecondsPerUnit;
  const millisecondsPerSeconds = getConverter('seconds').millisecondsPerUnit;

  timeFrame.weeks = Math.floor(remainingTime / millisecondsPerWeek);
  remainingTime %= millisecondsPerWeek;
  timeFrame.days = Math.floor(remainingTime / millisecondsPerDay);
  remainingTime %= millisecondsPerDay;
  timeFrame.hours = Math.floor(remainingTime / millisecondsPerHour);
  remainingTime %= millisecondsPerHour;
  timeFrame.minutes = Math.floor(remainingTime / millisecondsPerMinute);
  remainingTime %= millisecondsPerMinute;
  timeFrame.seconds = Math.floor(remainingTime / millisecondsPerSeconds);
  remainingTime %= millisecondsPerSeconds;
  timeFrame.milliseconds = remainingTime;

  return timeFrame;
}
