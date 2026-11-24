---
title: Building durations
description: Build a Timespan from unit factories, fromUnits, or fromObject.
product: Timespan
group: Guides
order: 5
---

Each factory adds a finite amount of one unit to a start date. The start defaults to the current time. A negative amount throws `Invalid unit input <amount>.` `NaN` and `Infinity` throw `Invalid number of <unit>: expected zero or a positive number.` A result outside `-8.64e15` through `8.64e15` milliseconds throws `Invalid number of <unit>: expected a result within the representable date range.`

```typescript
static fromMilliseconds(millis: number, startDate?: Date): Timespan
static fromSeconds(seconds: number, startDate?: Date): Timespan
static fromMinutes(minutes: number, startDate?: Date): Timespan
static fromHours(hours: number, startDate?: Date): Timespan
static fromDays(days: number, startDate?: Date): Timespan
static fromWeeks(weeks: number, startDate?: Date): Timespan
static fromMonths(months: number, startDate?: Date): Timespan
static fromYears(years: number, startDate?: Date): Timespan
static fromUnits(amount: number, unit: TimeUnit, startDate?: Date): Timespan
```

`TimeUnit` is every alias in the [parsing table](/docs/timespan/parsing#units). It is exported from `@undercroft/timespan`. `fromUnits` is the method the other factories call.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');

Timespan.fromHours(1.5, start).toString(); // '1h 30m'
Timespan.fromUnits(90, 'mins', start).toString(); // '1h 30m'
Timespan.fromDays(1.5, start).toHours(); // 36
```

Weeks, days, hours, minutes, seconds, and milliseconds keep fractional amounts in the endpoints. Reading the span back with `toDays()`, `toHours()`, and the other total methods returns a floored integer.

Months and years are truncated toward zero before they are added. `fromMonths(0.5, start)` and `fromYears(0.5, start)` end at `start`. `fromYears(1.9, start)` adds one year.

```typescript
import { Timespan } from '@undercroft/timespan';

Timespan.fromMonths(1, new Date('2024-01-31T00:00:00.000Z')).end.toISOString();
// '2024-02-29T00:00:00.000Z'

Timespan.fromMonths(1, new Date('2023-01-31T00:00:00.000Z')).end.toISOString();
// '2023-02-28T00:00:00.000Z'

Timespan.fromYears(1, new Date('2020-02-29T12:30:00.000Z')).end.toISOString();
// '2021-02-28T12:30:00.000Z'
```

The clock time is preserved. The calendar day moves only when the target month or year has no such day.

## fromObject

```typescript
static fromObject(
  input: {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  },
  startDate?: Date,
): Timespan
```

`startDate` defaults to the current time. Omitted fields and `0` add nothing. Keys other than the eight plural names are ignored, including unit aliases such as `y` or `h`. Amounts are applied in the order years, months, weeks, days, hours, minutes, seconds, milliseconds. A later unit is added after an earlier calendar clamp.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');

Timespan.fromObject({ days: 3, hours: 4, minutes: 30 }, start).toString();
// '3d 4h 30m'

Timespan.fromObject(
  { months: 1, days: 1 },
  new Date('2023-01-31T00:00:00.000Z'),
).end.toISOString();
// '2023-03-01T00:00:00.000Z'
```

January 31 plus one month is February 28, and the extra day then lands on March 1.

A negative or non-finite field throws `Invalid number of <field>: expected zero or a positive number.` That message differs from the factory message for a negative amount. `null`, an array, or any other non-object throws `TypeError: Invalid timeframe: expected an object.` The supplied object and start date are not modified.

## Related

[Parsing durations](/docs/timespan/parsing) · [Converting units](/docs/timespan/units) · [Errors](/docs/timespan/errors) · [January 31 + one month](/blog/january-31-plus-one-month)
