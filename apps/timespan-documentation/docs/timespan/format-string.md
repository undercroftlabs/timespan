---
title: Format string
description: Specifiers, flags, width, and precision for Timespan.format.
product: Timespan
group: Reference
order: 12
---

`format` scans a string for directives. Literal text is copied. `%%` writes one `%`. There is no length limit on the format string.

```text
%[flags][width][.precision]specifier
```

Flags are `0`, `-`, `+`, and a space, in any order. A repeated flag counts once. `-` disables zero padding. `+` takes precedence over a space. The sign is included in the width.

Width is a minimum field width from 0 through 999,999. A shorter value is padded on the left with spaces, or with zeros when `0` is set and integer precision is absent. `-` pads on the right with spaces. A longer value is left intact.

This span is 2 weeks, 3 days, 4 hours, 5 minutes, 6 seconds, and 123 milliseconds (1,483,506,123 milliseconds):

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-06-01T00:00:00.000Z');
const timespan = new Timespan(start, new Date(start.getTime() + 1_483_506_123));

timespan.format('%Y %y %B %b %W %w %D %d %H %h %M %m %S %s %L %l %f');
// '0 0 0 0 2 2 17 3 412 4 24725 5 1483506 6 1483506123 123 123'
```

## Specifiers

Uppercase specifiers are floored totals from the `to*` methods. Lowercase specifiers are the remainder fields from `toTimeframe()`. See [Converting units](/docs/timespan/units).

| Specifier   | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| `%Y` / `%y` | Total years / year remainder                               |
| `%B` / `%b` | Total months / month remainder                             |
| `%W` / `%w` | Total weeks / week remainder                               |
| `%D` / `%d` | Total days / day remainder                                 |
| `%H` / `%h` | Total hours / hour remainder                               |
| `%M` / `%m` | Total minutes / minute remainder                           |
| `%S` / `%s` | Total seconds / second remainder                           |
| `%L` / `%l` | Total milliseconds / millisecond remainder                 |
| `%f`        | Millisecond remainder rendered as fractional-second digits |

`%f` does not insert a decimal point. Write the point in the literal text: `%s.%f`. The character after a specifier is literal, so `%ll` is the millisecond remainder followed by `l`.

## Integer precision

For every specifier except `%f`, precision is a minimum digit count. It pads with zeros and does not truncate. Setting a precision disables the zero flag, so `%06.3h` pads with spaces.

Precision `0` prints a numeric zero as no digits. Combined with the zero flag, precision `0` also clears a non-zero value: `%05.0h` for 5 hours is five spaces.

```typescript
import { Timespan } from '@undercroft/timespan';

Timespan.fromHours(5).format('%05h'); // '00005'
Timespan.fromHours(5).format('%+5h'); // '   +5'
Timespan.fromHours(5).format('%.2h'); // '05'
```

## Fractional seconds

`%f` defaults to 3 digits, zero-padded. A smaller precision truncates and does not round. A larger precision extends with zeros. `%f` keeps zero padding when a precision is present. `%.0f` is empty.

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = Timespan.fromMilliseconds(123);

timespan.format('%f'); // '123'
timespan.format('%.1f'); // '1'
timespan.format('%.4f'); // '1230'
timespan.format('%s.%03f'); // '0.123'
```

199 milliseconds with `%.1f` is `1`, and with `%.2f` is `19`.

## Rejection

A non-string throws `Invalid format string: expected a string.` A dangling `%`, an unknown specifier, a `.` without digits, or a width or precision of 1,000,000 or more throws `Invalid format string: expected a valid format string.` An empty string is valid and returns `''`.

## Related

[Formatting](/docs/timespan/formatting) · [Errors](/docs/timespan/errors) · [Formatting time intervals](/blog/formatting-time-intervals)
