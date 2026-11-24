---
title: Date ranges
description: Create a Timespan from a start date and an end date.
product: Timespan
group: Guides
order: 3
---

```typescript
constructor(start: Date, end: Date)
```

`start` and `end` must be `Date` instances with a finite time value. A date string or a numeric timestamp is rejected. The start instant must be earlier than or equal to the end instant. Both endpoints are copied at construction. Later changes to the caller's dates do not change the timespan, and the timespan's methods do not move its endpoints.

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = new Timespan(
  new Date('2024-01-08T00:00:00.000Z'),
  new Date('2024-06-21T00:00:00.000Z'),
);

timespan.start.toISOString(); // '2024-01-08T00:00:00.000Z'
timespan.end.toISOString(); // '2024-06-21T00:00:00.000Z'
timespan.toString(); // '5M 1w 6d'
timespan.toDays(); // 165
timespan.toMonths(); // 5
```

`start` and `end` each return a new `Date`. Mutating the returned date leaves the interval unchanged. See [Copying](/docs/timespan/copying).

Equal endpoints are a zero-length interval. `toString()` is `''`.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-03-01T00:00:00.000Z');
const timespan = new Timespan(start, start);

timespan.isZero(); // true
timespan.toString(); // ''
Timespan.isZero(timespan); // true
```

Month and year totals follow UTC anniversaries. A day is 86,400,000 milliseconds. Details are on [Converting units](/docs/timespan/units). Invalid values throw the errors listed on [Errors](/docs/timespan/errors).

## Related

[Building durations](/docs/timespan/building) · [Timespan](/docs/timespan/api) · [Mutable dates](/blog/mutable-dates-and-defensive-copying)
