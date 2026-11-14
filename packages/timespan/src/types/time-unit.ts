import { MillisecondUnit } from './millisecond-unit';
import { SecondUnit } from './second-unit';
import { MinuteUnit } from './minute-unit';
import { HourUnit } from './hour-unit';
import { DayUnit } from './day-unit';
import { WeekUnit } from './week-unit';
import { MonthUnit } from './month-unit';
import { YearUnit } from './year-unit';

/**
 * Enumeration of time units.
 */
export type TimeUnit =
  | MillisecondUnit
  | SecondUnit
  | MinuteUnit
  | HourUnit
  | DayUnit
  | WeekUnit
  | MonthUnit
  | YearUnit;
