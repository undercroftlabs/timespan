---
title: Formatting
description: Format a Timespan with a format string.
product: Timespan
group: Guides
order: 7
---

```typescript
format(formatString: string): string
static format(formatString: string, timespan: Timespan): string
```

A format string is literal text plus directives of the form `%[flags][width][.precision]specifier`. `%%` is a percent sign. The static method calls the instance method. The grammar, specifier table, and padding rules are on [Format string](/docs/timespan/format-string).

Uppercase specifiers read floored totals. Lowercase specifiers read the remainders from `toTimeframe()`. `%f` reads the millisecond remainder as fractional-second digits and defaults to three digits. The directive does not insert a decimal point.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-06-01T00:00:00.000Z');
const timespan = new Timespan(start, new Date(start.getTime() + 1_483_506_123));

timespan.format('%D days'); // '17 days'
timespan.format('%h:%02m:%02s'); // '4:05:06'
Timespan.format('%s.%f seconds', timespan); // '6.123 seconds'
timespan.format('100%% complete'); // '100% complete'
```

`%D` is 17 total days. `%h`, `%m`, and `%s` are the hours, minutes, and seconds left after those days: 4, 5, and 6. The same span's total hours are `%H` → `412`.

The pattern is copied through as written. `%d days` stays plural when the value is 1. An unknown specifier throws `Invalid format string: expected a valid format string.` See [Errors](/docs/timespan/errors).

## Related

[Format string](/docs/timespan/format-string) · [Converting units](/docs/timespan/units) · [Formatting time intervals](/blog/formatting-time-intervals)
