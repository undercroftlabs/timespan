import { MillisecondUnit } from './millisecond-unit';
import { SecondUnit } from './second-unit';
import { MinuteUnit } from './minute-unit';
import { HourUnit } from './hour-unit';
import { DayUnit } from './day-unit';
import { WeekUnit } from './week-unit';
import { MonthUnit } from './month-unit';
import { YearUnit } from './year-unit';

/**
 * Unit name accepted by `Timespan.fromUnits` and `Timespan.toUnit`.
 * The union includes each abbreviation and each full word. `M` is months and `m` is minutes.
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
