---
title: Timespan
description: Construct a Timespan and call the methods that read it.
product: Timespan
group: Reference
order: 11
---

```typescript
import {
  Timespan,
  type TimeFrame,
  type TimeUnit,
  type TimespanCreationResult,
  type TimespanJson,
} from '@undercroft/timespan';
import Timespan from '@undercroft/timespan';
```

`Timespan` is the class. Both the named class and the default export are that class. Version 1.4.0.

`TimespanJson` is the serialized object. `TimespanCreationResult` is the result of `Timespan.tryCreate`. `TimeUnit` is the alias union on [Parsing durations](/docs/timespan/parsing#units). `TimeFrame` is the remainder object on [Converting units](/docs/timespan/units#calendar-breakdown). All four types are exported.

Methods read or return new values. They do not move the stored endpoints.

## Constructor

```typescript
constructor(start: Date, end: Date)
```

| Parameter | Meaning                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| `start`   | Start instant. Must be a valid `Date`. Copied by time value.                   |
| `end`     | End instant. Must be a valid `Date` at or after `start`. Copied by time value. |

```typescript
const timespan = new Timespan(
  new Date('2024-03-01T00:00:00.000Z'),
  new Date('2024-03-15T00:00:00.000Z'),
);

timespan.toString(); // '2w'
timespan.toMilliseconds(); // 1209600000
```

Behavior, zero-length ranges, and endpoint copies: [Date ranges](/docs/timespan/date-ranges). Throws: [Errors](/docs/timespan/errors).

## Endpoints

| Member              | Returns                   |
| ------------------- | ------------------------- |
| `get start(): Date` | Copy of the start instant |
| `get end(): Date`   | Copy of the end instant   |

## Creating

Omitted start dates use the current time. Negative factory amounts throw `Invalid unit input <amount>.` `fromObject` uses a different message for the same case. Full rules: [Building durations](/docs/timespan/building) and [Parsing durations](/docs/timespan/parsing).

| Method             | Signature                                                      |
| ------------------ | -------------------------------------------------------------- |
| `fromString`       | `(input: string, startDate?: Date): Timespan`                  |
| `fromUnits`        | `(amount: number, unit: TimeUnit, startDate?: Date): Timespan` |
| `fromMilliseconds` | `(millis: number, startDate?: Date): Timespan`                 |
| `fromSeconds`      | `(seconds: number, startDate?: Date): Timespan`                |
| `fromMinutes`      | `(minutes: number, startDate?: Date): Timespan`                |
| `fromHours`        | `(hours: number, startDate?: Date): Timespan`                  |
| `fromDays`         | `(days: number, startDate?: Date): Timespan`                   |
| `fromWeeks`        | `(weeks: number, startDate?: Date): Timespan`                  |
| `fromMonths`       | `(months: number, startDate?: Date): Timespan`                 |
| `fromYears`        | `(years: number, startDate?: Date): Timespan`                  |
| `fromObject`       | `(input: Partial<TimeFrame>, startDate?: Date): Timespan`      |
| `tryCreate`        | `(start: Date, end: Date): TimespanCreationResult`             |

`fromObject` reads the plural fields `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`, and `milliseconds`. Other keys are ignored.

`tryCreate` runs the constructor's date checks and returns the result. `success: true` carries the timespan on `value`. `success: false` carries the validation `Error` on `error`. Those two failures do not throw.

```typescript
const start = new Date('2024-01-15T09:00:00.000Z');

Timespan.fromString('3d 5h 30m', start);
Timespan.fromHours(1.5, start).toString(); // '1h 30m'
Timespan.fromObject({ days: 3, hours: 4 }, start).toString(); // '3d 4h'
```

## Reading

| Method                                 | Returns                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `toMilliseconds()` through `toYears()` | Floored total in that unit. Months and years are completed UTC anniversaries. |
| `toUnit(unit: TimeUnit): number`       | The same total, selected by alias                                             |
| `toTimeframe(): TimeFrame`             | New remainder object                                                          |
| `toString(): string`                   | Non-zero remainders, such as `2w`. `''` when the length is zero               |
| `isZero(): boolean`                    | `toMilliseconds() === 0`                                                      |
| `Timespan.isZero(timespan): boolean`   | Calls `isZero`                                                                |

[Converting units](/docs/timespan/units).

## Comparing

| Method                                                      | Returns                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `compareTo(other: Timespan): number`                        | `-1`, `0`, or `1` by millisecond length                                        |
| `Timespan.compareTo(ts1, ts2): number`                      | `ts1.compareTo(ts2)`                                                           |
| `equals(other, compareBy?: 'range' \| 'duration'): boolean` | Duration by default. `'range'` compares both endpoints. Any other mode throws. |
| `Timespan.equals(ts1, ts2, compareBy?): boolean`            | `ts1.equals(ts2, compareBy)`                                                   |

[Comparing](/docs/timespan/comparing).

## Formatting

| Method                                                              | Returns                       |
| ------------------------------------------------------------------- | ----------------------------- |
| `format(formatString: string): string`                              | Text with directives replaced |
| `Timespan.format(formatString: string, timespan: Timespan): string` | Calls the instance method     |

[Formatting](/docs/timespan/formatting) · [Format string](/docs/timespan/format-string).

## JSON

| Method                                                           | Returns                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| `toJSON(): TimespanJson`                                         | `{ $type: 'Timespan', start, end }` with ISO strings |
| `Timespan.toJSON(timespan): TimespanJson`                        | Calls the instance method                            |
| `Timespan.fromJSON(json: unknown): Timespan`                     | Rebuilds the interval. Extra fields are ignored      |
| `Timespan.stringify(timespan): string`                           | `JSON.stringify(timespan)`                           |
| `Timespan.parse(jsonString: string): Timespan`                   | One Timespan JSON text value                         |
| `Timespan.reviver(key: string, value: unknown): unknown`         | Restores nested Timespan JSON during `JSON.parse`    |
| `Timespan.isTimespanJSON(value: unknown): value is TimespanJson` | Shape check. Does not parse the date strings         |

[Saving and restoring](/docs/timespan/serialization).

## Copying

| Method                               | Returns                      |
| ------------------------------------ | ---------------------------- |
| `clone(): Timespan`                  | New timespan, same endpoints |
| `Timespan.clone(timespan): Timespan` | Calls the instance method    |

[Copying](/docs/timespan/copying).
