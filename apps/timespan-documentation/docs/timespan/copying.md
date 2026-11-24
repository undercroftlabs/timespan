---
title: Copying
description: Clone a Timespan and keep its dates independent of the caller.
product: Timespan
group: Guides
order: 10
---

A timespan stores its own endpoints. The constructor copies `start` and `end` by time value. `fromObject` and the factories do the same with the dates they receive. Instance methods do not change the stored endpoints.

```typescript
clone(): Timespan
static clone(timespan: Timespan): Timespan
```

`clone` returns a new timespan with the same endpoints. The static method calls the instance method.

```typescript
import { Timespan } from '@undercroft/timespan';

const original = new Timespan(
  new Date('2024-07-01T00:00:00.000Z'),
  new Date('2024-07-10T00:00:00.000Z'),
);
const copy = original.clone();

copy === original; // false
copy.equals(original, 'range'); // true
Timespan.clone(original).equals(original, 'range'); // true
```

## Dates that leave the instance

`start` and `end` return a new `Date` on every read. `toTimeframe()` and `toJSON()` return new objects. Mutating any of them leaves the interval unchanged.

```typescript
import { Timespan } from '@undercroft/timespan';

const original = new Timespan(
  new Date('2024-07-01T00:00:00.000Z'),
  new Date('2024-07-10T00:00:00.000Z'),
);

const readStart = original.start;
readStart.setUTCFullYear(1990);
original.start.toISOString(); // '2024-07-01T00:00:00.000Z'
```

## Related

[Date ranges](/docs/timespan/date-ranges) · [Saving and restoring](/docs/timespan/serialization) · [Mutable dates](/blog/mutable-dates-and-defensive-copying)
