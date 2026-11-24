---
title: 'The Difference Between a Duration and a Date Interval'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Understand durations vs. date intervals in JavaScript, why calendar months need context, and how Timespan compares elapsed lengths and ranges.'
keywords:
  - Duration vs date interval
  - JavaScript durations
  - Time intervals
  - Calendar arithmetic
  - Elapsed time
  - Timespan
  - TypeScript
canonical: /blog/duration-vs-date-interval
section: Guides
---

“Thirty days” and “January 1 through January 31” can describe the same stretch of time, but they convey different information. The first is an amount; the second places it on a timeline. That distinction matters as requirements grow: a timeout needs an elapsed duration, a subscription may depend on calendar months, and a reservation needs exact endpoints. Storing only one representation can discard information a later feature needs. Timespan takes an endpoint-centered approach: even when created from a duration string or unit amount, an interval has a definite start and end. The examples use version 1.3.0.

## Elapsed Time Without Calendar Context

For a process that runs for ninety minutes, a number is often enough:

```javascript
const milliseconds = 90 * 60 * 1000;
console.log(milliseconds); // 5400000
```

That amount represents elapsed time, regardless of the months involved. A subscription lasting one month is different: using `30 * 24 * 60 * 60 * 1000` defines a month as thirty fixed days, which may not match the contract.

## Why Calendar Durations Need an Anchor

A calendar operation is different from a fixed measurement. “One month” can describe a contractual relationship between dates rather than a fixed number of milliseconds. It needs an anchor: January 1 to February 1 and February 1 to March 1 are each one calendar month, but their elapsed lengths differ.

```javascript
const january =
  new Date('2024-02-01T00:00:00Z').getTime() -
  new Date('2024-01-01T00:00:00Z').getTime();
const february =
  new Date('2024-03-01T00:00:00Z').getTime() -
  new Date('2024-02-01T00:00:00Z').getTime();
console.log(january / 86_400_000); // 31
console.log(february / 86_400_000); // 29
```

The year matters too: 2024 is a leap year. Without additional context and an arithmetic policy, “one month” doesn't determine a millisecond total.

## Representing an Interval with Timespan

Preserving the anchor makes comparisons clearer. Two intervals can each represent a completed month while differing in elapsed milliseconds: calendar equivalence and elapsed-duration equivalence are not the same. Timespan keeps a start and end even when an interval is created through a duration factory:

```typescript
import { Timespan } from '@undercroft/timespan';

const january = Timespan.fromMonths(1, new Date('2024-01-01T00:00:00Z'));
const february = Timespan.fromMonths(1, new Date('2024-02-01T00:00:00Z'));
console.log(january.toMonths()); // 1
console.log(february.toMonths()); // 1
console.log(january.toDays()); // 31
console.log(february.toDays()); // 29
console.log(january.compareTo(february)); // 1
```

`compareTo()` compares elapsed milliseconds; it doesn't treat every span described as “one month” as equal. Providing a start date also makes examples and tests deterministic. Omitting it uses the current time, a useful default for some interfaces, but a hidden dependency in reproducible calculations.

## Totals and Calendar Components Answer Different Questions

A UI might show a total (“51 hours elapsed”) or a breakdown (“2 days, 3 hours”). The total supports aggregation; the breakdown helps explain the duration. Choose based on what the user needs. For an interval of two days and three hours:

```typescript
const span = Timespan.fromHours(51, new Date('2024-01-01T00:00:00Z'));
console.log(span.toHours()); // 51
console.log(span.toTimeframe().days); // 2
console.log(span.toTimeframe().hours); // 3
console.log(span.format('%H hours; component %h')); // '51 hours; component 3'
```

The total answers a measurement question. The components provide a breakdown, from larger calendar units through weeks, days, and smaller units. Longer intervals may include months, so the breakdown shouldn't be treated as a context-free set of fixed multipliers. If an API needs the exact elapsed length, transmit the milliseconds or the endpoints.

## When Equal Durations Are Not the Same Interval

An explicit comparison mode requires us to decide what equality means. The same principle applies to data modeling: preserve endpoints when identity and placement matter, and elapsed quantities when only magnitude matters. Two jobs, for example, can take the same amount of time on different days:

```typescript
const first = Timespan.fromHours(2, new Date('2024-01-01T09:00:00Z'));
const second = Timespan.fromHours(2, new Date('2024-01-02T09:00:00Z'));
console.log(first.equals(second)); // true
console.log(first.equals(second, 'range')); // false
```

By default, equality compares duration. Range equality requires matching endpoints. This matters when writing assertions or deciding whether a cached result can be reused: equal processing time doesn't mean the same reservation or reporting window. Timespan v1.3.0 doesn't provide overlap or containment methods. If a future requirement involves intersecting reservations, define those operations separately, including whether interval boundaries are inclusive.

Preserve the information your application needs: a fixed amount for a timeout, calendar units and context for a calendar rule, and endpoints when an interval's position matters. Durations tell us how much time; intervals tell us where it belongs. Keeping those concepts distinct makes conversions, comparisons, and persistence more reliable as requirements grow.

## Sources and Further Reading

- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
- [Timespan v1.3.0 usage guide](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/README.md)
