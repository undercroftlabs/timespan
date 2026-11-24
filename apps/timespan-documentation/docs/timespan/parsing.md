---
title: Parsing durations
description: Parse a duration string into a Timespan.
product: Timespan
group: Guides
order: 4
---

```typescript
static fromString(input: string, startDate?: Date): Timespan
```

`fromString` reads an integer amount and a unit, repeated. Whitespace between pairs is optional. `1h30m` and `1h 30m` are the same interval. The optional `startDate` is the anchor. When it is omitted, the anchor is the current time. The end is that anchor plus the units, applied from years down to milliseconds.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');
const timespan = Timespan.fromString('3d 5h 30m', start);

timespan.toString(); // '3d 5h 30m'
timespan.toMinutes(); // 4650
timespan.toHours(); // 77
timespan.start.toISOString(); // '2024-01-15T09:00:00.000Z'
```

`toHours()` is the floored total, so the remaining 30 minutes are not part of that number. `toMinutes()` includes them.

## Units

`M` is months. `m` is minutes. Names are case-sensitive.

| Unit         | `toString` form | Also accepted                                | Length             |
| ------------ | --------------- | -------------------------------------------- | ------------------ |
| years        | `y`             | `yr`, `yrs`, `year`, `years`                 | UTC calendar year  |
| months       | `M`             | `mo`, `mos`, `month`, `months`               | UTC calendar month |
| weeks        | `w`             | `wk`, `wks`, `week`, `weeks`                 | 7 × 24 hours       |
| days         | `d`             | `dy`, `dys`, `day`, `days`                   | 24 hours           |
| hours        | `h`             | `hr`, `hrs`, `hour`, `hours`                 | 60 minutes         |
| minutes      | `m`             | `min`, `mins`, `minute`, `minutes`           | 60 seconds         |
| seconds      | `s`             | `sec`, `secs`, `second`, `seconds`           | 1,000 milliseconds |
| milliseconds | `ms`            | `mss`, `msec`, `millisecond`, `milliseconds` | 1 millisecond      |

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');

Timespan.fromString('2years 1month 3weeks 4days', start).toString();
// '2y 1M 3w 4d'
```

`fromObject` accepts only the plural names in the Unit column. `fromUnits` and `toUnit` accept every alias. See [Building durations](/docs/timespan/building) and [Converting units](/docs/timespan/units).

## Input rules

| Rule                                        | Result                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Letters, digits, and whitespace only        | Other characters throw `Invalid input string: expected letters, digits, and whitespace only.`                                       |
| At most 75 characters                       | Longer input throws `Invalid input string: expected at most 75 characters.`                                                         |
| Each amount is an integer of 1 to 10 digits | `1.5h`, `+1h`, and `-1h` fail the character rule. A bare unit such as `h`, or an 11-digit amount, throws `Invalid input string`     |
| Each unit is in the table, once             | An unknown unit throws `Invalid time unit: expected a recognized time unit.` A repeated unit throws `Duplicate date unit: <token>.` |
| A number must have a unit                   | `5` throws `Invalid unit`                                                                                                           |

Fractional fixed-length units belong on the factories, for example `Timespan.fromHours(1.5, start)`.

Month and year tokens use the same UTC clamping as `fromMonths` and `fromYears`. February 29 moves to February 28 in a common year, and a day past the end of a month moves to that month's last day. [January 31 + one month](/blog/january-31-plus-one-month) walks through the month rule.

## Related

[Errors](/docs/timespan/errors) · [Timespan](/docs/timespan/api) · [Parsing human-readable durations](/blog/parsing-human-readable-durations)
