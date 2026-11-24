---
title: Converting units
description: Read a Timespan as totals or as a calendar breakdown.
product: Timespan
group: Guides
order: 6
---

Totals and timeframe components answer different questions. A total is the complete number of one unit in the whole interval. A component is what remains after every larger unit has been removed.

```typescript
toMilliseconds(): number
toSeconds(): number
toMinutes(): number
toHours(): number
toDays(): number
toWeeks(): number
toMonths(): number
toYears(): number
toUnit(unit: TimeUnit): number
toTimeframe(): TimeFrame
toString(): string
```

`TimeUnit` is an alias from the [parsing table](/docs/timespan/parsing#units). `TimeFrame` is the object below. Neither name is a separate export.

## Totals

Fixed-length totals divide the elapsed milliseconds and floor the result. One week is 7 days, one day is 24 hours, one hour is 60 minutes, one minute is 60 seconds, and one second is 1,000 milliseconds.

`toMonths()` and `toYears()` count completed UTC anniversaries. A month or year counts only when its anniversary is representable and falls on or before the end. January 15 12:00 to February 15 11:00 is 0 months. The time of day is part of the anniversary.

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = Timespan.fromDays(90, new Date('2024-01-15T00:00:00.000Z'));

timespan.toDays(); // 90
timespan.toHours(); // 2160
timespan.toWeeks(); // 12
timespan.toMonths(); // 2
timespan.toUnit('hr'); // 2160
```

Ninety days from January 15 is two completed months. The month total is not `90 / 30`.

## Calendar breakdown

`toTimeframe()` returns a new object of remainders. Changing that object does not change the timespan.

| Field          | Meaning                                                 |
| -------------- | ------------------------------------------------------- |
| `years`        | `toYears()`                                             |
| `months`       | Completed months left after `years`                     |
| `weeks`        | Whole weeks left after the year and month anniversaries |
| `days`         | Whole 24-hour days left after `weeks`                   |
| `hours`        | Whole hours left after `days`                           |
| `minutes`      | Whole minutes left after `hours`                        |
| `seconds`      | Whole seconds left after `minutes`                      |
| `milliseconds` | Milliseconds left after `seconds`                       |

`toString()` joins the non-zero fields with the abbreviations `y`, `M`, `w`, `d`, `h`, `m`, `s`, and `ms`, largest first. A zero-length interval returns `''`.

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = Timespan.fromDays(90, new Date('2024-01-15T00:00:00.000Z'));

timespan.toString(); // '2M 4w 2d'
timespan.toTimeframe();
// { years: 0, months: 2, weeks: 4, days: 2, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
```

The same fields are what lowercase [format specifiers](/docs/timespan/format-string) read. Uppercase specifiers read the totals.

## Related

[Formatting](/docs/timespan/formatting) · [Building durations](/docs/timespan/building) · [January 31 + one month](/blog/january-31-plus-one-month)
