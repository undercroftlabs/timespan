---
title: Introduction
description: Timespan measures the interval between two dates, parses duration strings, and formats the result.
product: Timespan
group: Get Started
order: 1
---

`@undercroft/timespan` 1.4.0 represents one interval between two JavaScript `Date` instants. Create it from endpoints, a duration string, a unit count, or an object of units, then read, compare, format, or serialize it.

Calendar arithmetic uses UTC. Weeks, days, and smaller units are exact multiples of milliseconds. The library has no time-zone database and does not schedule recurrence.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');
const timespan = Timespan.fromString('3d 5h 30m', start);

timespan.toString(); // '3d 5h 30m'
timespan.toMinutes(); // 4650
```

`Timespan` is the named export and the default export. The type exports are `TimespanJson`, `TimespanCreationResult`, `TimeFrame`, and `TimeUnit`.

## Where to go next

| Task                       | Page                                          |
| -------------------------- | --------------------------------------------- |
| Install the package        | [Installation](/docs/timespan/installation)   |
| Measure two dates          | [Date ranges](/docs/timespan/date-ranges)     |
| Parse `3d 5h 30m`          | [Parsing durations](/docs/timespan/parsing)   |
| Build from numbers         | [Building durations](/docs/timespan/building) |
| Read totals and components | [Converting units](/docs/timespan/units)      |
| Print a pattern            | [Formatting](/docs/timespan/formatting)       |
| Look up a signature        | [Timespan](/docs/timespan/api)                |

`@undercroft/react-timespan` is a separate package. Its hook is documented under [React Timespan](/docs/react-timespan).

Further reading: [duration and date interval](/blog/duration-vs-date-interval), [Date, Temporal, and Timespan](/blog/date-vs-temporal-vs-timespan).
