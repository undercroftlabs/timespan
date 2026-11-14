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

```angular2html

<script src="https://cdn.jsdelivr.net/npm/@undercroft/timespan/dist/index.umd.js"></script>
```

Then use it like this.

```html
<script>
  const span = new window.Timespan(new Date(), new Date());
  console.log(span.toMilliseconds());
</script>
```

# Creating Timespans

To create a `Timespan` object, we can use the `fromString` method or directly instantiate it with start and end dates.

# Creating a Timespan from a String

```javascript
import { Timespan } from '@undercroft/timespan';

const input = '3d 5h 30m'; // Example input string representing a timespan
const timespan = Timespan.fromString(input);

console.log(timespan.toString()); // Output: '3d 5h 30m'
console.log(timespan.toHours()); // Output: 77.5
```

In the example above, we create a `Timespan` object from an input string using the `fromString` method. The input string
specifies a timespan of 3 days, 5 hours, and 30 minutes. We then output the string representation of the timespan using
`toString()` and calculate the total duration in hours using `toHours()`.

# Creating a Timespan with Start and End Dates

```javascript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-01-01');
const end = new Date('2023-01-15');
const timespan = new Timespan(start, end);

console.log(timespan.toDays()); // Output: 14
```

In this example, we create a `Timespan` object by providing the start and end dates directly. We then calculate the
total duration in days using `toDays()`.

# Retrieving Timespan Information

The Timespan class provides various methods to retrieve information about a timespan.

```js
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-01-01');
const end = new Date('2023-01-15');
const timespan = new Timespan(start, end);

// Output: 2023-01-01T00:00:00.000Z
console.log(timespan.start);

// Output: 2023-01-15T00:00:00.000Z
console.log(timespan.end);

// Output: { years: 0, months: 0, weeks: 2, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
console.log(timespan.toTimeframe());

// Output: 1209600000
console.log(timespan.toMilliseconds());
```

In the example above, we retrieve the start and end dates of the timespan using the start and end properties. We also
obtain the timespan represented as a TimeFrame object using `toTimeframe()`, which provides the individual components of
the timespan such as years, months, weeks, days, hours, minutes, seconds, and milliseconds. Lastly, we calculate the
total duration in milliseconds using `toMilliseconds()`.

# Converting Timespans

The Timespan class provides convenient methods to convert a timespan to different units of time.

```js
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-01-01');
const end = new Date('2023-01-15');
const timespan = new Timespan(start, end);

console.log(timespan.toHours()); // Output: 336
console.log(timespan.toWeeks()); // Output: 2
console.log(timespan.toMonths()); // Output: 0
console.log(timespan.toYears()); // Output: 0
```

In this example, we convert the timespan to various units such as hours, weeks, months, and years using the respective
conversion methods.

# More Examples of Creating TimeSpans

You can create a Timespan object using the static factory methods on the class. Each factory takes an amount and an
optional start date (the current date is used when omitted).

```js
import { Timespan } from '@undercroft/timespan';

Timespan.fromMilliseconds(5000);
Timespan.fromSeconds(120);
Timespan.fromMinutes(60);
Timespan.fromHours(24);
Timespan.fromDays(7);
Timespan.fromWeeks(4);
Timespan.fromMonths(6);
Timespan.fromYears(2);
Timespan.fromUnits(90, 'minutes');
```

`fromString` accepts integer unit values only (for example `3d 5h 30m`). Repeated units and fractional values such as
`1.5h` throw; use a factory like `fromHours` for fractions of fixed-length units.

# Comparing Timespans

Use `equals` and `compareTo` to compare timespans. There are no `add` or `subtract` methods.

`equals` defaults to comparing total duration. Pass `'range'` to compare start and end instants instead.
`compareTo` orders by duration and returns `-1`, `0`, or `1`. Static wrappers `Timespan.equals` and `Timespan.compareTo`
call the same logic.

```js
import { Timespan } from '@undercroft/timespan';

const timespan1 = Timespan.fromHours(12);
const timespan2 = Timespan.fromDays(2);

const areEqual = timespan1.equals(timespan2);
const sameDuration = Timespan.fromHours(24).equals(Timespan.fromDays(1));
const sameRange = timespan1.equals(timespan2, 'range');
const comparisonResult = timespan1.compareTo(timespan2);

Timespan.equals(timespan1, timespan2);
Timespan.compareTo(timespan1, timespan2);
```

# Formatting a Timespan

`format` inserts numeric time values into a caller-supplied string. Literal text is copied unchanged, and `%%` is a literal percent. `Timespan.format` calls the instance method.

A directive has the form `%[flags][width][.precision]specifier`. Flags are `0` (zero pad), `-` (left align), `+` (show a plus), and a space (show a leading space). Width is the minimum field length. Precision is the minimum number of digits, except for `%f`, where it is the number of fractional-second digits. The default for `%f` is 3. Values are truncated, not rounded. The format string can be at most 75 characters, and a width or precision of 1,000,000 or more is rejected.

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

```js
import { Timespan } from '@undercroft/timespan';

const start = new Date('2023-06-01T00:00:00.000Z');
const timespan = new Timespan(start, new Date(start.getTime() + 1_483_506_123));

timespan.format('%D days'); // '17 days'
timespan.format('Time remaining: %h:%02m:%02s'); // 'Time remaining: 4:05:06'
Timespan.format('%s.%f seconds', timespan); // '6.123 seconds'
```

# JSON

A timespan serializes as an object with `$type` set to `'Timespan'` and `start` and `end` set to ISO strings. `toJSON` returns that object, and `JSON.stringify` calls it automatically. `Timespan.stringify` is `JSON.stringify` for one timespan.

`fromJSON` reads that object and returns a new timespan. `parse` does the same, and only for a JSON document whose root is one timespan. A document whose root is an array, a wrapper object, or any other value is rejected. It does not walk nested values.

Use `JSON.parse(text, Timespan.reviver)` when timespans are nested inside a larger document. The reviver turns each object with `$type: 'Timespan'` into a timespan and leaves every other value unchanged. An object that claims to be a timespan but cannot be reconstructed throws.

`isTimespanJSON` checks the serialized shape: `$type` is `'Timespan'`, and `start` and `end` are strings. It does not parse the dates or compare them, so a true result does not guarantee that `fromJSON` will succeed. A `Timespan` instance returns false until you call `toJSON`.

`fromJSON` and `parse` throw `TypeError` for a value that is not Timespan JSON. They throw if a date string cannot be parsed, or if the start is after the end. `parse` also throws `SyntaxError` when the text is not JSON.

```js
import { Timespan } from '@undercroft/timespan';

const timespan = new Timespan(
  new Date('2023-01-01T00:00:00.000Z'),
  new Date('2023-01-15T00:00:00.000Z'),
);

timespan.toJSON();
// {
//   $type: 'Timespan',
//   start: '2023-01-01T00:00:00.000Z',
//   end: '2023-01-15T00:00:00.000Z',
// }

const text = Timespan.stringify(timespan);
const restored = Timespan.parse(text);

const payload = JSON.parse(
  JSON.stringify({ label: 'kept', span: timespan }),
  Timespan.reviver,
);

Timespan.isTimespanJSON(timespan.toJSON()); // true
Timespan.isTimespanJSON(timespan); // false
```

Please refer to the source code for more details on the available methods and their usage.

## Contributing

Contributions to the Timespan class are welcome! If you find any issues or have suggestions for improvements, please
open an issue or submit a pull request on the GitHub repository.

## License

The Timespan class is licensed under the MIT License. See the [LICENSE](https://github.com/undercroftlabs/timespan/blob/main/LICENSE) file for more information.
