---
title: 'Formatting Time Intervals in JavaScript: From Date Arithmetic to Timespan'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Learn to calculate and format time intervals in JavaScript, from native date arithmetic to Timespan and locale-aware Intl.DurationFormat.'
keywords:
  - JavaScript duration formatting
  - Time intervals
  - JavaScript date arithmetic
  - Timespan
  - Intl.DurationFormat
  - Calendar arithmetic
  - TypeScript
canonical: /blog/formatting-time-intervals
section: Guides
---

Creating and comparing JavaScript dates is straightforward, and finding the milliseconds between them takes little more than subtraction. Presenting that difference is another matter. You may need days and hours instead of a number, a different format in another application, or calendar-aware results across months and leap years.

JavaScript offers several ways to solve these problems. The challenge is turning the initial calculation into something meaningful and reusable. We'll build a duration formatter with vanilla JavaScript, explore the complications, and compare it with [**@undercroft/timespan**](https://www.npmjs.com/package/@undercroft/timespan).

## Step 1: Calculating the Difference Between Two Dates

Suppose an application needs to calculate how long a process took, using a starting and an ending timestamp.

```javascript
const start = new Date('2026-11-23T08:00:00Z');
const end = new Date('2026-11-23T10:30:00Z');

const milliseconds = end.getTime() - start.getTime();

console.log(milliseconds);
// 9000000
```

A JavaScript `Date` represents a timestamp in milliseconds from the Unix epoch. Subtracting two timestamps gives the elapsed time, but `9000000` isn't very readable. Let's convert it to minutes.

```javascript
const minutes = milliseconds / 1000 / 60;

console.log(minutes);
// 150
```

The process took 150 minutes, but the application might prefer to display two hours and thirty minutes.

### Breaking the Duration into Components

To produce a more readable result, we need to calculate the hours and remaining minutes separately.

```javascript
const totalMinutes = Math.floor(milliseconds / 60000);

const hours = Math.floor(totalMinutes / 60);
const minutes = totalMinutes % 60;

console.log(`${hours}h ${minutes}m`);
// "2h 30m"
```

Division gives us the complete hours; the remainder operator gives us the remaining minutes. This is reasonable for a small application, but we've already moved beyond subtraction to manually decomposing a duration. What happens when we need more units?

## Step 2: Supporting Days, Hours, Minutes, and Seconds

For a task that runs for several days, we can extend the same calculations:

```javascript
const start = new Date('2026-11-01T00:00:00Z');
const end = new Date('2026-11-03T04:05:06Z');

let remaining = end.getTime() - start.getTime();

const days = Math.floor(remaining / 86400000);
remaining %= 86400000;

const hours = Math.floor(remaining / 3600000);
remaining %= 3600000;

const minutes = Math.floor(remaining / 60000);
remaining %= 60000;

const seconds = Math.floor(remaining / 1000);

console.log(`${days}d ${hours}h ${minutes}m ${seconds}s`);
// "2d 4h 5m 6s"
```

This breaks a nonnegative elapsed duration into fixed-length units. But it raises new questions: Should zero-valued units appear? Should labels be abbreviated or written in full? Should numbers be padded? What if another part of the application needs total hours or a different format? We can add conditions, but the small calculation is becoming a formatting system.

### The Timespan Approach

With Timespan, we can represent the interval directly.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2026-11-01T00:00:00Z');
const end = new Date('2026-11-03T04:05:06Z');

const span = new Timespan(start, end);

console.log(span.toString());
// "2d 4h 5m 6s"
```

The library calculates the interval and produces its standard compact representation. If we need the individual components, we can retrieve them as an object.

```typescript
const timeframe = span.toTimeframe();

console.log(timeframe.days); // 2
console.log(timeframe.hours); // 4
console.log(timeframe.minutes); // 5
console.log(timeframe.seconds); // 6
```

And if we need the total elapsed time in a particular unit:

```typescript
console.log(span.toHours()); // 52
console.log(span.toMinutes()); // 3125
console.log(span.toSeconds()); // 187506
```

Timespan distinguishes total elapsed units from components of a calendar-based breakdown. Here, `toHours()` returns 52 complete hours, while `toTimeframe().hours` returns the remaining four-hour component. We can request different representations without repeating the calculations.

## Step 3: Customizing the Output

Our original JavaScript formatter works, but it's tied to one output format. Suppose we're building a dashboard and want to display `52:05:06`: total hours followed by minutes and seconds, rather than days shown separately. Using vanilla JavaScript, we can calculate the values and pad them.

```javascript
const elapsed = end.getTime() - start.getTime();

const totalHours = Math.floor(elapsed / 3600000);
const minutes = Math.floor((elapsed % 3600000) / 60000);
const seconds = Math.floor((elapsed % 60000) / 1000);

const formatted = [
  totalHours,
  String(minutes).padStart(2, '0'),
  String(seconds).padStart(2, '0'),
].join(':');

console.log(formatted);
// "52:05:06"
```

This implementation is reasonable, but another part of the application might need `2 days, 4 hours, 5 minutes`. We'd need another formatter or configurable formatting rules. If multiple components and applications need different formats, those functions begin to accumulate.

### Formatting with Timespan

Beginning with version 1.3.0, Timespan supports custom format strings.

```typescript
const span = new Timespan(start, end);

console.log(span.format('%H:%02m:%02s'));
// "52:05:06"
```

The same interval can be displayed differently without recalculating its components.

```typescript
console.log(span.format('%d days, %h hours, %m minutes'));
// "2 days, 4 hours, 5 minutes"
```

Or we can display just the total elapsed hours:

```typescript
console.log(span.format('%H hours'));
// "52 hours"
```

The format string describes how the duration should be presented, while Timespan handles the underlying calculations.

### Understanding Format Specifiers

Timespan distinguishes totals from components: uppercase specifiers represent total elapsed units, while lowercase specifiers represent the components of a duration breakdown. For example:

```typescript
span.format('%H'); // "52" total hours
span.format('%h'); // "4" remaining hours
```

The supported specifiers are:

| Total | Component | Unit         |
| ----- | --------- | ------------ |
| `%Y`  | `%y`      | Years        |
| `%B`  | `%b`      | Months       |
| `%W`  | `%w`      | Weeks        |
| `%D`  | `%d`      | Days         |
| `%H`  | `%h`      | Hours        |
| `%M`  | `%m`      | Minutes      |
| `%S`  | `%s`      | Seconds      |
| `%L`  | `%l`      | Milliseconds |

The `%f` directive provides fractional seconds using the millisecond component. Format strings also support field widths, zero-padding, alignment, and precision.

```typescript
span.format('%02h:%02m:%02s');
// "04:05:06"
```

This gives us the flexibility of a configurable formatter without having to implement one ourselves.

## Step 4: What About Native JavaScript Formatting?

Modern JavaScript also has a built-in solution for formatting durations: `Intl.DurationFormat` provides locale-aware presentation. For example:

```javascript
const formatter = new Intl.DurationFormat('en-US', {
  style: 'long',
});

const result = formatter.format({
  days: 2,
  hours: 4,
  minutes: 5,
  seconds: 6,
});

console.log(result);
// "2 days, 4 hours, 5 minutes, 6 seconds"
```

This API is useful for localized text and supports different presentation styles for a locale.

### The Remaining Problem

We supplied the duration components ourselves. `Intl.DurationFormat` formats them, but it doesn't calculate the interval between two JavaScript `Date` objects. Starting with dates, we still need to derive the fields. The earlier arithmetic works for fixed-length units; months and years require more care.

The two approaches have different strengths: `Intl.DurationFormat` is designed for locale-sensitive presentation, while Timespan's `format()` provides explicit numeric directives and application-defined layouts. Use `Intl.DurationFormat` when localization is the priority, and Timespan when you want a date-interval abstraction with built-in calculations and predictable custom numeric formatting.

## Step 5: The Calendar Problem

So far, we've used fixed millisecond values for elapsed days, hours, minutes, and seconds. To include months and years, we might be tempted to define a month as thirty days:

```javascript
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
```

Calendars aren't quite that cooperative. February can contain 28 or 29 days, while other months contain 30 or 31 days. Years have similar complications. A fixed millisecond constant cannot accurately describe every interval measured in calendar months or years.

### A Simple Example

Consider two dates:

```javascript
const start = new Date('2024-01-31T00:00:00Z');
const end = new Date('2024-02-29T00:00:00Z');
```

Exactly 29 elapsed days separate these dates, but an application asking how many calendar months have elapsed may expect one month. A billing system, subscription manager, or scheduling application may use calendar anniversaries rather than fixed quantities of elapsed time. Simply dividing milliseconds cannot express that policy.

### Native Calendar Arithmetic

JavaScript provides methods such as `setUTCMonth()` to manipulate calendar fields. We can attempt to add one month to January 31:

```javascript
const date = new Date('2024-01-31T00:00:00Z');

date.setUTCMonth(date.getUTCMonth() + 1);

console.log(date.toISOString());
// "2024-03-02T00:00:00.000Z"
```

Why March 2? February doesn't have a 31st day, so JavaScript normalizes the overflow into the following month. This behavior is documented and consistent, but it may not be what the application expects. To return the last valid day of February, we need to implement that rule ourselves.

### Implementing Month Clamping

One approach is to move to the first day of the target month, determine its final day, and then restore the original day as far as possible.

```javascript
function addMonthsClamped(date, months) {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();

  result.setUTCDate(Math.min(day, lastDay));

  return result;
}

const start = new Date('2024-01-31T00:00:00Z');

console.log(addMonthsClamped(start, 1).toISOString());
// "2024-02-29T00:00:00.000Z"
```

This implements calendar-aware month addition for ordinary dates. Production code still needs to consider invalid dates, accepted numeric inputs, and representable date boundaries. We also haven't implemented year addition, anniversary counting, or decomposition into remaining units. Our formatter is becoming a calendar arithmetic library.

### The Timespan Approach

Timespan includes calendar-aware construction and conversion methods.

```typescript
const start = new Date('2024-01-31T00:00:00Z');

const span = Timespan.fromMonths(1, start);

console.log(span.end.toISOString());
// "2024-02-29T00:00:00.000Z"
```

It also supports the same behavior when parsing a duration string.

```typescript
const span = Timespan.fromString('1M', start);

console.log(span.end.toISOString());
// "2024-02-29T00:00:00.000Z"
```

Both methods use the library's underlying unit converters. This keeps calendar rules consistent across a unit factory, a duration string, and an object:

```typescript
const span = Timespan.fromObject({ months: 1 }, start);
```

Rather than repeatedly implementing date arithmetic, we can express the operation directly.

## Step 6: Combining Calendar Calculations with Formatting

Suppose we're building a project dashboard that shows how long a project has been active in calendar years, months, weeks, and days. Using vanilla JavaScript, we would need to:

1. Validate the starting and ending dates.
2. Determine the number of completed calendar years.
3. Determine the number of completed calendar months.
4. Handle leap years and dates near the end of a month.
5. Calculate the remaining weeks and days.
6. Convert the result into the required display format.

The implementation depends on the calendar rules we choose. We'd also need tests for leap days, month boundaries, time-of-day differences, and unusual date ranges.

### The Timespan Approach

With Timespan, we can construct the interval and request its calendar breakdown directly.

```typescript
const project = new Timespan(
  new Date('2024-01-08T00:00:00Z'),
  new Date('2024-06-21T00:00:00Z'),
);

console.log(project.toString());
// "5M 1w 6d"
```

Or format it for a dashboard.

```typescript
console.log(project.format('%b months, %w weeks, %d days'));
// "5 months, 1 weeks, 6 days"
```

Notice the last output: Timespan's custom formatter substitutes numeric values but doesn't automatically pluralize the surrounding text. For grammatically correct localized output, a separate presentation layer or `Intl.DurationFormat` may still be appropriate. Timespan has already calculated the interval and its components, so we can focus on presenting those values rather than deriving them.

## Step 7: Reusing the Same Interval Across an Application

Our examples now involve calculations, calendar rules, components, totals, and custom presentation. Across a UI, one component might display a compact duration, another a detailed summary, and a third total minutes for a chart. Without a shared abstraction, each may repeat calculations or depend on utility functions. With Timespan, they can use the same interval:

```typescript
const span = new Timespan(
  new Date('2026-11-23T08:00:00Z'),
  new Date('2026-11-23T10:30:00Z'),
);

// Compact display
span.toString(); // "2h 30m"

// Clock-style display
span.format('%02h:%02m:%02s'); // "02:30:00"

// Total elapsed minutes
span.toMinutes(); // 150

// Individual components
span.toTimeframe().minutes; // 30
```

These operations share one consistent representation of the interval, helping application code stay focused on its purpose. A scheduling component shouldn't need to know the intricacies of calendar calculations simply to display an appointment's duration.

## What About Temporal?

JavaScript's newer Temporal API introduces richer primitives for dates, instants, durations, and calendar-aware operations. In environments that support Temporal, for example, you can calculate the difference between two calendar dates with `until()`:

```javascript
const start = Temporal.PlainDate.from('2024-01-31');
const end = Temporal.PlainDate.from('2024-02-29');

const duration = start.until(end, {
  largestUnit: 'month',
});

console.log(duration.months);
// 0
```

This example demonstrates an important detail: calendar arithmetic depends on the operation and its chosen rules. A date difference doesn't necessarily use the same end-of-month policy as adding one clamped month.

Temporal provides explicit APIs for these decisions and addresses many longstanding limitations of JavaScript's `Date` object. It's worth evaluating for applications that need rich time-zone models, precise calendar semantics, or standards-based date and time types. Timespan takes a different approach: it provides a compact abstraction built around `Date`, with duration parsing, calendar calculations, formatting directives, and construction methods. The two approaches aren't mutually exclusive; the choice depends on application complexity, supported runtimes, and the abstractions you need.

## When Should You Use Timespan?

Not every application needs an additional dependency. If you only need to subtract timestamps and display a fixed number of seconds, native JavaScript is probably sufficient. If you already have correctly calculated duration components and only need localized presentation, `Intl.DurationFormat` may be enough.

Timespan is particularly useful when several requirements come together: creating intervals from date endpoints, parsing human-readable durations, calculating calendar-aware components, converting units, and displaying the same interval in multiple formats. It provides a shared API instead of separate helpers for each operation.

| Requirement                | Native JavaScript                   | Timespan                         |
| -------------------------- | ----------------------------------- | -------------------------------- |
| Subtract timestamps        | `getTime()` subtraction             | `toMilliseconds()`               |
| Convert to elapsed units   | Division and rounding               | `toHours()`, `toMinutes()`, etc. |
| Break down durations       | Manual arithmetic                   | `toTimeframe()`                  |
| Compact duration strings   | Custom formatter                    | `toString()`                     |
| Custom numeric layouts     | Templates and padding logic         | `format()`                       |
| Calendar month addition    | Date arithmetic with explicit rules | `fromMonths()`                   |
| Parse duration strings     | Custom parsing logic                | `fromString()`                   |
| Construct from unit values | Custom helper or date operations    | `fromObject()`                   |

The value isn't that any individual operation is impossible with vanilla JavaScript; it's that these operations are available through a consistent, reusable interface.

## Getting Started with Timespan

Timespan is available on npm.

```shell
npm install @undercroft/timespan
```

Then import the library into a JavaScript or TypeScript application.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2026-11-23T08:00:00Z');
const end = new Date('2026-11-23T10:30:00Z');

const span = new Timespan(start, end);

console.log(span.toString());
// "2h 30m"

console.log(span.format('%H:%02m:%02s'));
// "2:30:00"

console.log(span.toMinutes());
// 150
```

The library also provides a UMD distribution for projects that don't use a JavaScript bundler.

## Final Thoughts

A basic duration formatter may need only subtraction, division, and a template string. Complexity grows with multiple units, output formats, calendar rules, validation, and consistency across an application. Each requirement is manageable, but together they can produce a large collection of utilities.

Modern APIs such as `Intl.DurationFormat` and Temporal improve the foundations for formatting and calendar arithmetic. Timespan builds on the familiar `Date` model for common interval operations.

**The goal isn't to replace JavaScript's date APIs. It's to make working with them easier.** A useful abstraction can save you from implementing the same calculation repeatedly.

### Explore Timespan

- [Install Timespan on npm](https://www.npmjs.com/package/@undercroft/timespan)
- [View the source code on GitHub](https://github.com/undercroftlabs/timespan)
- [Try the Duration Formatting Playground](https://codepen.io/editor/undercroft/pen/01a1e09b-70c4-7c03-8888-4f4c63a2e2ea)
- [Explore the 1.3.0 source](https://github.com/undercroftlabs/timespan/tree/v1.3.0)
- [Report an issue or suggest an improvement](https://github.com/undercroftlabs/timespan/issues)
