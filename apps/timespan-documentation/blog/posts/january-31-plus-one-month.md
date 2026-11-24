---
title: 'January 31 + One Month: The Problem with Calendar Arithmetic'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'What is January 31 plus one month? Explore JavaScript Date rollover, month-end clamping, and recurring schedule rules with Timespan.'
keywords:
  - JavaScript add one month
  - Calendar arithmetic
  - Month-end clamping
  - JavaScript Date rollover
  - Recurring schedules
  - Leap years
  - Timespan
  - TypeScript
canonical: /blog/january-31-plus-one-month
section: Guides
---

Imagine a customer signing up for a monthly service on January 31. What should their next renewal date be? February 28 is an intuitive answer in a non-leap year, but it isn't the only possible answer. An application could roll into March, refuse to construct the date, or preserve an end-of-month subscription rule.

An implementation can't choose correctly until the product makes the policy explicit. JavaScript's native setters have well-defined normalization behavior, but it may not match the business rule.

Let's examine the tension between calendar arithmetic and elapsed time through a concrete month-end example, then see what Timespan 1.3.0 handles and what an application must still decide for itself.

## The Surprising Result of Native Month Addition

The native setter attempts to preserve the day of the month. If the target month has no such day, the date rolls forward. This behavior is consistent, but it may not be appropriate for subscriptions or reporting.

```javascript
const date = new Date('2023-01-31T10:00:00Z');
date.setUTCMonth(date.getUTCMonth() + 1);
console.log(date.toISOString()); // '2023-03-03T10:00:00.000Z'
```

`setUTCMonth()` retains the day number while changing the month. February 31 doesn't exist, so the overflow carries into March.

UTC avoids the host machine's time zone, but it doesn't change this normalization rule. Switching from a local setter to its UTC counterpart doesn't automatically implement clamping.

## Defining a Clamping Policy

A clamping helper requires more than a one-line calculation. We must decide which inputs to accept, whether to mutate the original date, how to handle the time of day, and what to do at the representable limits of `Date`. These policies are easy to overlook in a quick review.

For ordinary application dates, we can move to the first day before changing the month, find the destination month's last day, and restore the smaller day number:

```javascript
function addMonthsClampedUTC(start, months) {
  if (!Number.isFinite(start.getTime())) throw new Error('Invalid date');
  if (!Number.isInteger(months) || months < 0)
    throw new Error('Invalid months');

  const result = new Date(start.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const last = new Date(result.getTime());
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  if (!Number.isFinite(last.getTime())) throw new Error('Date out of range');

  result.setUTCDate(Math.min(day, last.getUTCDate()));
  if (!Number.isFinite(result.getTime())) throw new Error('Date out of range');
  return result;
}

console.log(
  addMonthsClampedUTC(new Date('2023-01-31T10:00:00Z'), 1).toISOString(),
);
// '2023-02-28T10:00:00.000Z'
```

The helper copies the input, preserving the original. It also preserves its UTC time of day.

This is a deliberately narrow helper: nonnegative whole months and ordinary dates. Its last-day lookup can reject dates near the maximum representable timestamp because it briefly visits the next month. A general library must handle those boundaries without relying on an out-of-range intermediate date.

## Calendar-Aware Construction with Timespan

A tested date abstraction can apply the same calendar rule across entry points. The benefit isn't that clamping is impossible to implement; it's that a parsed duration and a unit factory won't quietly disagree about the meaning of a month.

```typescript
import { Timespan } from '@undercroft/timespan';

const ordinary = Timespan.fromMonths(1, new Date('2023-01-31T10:00:00Z'));
const leap = Timespan.fromMonths(1, new Date('2024-01-31T10:00:00Z'));
console.log(ordinary.end.toISOString()); // '2023-02-28T10:00:00.000Z'
console.log(leap.end.toISOString()); // '2024-02-29T10:00:00.000Z'
console.log(leap.toMonths()); // 1
console.log(leap.toDays()); // 29
```

Timespan's month converter uses UTC calendar fields and the target month's Gregorian length. Its year converter also clamps February 29 to February 28 when the target year isn't a leap year.

The same converter rules are used when applying calendar units through `fromString()` and `fromObject()`.

## A Month Has an Anniversary, Not Just a Day Number

A full month hasn't elapsed merely because the day numbers match:

```typescript
const start = new Date('2024-01-15T12:00:00Z');
const early = new Timespan(start, new Date('2024-02-15T11:00:00Z'));
const landed = new Timespan(start, new Date('2024-02-15T12:00:00Z'));
console.log(early.toMonths()); // 0
console.log(landed.toMonths()); // 1
```

Version 1.3.0 checks whether the clamped anniversary has actually landed by the endpoint. This prevents a calendar field comparison from counting a month an hour too soon.

## Why Recurring Schedules Still Need Their Own Rules

Calculating one occurrence is different from representing an ongoing recurrence. Once January 31 is clamped to February 28, using that adjusted date as the next anchor loses the original desired day. Repeated additions can drift, and date arithmetic can't recover a business rule that was never stored:

```typescript
const anchor = new Date('2023-01-31T00:00:00Z');
const february = Timespan.fromMonths(1, anchor).end;
const chainedMarch = Timespan.fromMonths(1, february).end;
const anchoredMarch = Timespan.fromMonths(2, anchor).end;
console.log(chainedMarch.toISOString()); // '2023-03-28T00:00:00.000Z'
console.log(anchoredMarch.toISOString()); // '2023-03-31T00:00:00.000Z'
```

For “the 31st, or the last available day,” calculate each occurrence from the original anchor. For “always the final day of the month,” store that rule explicitly; clamping from February 28 doesn't imply March 31.

Timespan supplies a calendar operation, but a recurring billing schedule must preserve the business rule behind it. The difficult part of “next month” isn't the setter call; it's deciding and retaining the intended policy. Keeping those responsibilities separate makes the result predictable.

## Sources and Further Reading

- [Month converter and clamping rules](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/converters/month-converter.ts)
- [Year converter](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/converters/year-converter.ts)
- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
