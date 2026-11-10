import { DateUnitConverter } from './converters/date-unit-converter';
import { DayConverter } from './converters/day-converter';
import { HourConverter } from './converters/hour-converter';
import { MillisecondConverter } from './converters/millisecond-converter';
import { MinuteConverter } from './converters/minute-converter';
import { MonthConverter } from './converters/month-converter';
import { SecondConverter } from './converters/second-converter';
import { WeekConverter } from './converters/week-converter';
import { YearConverter } from './converters/year-converter';
import { TimeUnit } from './types';
import { assertValidTimeUnit } from './assertions';

const converters: DateUnitConverter[] = [
  new YearConverter(),
  new MonthConverter(),
  new WeekConverter(),
  new DayConverter(),
  new HourConverter(),
  new MinuteConverter(),
  new SecondConverter(),
  new MillisecondConverter(),
];

const conversionTable: Record<TimeUnit, DateUnitConverter> = (() => {
  const table: Partial<Record<TimeUnit, DateUnitConverter>> = {};
  for (const converter of converters) {
    for (const alias of converter.aliases) {
      table[alias as TimeUnit] = converter;
    }
  }
  return table as Record<TimeUnit, DateUnitConverter>;
})();

const timeUnits: TimeUnit[] = (() => {
  const unitSet = new Set<TimeUnit>();
  for (const converter of converters) {
    converter.aliases.forEach((alias: TimeUnit) =>
      unitSet.add(alias as TimeUnit),
    );
  }
  return [...unitSet];
})();

/**
 * Get the time unit available in the conversion table.
 * @returns The available time units.
 */
export function getTimeUnits(): TimeUnit[] {
  return timeUnits;
}

/**
 * Retrieves the date unit converter for the specified unit.
 * @param unit - The unit to retrieve the converter for.
 * @returns The date unit converter.
 * @throws {Error} If an invalid date unit is specified.
 */
export function getConverter(unit: TimeUnit): DateUnitConverter {
  assertValidTimeUnit(unit);
  return conversionTable[unit];
}
