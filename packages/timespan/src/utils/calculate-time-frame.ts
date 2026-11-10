import { TimeFrame } from '../types/timeframe';
import { createTimeframe } from '../type-utils/create-timeframe';
import Constants from '../constants';
import { getConverter } from '../unit-conversion-map';

/**
 * Calculate the TimeFrame representation of the timespan.
 * @param startDate - The start date of the timespan.
 * @param endDate - The end date of the timespan.
 * @returns The TimeFrame object representing the timespan.
 */
export function calculateTimeFrame(startDate: Date, endDate: Date): TimeFrame {
  const timeFrame: TimeFrame = createTimeframe();
  const tempDate = new Date(startDate);

  // Calculating the years and months is... complicated.
  timeFrame.years = getConverter('years').between(startDate, endDate);

  // We get the total months between the two dates
  const totalMonths = getConverter('months').between(startDate, endDate);

  // We calculate the months remaining after accounting for the years
  timeFrame.months = Math.floor(
    totalMonths - timeFrame.years * Constants.MonthsPerYear,
  );

  tempDate.setUTCFullYear(tempDate.getUTCFullYear() + timeFrame.years);
  tempDate.setUTCMonth(tempDate.getUTCMonth() + timeFrame.months);

  const totalTimeDiff = endDate.getTime() - startDate.getTime();

  let remainingTime =
    totalTimeDiff - (tempDate.getTime() - startDate.getTime());

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
