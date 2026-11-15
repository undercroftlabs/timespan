# Timespan — Intuitive Time Interval Calculations in JavaScript

When dealing with time durations or intervals in JavaScript, it's often useful to have a reliable way to represent and
manipulate them. The `Timespan` class provides a convenient and powerful solution for working with timespans in
JavaScript.

Works in Typescript too!

[![Build Status](https://img.shields.io/github/actions/workflow/status/undercroftlabs/timespan/publish.yml)](https://github.com/undercroftlabs/timespan/actions/workflows/publish.yml)
[![Issues Status](https://img.shields.io/github/issues/undercroftlabs/timespan)](https://github.com/undercroftlabs/timespan/issues)
[![Pull Request Status](https://img.shields.io/github/issues-pr-raw/undercroftlabs/timespan)](https://github.com/undercroftlabs/timespan/pulls)
[![NPM Version Status](https://img.shields.io/npm/v/@undercroft/timespan)](https://www.npmjs.com/package/@undercroft/timespan)
[![License Status](https://img.shields.io/github/license/undercroftlabs/timespan)](https://github.com/undercroftlabs/timespan/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@undercroft/timespan)](https://bundlephobia.com/package/@undercroft/timespan)
[![Install Size](https://packagephobia.com/badge?p=@undercroft/timespan)](https://packagephobia.com/result?p=@undercroft/timespan)
[![codecov](https://codecov.io/gh/undercroftlabs/timespan/graph/badge.svg?token=XLOYLAS2X1)](https://codecov.io/gh/undercroftlabs/timespan)
[![Known Vulnerabilities](https://snyk.io/test/npm/@undercroft/timespan/badge.svg)](https://snyk.io/test/npm/@undercroft/timespan)

# UMD Support

Starting with version 1.1.0, you can use Timespan directly in the browser via the UMD build. All public methods are
supported.

## CDNs

- jsDelivr: `https://cdn.jsdelivr.net/npm/@undercroft/timespan/dist/index.umd.js`
- unpkg: `https://unpkg.com/@undercroft/timespan/dist/index.umd.js`
- Skypack: `https://cdn.skypack.dev/@undercroft/timespan`
- esm.sh: `https://esm.sh/@undercroft/timespan`
- jspm: `https://jspm.dev/@undercroft/timespan`
- esm.run: `https://esm.run/@undercroft/timespan`

# Distribution & Compatibility

- Small bundle footprint (<4kB brotli-compressed)
- Works in Node.js, modern browsers, and bundlers

# Test Coverage & CI

- Full unit test coverage with Vitest
- Automatically tested on Ubuntu and Windows
- Browser distribution tests (UMD and ESM) with Playwright on Chromium, Firefox, and WebKit
- Bundle size tracked via Size Limit
- Code coverage reported via Codecov

See [TESTING.md](https://github.com/undercroftlabs/timespan/blob/main/TESTING.md) for local setup, including Playwright browser install on Linux, and [RELEASE.md](https://github.com/undercroftlabs/timespan/blob/main/RELEASE.md) for tagged npm Trusted Publishing.

# Breaking Changes (as of 1.1.0)

- Removed internal module access — All usage must go through the public Timespan export
- Internal validation and type guards added
- Removed legacy and deprecated utility modules

# Installation

## Usage in NodeJS

```shell
npm install @undercroft/timespan
```

Then use it like this.

```javascript
import { Timespan } from '@undercroft/timespan';
```

## Usage in Browser

```html
<script src="https://cdn.jsdelivr.net/npm/@undercroft/timespan/dist/index.umd.js"></script>
```

Then use it like this.

```html
<script>
  const span = new window.Timespan(new Date(), new Date());
  console.log(span.toMilliseconds());
</script>
```

# Tasks

Each task below has a short example, a playground you can edit, and a demo of the finished pen. The pens use `@undercroft/timespan@1.2.1`.

## Getting started

Create a timespan from two instants and read it back. `toString()` prints the calendar breakdown, so fourteen days is `2w`. `toMilliseconds()` is the exact length. `isZero()` is true when both endpoints are the same instant, and `toString()` is then an empty string.

```javascript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-03-01T00:00:00.000Z');
const end = new Date('2024-03-15T00:00:00.000Z');
const timespan = new Timespan(start, end);

timespan.start.toISOString(); // '2024-03-01T00:00:00.000Z'
timespan.end.toISOString(); // '2024-03-15T00:00:00.000Z'
timespan.toString(); // '2w'
timespan.toTimeframe();
// { years: 0, months: 0, weeks: 2, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
timespan.toMilliseconds(); // 1209600000
timespan.isZero(); // false
Timespan.isZero(timespan); // false
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e09b-ce82-7875-a13c-b162d95bffe3) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e09b-ce82-7875-a13c-b162d95bffe3?panel=false&show=preview)

## Parsing durations

`Timespan.fromString` reads a duration such as `3d 5h 30m`. Values are whole numbers. Units can be short or written out. A capital `M` means months, and `m` means minutes. Pass a start instant when the span should not begin at the current time. Totals such as `toHours()` count whole units, so 3 days, 5 hours, and 30 minutes is 77 hours and 4650 minutes.

```javascript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');
const timespan = Timespan.fromString('3d 5h 30m', start);

timespan.toString(); // '3d 5h 30m'
timespan.toMinutes(); // 4650
timespan.toHours(); // 77

Timespan.fromString('2years 1month 3weeks 4days', start).toString(); // '2y 1M 3w 4d'
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e09c-0e4a-7c2d-9c36-d0ddac4ac7f5) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e09c-0e4a-7c2d-9c36-d0ddac4ac7f5?panel=false&show=preview)

## Building durations

Named factories such as `fromHours` take an amount and an optional start date. The current time is used when the start is omitted. Those factories accept fractions of fixed-length units. `fromUnits` accepts the same amounts, including short names such as `mins`. `fromObject` applies every unit in a timeframe literal. `fromString` accepts integers only, so `1.5h` is rejected there.

```javascript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00.000Z');

Timespan.fromHours(1.5, start).toString(); // '1h 30m'
Timespan.fromUnits(90, 'mins', start).toString(); // '1h 30m'
Timespan.fromMonths(1, new Date('2024-01-31T00:00:00.000Z')).end.toISOString();
// '2024-02-29T00:00:00.000Z'

Timespan.fromObject({ days: 3, hours: 4, minutes: 30 }, start).toString(); // '3d 4h 30m'

Timespan.fromMilliseconds(5000, start);
Timespan.fromSeconds(120, start);
Timespan.fromMinutes(60, start);
Timespan.fromDays(7, start);
Timespan.fromWeeks(4, start);
Timespan.fromYears(2, start);
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e08b-72ca-7f73-b680-da7a353a68f8) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e08b-72ca-7f73-b680-da7a353a68f8?panel=false&show=preview)

## Working with date ranges

Pass the kickoff and the launch to `new Timespan(start, end)`. The start must be the same instant as the end, or earlier. `start` and `end` return those instants. `toString()` prints the calendar breakdown, and the total methods count the whole interval.

```javascript
import { Timespan } from '@undercroft/timespan';

const timespan = new Timespan(
  new Date('2024-01-08T00:00:00.000Z'),
  new Date('2024-06-21T00:00:00.000Z'),
);

timespan.toString(); // '5M 1w 6d'
timespan.toDays(); // 165
timespan.toMonths(); // 5
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e09d-0e43-7c5d-b32e-76e4ddbf02a7) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e09d-0e43-7c5d-b32e-76e4ddbf02a7?panel=false&show=preview)

## Converting units

`toDays()` and the other `to*` methods count the whole span in one unit. `toTimeframe()` splits that same span from the largest unit. Ninety days from 15 January 2024 is 90 total days, and also 2 months, 4 weeks, and 2 days in the breakdown. Totals are whole units. `toUnit` accepts the same names as the factories, including short forms such as `hr`. Months and years follow the calendar from the start instant.

```javascript
import { Timespan } from '@undercroft/timespan';

const timespan = Timespan.fromDays(90, new Date('2024-01-15T00:00:00.000Z'));

timespan.toString(); // '2M 4w 2d'
timespan.toDays(); // 90
timespan.toHours(); // 2160
timespan.toWeeks(); // 12
timespan.toMonths(); // 2
timespan.toUnit('hr'); // 2160
timespan.toTimeframe();
// { years: 0, months: 2, weeks: 4, days: 2, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e099-2028-71e0-8951-1215bde29c44) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e099-2028-71e0-8951-1215bde29c44?panel=false&show=preview)

## Formatting durations

`format` inserts numeric time values into a caller-supplied string. Literal text is copied unchanged, and `%%` is a literal percent. `Timespan.format` calls the instance method.

A directive has the form `%[flags][width][.precision]specifier`. Flags are `0` (zero pad), `-` (left align), `+` (show a plus), and a space (show a leading space). Width is the minimum field length. Precision is the minimum number of digits, except for `%f`, where it is the number of fractional-second digits. The default for `%f` is 3. Values are truncated, not rounded. A width or precision of 1,000,000 or more is rejected. The format string itself has no length limit.

Uppercase specifiers are totals. Lowercase specifiers are the components from `toTimeframe()`.

| Specifier | Meaning                                           |
| --------- | ------------------------------------------------- |
| `%Y` `%y` | Total years, year component                       |
| `%B` `%b` | Total months, month component                     |
| `%W` `%w` | Total weeks, week component                       |
| `%D` `%d` | Total days, day component                         |
| `%H` `%h` | Total hours, hour component                       |
| `%M` `%m` | Total minutes, minute component                   |
| `%S` `%s` | Total seconds, second component                   |
| `%L` `%l` | Total milliseconds, millisecond component         |
| `%f`      | Fractional seconds from the millisecond component |

```javascript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-06-01T00:00:00.000Z');
const timespan = new Timespan(start, new Date(start.getTime() + 1_483_506_123));

timespan.format('%D days'); // '17 days'
timespan.format('Time remaining: %h:%02m:%02s'); // 'Time remaining: 4:05:06'
Timespan.format('%s.%f seconds', timespan); // '6.123 seconds'
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e09b-70c4-7c03-8888-4f4c63a2e2ea) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e09b-70c4-7c03-8888-4f4c63a2e2ea?panel=false&show=preview)

## Comparing durations

`compareTo` orders spans by duration and returns `-1`, `0`, or `1`. `equals` compares duration unless you pass `'range'`, which also requires the same start and end. Two operations can take the same time on different days. Static `Timespan.equals` and `Timespan.compareTo` call the same logic.

```javascript
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
migration.equals(reportExport); // false
Timespan.compareTo(migration, reportExport); // 1

const sameLength = new Timespan(
  new Date('2024-04-01T08:00:00.000Z'),
  new Date('2024-04-01T09:15:00.000Z'),
);

sameLength.equals(reportExport); // true
sameLength.equals(reportExport, 'range'); // false
Timespan.equals(sameLength, reportExport, 'range'); // false
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e097-4a29-718f-8d0d-cfc73999bcf2) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e097-4a29-718f-8d0d-cfc73999bcf2?panel=false&show=preview)

## Saving and restoring

A timespan serializes as a `TimespanJson` object. That type is exported from `@undercroft/timespan`. `$type` is `'Timespan'`, and `start` and `end` are the instants as strings. `toJSON` writes ISO strings and returns a `TimespanJson`. `JSON.stringify` calls `toJSON` automatically. `Timespan.stringify` is `JSON.stringify` for one timespan.

`fromJSON` reads that object and returns a new timespan. `parse` does the same, and only for a JSON document whose root is one timespan. A document whose root is an array, a wrapper object, or any other value is rejected. It does not walk nested values.

Use `JSON.parse(text, Timespan.reviver)` when timespans are nested inside a larger document. The reviver turns each object with `$type: 'Timespan'` into a timespan and leaves every other value unchanged. An object that claims to be a timespan but cannot be reconstructed throws.

`isTimespanJSON` checks the serialized shape: `$type` is `'Timespan'`, and `start` and `end` are strings. It does not parse the dates or compare them, so a true result does not guarantee that `fromJSON` will succeed. A `Timespan` instance returns false until you call `toJSON`.

`fromJSON` and `parse` throw `TypeError` for a value that is not Timespan JSON. They throw if a date string cannot be parsed, or if the start is after the end. `parse` also throws `SyntaxError` when the text is not JSON.

```javascript
import { Timespan } from '@undercroft/timespan';

const timespan = new Timespan(
  new Date('2024-05-01T15:00:00.000Z'),
  new Date('2024-05-03T18:30:00.000Z'),
);

const json = timespan.toJSON();
// {
//   $type: 'Timespan',
//   start: '2024-05-01T15:00:00.000Z',
//   end: '2024-05-03T18:30:00.000Z',
// }

Timespan.isTimespanJSON(json); // true
Timespan.isTimespanJSON(timespan); // false

const restored = Timespan.parse(Timespan.stringify(timespan));
restored.equals(Timespan.fromJSON(json), 'range'); // true

const payload = JSON.parse(
  JSON.stringify({ label: 'on-call shift', span: timespan }),
  Timespan.reviver,
);

payload.label; // 'on-call shift'
payload.span.equals(timespan, 'range'); // true
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e09c-6b7e-7c45-a4dd-986a37a1f97e) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e09c-6b7e-7c45-a4dd-986a37a1f97e?panel=false&show=preview)

## Copying timespans

`clone` returns a new timespan with the same endpoints. `start` and `end` also return new `Date` objects, so changing a date you read does not move the original span or its copy.

```javascript
import { Timespan } from '@undercroft/timespan';

const original = new Timespan(
  new Date('2024-07-01T00:00:00.000Z'),
  new Date('2024-07-10T00:00:00.000Z'),
);
const copy = original.clone();

copy === original; // false
copy.equals(original, 'range'); // true
Timespan.clone(original).equals(original, 'range'); // true

const readStart = original.start;
readStart.setUTCFullYear(1990);
original.start.toISOString(); // '2024-07-01T00:00:00.000Z'
```

[Try the Playground](https://codepen.io/editor/undercroft/pen/01a1e09a-f5f0-723d-a97f-90acc7ffd1bc) · [View the Demo](https://codepen.io/editor/undercroft/pen/01a1e09a-f5f0-723d-a97f-90acc7ffd1bc?panel=false&show=preview)

## Contributing

Contributions to the Timespan class are welcome! If you find any issues or have suggestions for improvements, please
open an issue or submit a pull request on the GitHub repository.

## License

The Timespan class is licensed under the MIT License. See the [LICENSE](https://github.com/undercroftlabs/timespan/blob/main/LICENSE) file for more information.
