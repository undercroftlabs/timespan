---
title: Comparing
description: Order timespans by elapsed length or compare their endpoints.
product: Timespan
group: Guides
order: 8
---

```typescript
compareTo(other: Timespan): number
static compareTo(ts1: Timespan, ts2: Timespan): number

equals(other: Timespan, compareBy?: 'range' | 'duration'): boolean
static equals(
  ts1: Timespan,
  ts2: Timespan,
  compareBy?: 'range' | 'duration',
): boolean
```

`compareTo` compares `toMilliseconds()`. It returns `-1` when the receiver is shorter, `1` when it is longer, and `0` when the elapsed lengths are equal. It does not compare the position of the interval. The static method calls the instance method with `ts1` as the receiver.

```typescript
import { Timespan } from '@undercroft/timespan';

const migration = new Timespan(
  new Date('2024-04-01T08:00:00.000Z'),
  new Date('2024-04-01T10:30:00.000Z'),
);
const reportExport = new Timespan(
  new Date('2024-04-02T13:00:00.000Z'),
  new Date('2024-04-02T14:15:00.000Z'),
);

migration.compareTo(reportExport); // 1
Timespan.compareTo(migration, reportExport); // 1
```

The migration is 2 hours 30 minutes. The export is 1 hour 15 minutes.

## Equality

The default `compareBy` is `'duration'`. Two intervals are equal when their millisecond lengths are equal, including intervals that occupy different dates.

`'range'` requires both `start.getTime()` and `end.getTime()` to match. Any other value throws `Invalid comparison mode: expected 'range' or 'duration'.` Omitting `compareBy`, or passing `undefined`, still compares duration.

```typescript
import { Timespan } from '@undercroft/timespan';

const reportExport = new Timespan(
  new Date('2024-04-02T13:00:00.000Z'),
  new Date('2024-04-02T14:15:00.000Z'),
);
const sameLength = new Timespan(
  new Date('2024-04-01T08:00:00.000Z'),
  new Date('2024-04-01T09:15:00.000Z'),
);

sameLength.equals(reportExport); // true
sameLength.equals(reportExport, 'range'); // false
Timespan.equals(sameLength, reportExport, 'range'); // false
```

`isZero()` is `toMilliseconds() === 0`. `Timespan.isZero(timespan)` calls that method.

## Related

[Date ranges](/docs/timespan/date-ranges) · [Converting units](/docs/timespan/units) · [Duration and date interval](/blog/duration-vs-date-interval)
