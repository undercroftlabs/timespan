---
title: 'Why Is Working with Dates in JavaScript So Difficult?'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Why are JavaScript dates so tricky? Explore time zones, daylight saving, calendar arithmetic, and where Timespan helps with intervals.'
keywords:
  - JavaScript dates
  - JavaScript date arithmetic
  - Time zones
  - Daylight saving time
  - Calendar arithmetic
  - Time intervals
  - Timespan
  - TypeScript
canonical: /blog/why-javascript-dates-are-difficult
section: Guides
---

A task begins at nine and finishes at eleven. For a stopwatch-style question, JavaScript can subtract the timestamps and convert the result to elapsed hours.

Software rarely stops there. A scheduler may need the number of _calendar days_ between appointments, a subscription may need the date one month after renewal, and a report may need elapsed hours across a clock change. These questions involve different rules.

The difficulty isn't a lack of date arithmetic. It's that `Date` is often asked to represent timestamps, local dates, calendar rules, and business expectations. Identifying which one a requirement needs is the first step toward trustworthy code. The examples use `@undercroft/timespan@1.3.0`.

## Two Timestamps, One Simple Answer

A `Date` stores a timestamp. Its local and UTC methods provide different views of that same instant.

```javascript
const start = new Date('2024-03-01T09:00:00Z');
const end = new Date('2024-03-01T11:30:00Z');
const elapsed = end.getTime() - start.getTime();
console.log(elapsed / 3_600_000); // 2.5
```

This is enough for an elapsed-hours calculation. We used explicit UTC strings, so another computer interprets the endpoints as the same instants.

But a timestamp doesn't carry the original time zone or explain what the application means by a day. Those decisions still belong to us.

## When a Calendar Day Is Not Twenty-Four Hours

Both calendar and elapsed-time answers can be valid. A shift from noon Saturday to noon Sunday crosses one calendar date boundary, even if less than 24 hours elapse. A hotel may charge for a night, while a meter records elapsed seconds; neither should silently inherit the other's definition. Date bugs can become business-rule bugs when the arithmetic is correct but measures the wrong unit.

Consider these two local noon timestamps on consecutive dates around New York's spring clock change:

```javascript
const before = new Date('2024-03-09T12:00:00-05:00');
const after = new Date('2024-03-10T12:00:00-04:00');
console.log((after.getTime() - before.getTime()) / 3_600_000); // 23
```

The offsets make this example independent of the machine's local zone. The dates are one local calendar day apart, but the elapsed duration is 23 hours.

Dividing by 86,400,000 answers “how many 24-hour periods?” It doesn't count local calendar days. A booking system and a stopwatch can therefore need different answers for the same endpoints.

## Why Months Refuse to Behave Like Fixed Units

Months expose the limits of fixed-unit arithmetic. February and March have different lengths, and February changes in leap years. An average month length may work for an estimate, but it can't implement a renewal on the same day of the following month. A calendar rule must specify what happens when that date doesn't exist.

Even a native calendar setter needs a policy:

```javascript
const renewal = new Date('2023-01-31T00:00:00Z');
renewal.setUTCMonth(renewal.getUTCMonth() + 1);
console.log(renewal.toISOString()); // '2023-03-03T00:00:00.000Z'
```

JavaScript normalizes the overflow. An application might instead want February 28. Neither result can be chosen by multiplying a month by a universal number of milliseconds.

Now our small helper needs validation, a month-end rule, and a distinction between totals and calendar components.

## Working with Explicit Intervals in Timespan

An interval abstraction keeps endpoints and calculations together. It doesn't decide what a day or month means, but it can keep the chosen arithmetic consistent across components. A report and a dashboard can query the same interval without each recreating the math.

Install the version used here:

```shell
npm install @undercroft/timespan@1.3.0
```

Then let the interval object handle its own conversions:

```typescript
import { Timespan } from '@undercroft/timespan';

const span = new Timespan(
  new Date('2024-03-01T09:00:00Z'),
  new Date('2024-03-01T11:30:00Z'),
);
console.log(span.toString()); // '2h 30m'
console.log(span.toHours()); // 2
console.log(span.toMinutes()); // 150
console.log(span.toMilliseconds() / 3_600_000); // 2.5
```

The total methods count complete units. `toHours()` truncates rather than returning fractional hours. When fractions matter, use the exact elapsed milliseconds and divide explicitly.

Month factories apply UTC calendar arithmetic with clamping:

```typescript
const renewal = Timespan.fromMonths(1, new Date('2023-01-31T00:00:00Z'));
console.log(renewal.end.toISOString()); // '2023-02-28T00:00:00.000Z'
console.log(renewal.toMonths()); // 1
console.log(renewal.toDays()); // 28
```

The constructor also rejects invalid dates and reversed endpoints while allowing equal endpoints.

## Understanding What the Application Really Means

It's tempting to ask a library to make dates simple in every context. A more useful expectation is that it makes a clearly defined class of date problems easier and more consistent. Named time zones, wall-clock recurrences, and exact elapsed intervals remain distinct concepts even when an API makes them convenient to manipulate.

Timespan simplifies interval calculations; it doesn't store an IANA time zone or turn a fixed day into a local calendar day. Its days are 24-hour units, and its month and year calculations use UTC calendar fields.

For “tomorrow at noon in New York,” use a model that retains the zone, such as `Temporal.ZonedDateTime` in an environment with Temporal support. For “how long between these two resolved instants?”, timestamp subtraction or Timespan can be appropriate.

Start with a clear question: does the requirement describe elapsed time, a UTC calendar operation, or a local wall-clock rule? Once the units, policy, and endpoints are explicit, the implementation is easier to trust. Timespan can reduce repeated interval calculations, while zone-aware scheduling still needs a zone-aware model.

## Sources and Further Reading

- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
- [Month converter and clamping rules](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/converters/month-converter.ts)
- [Temporal types and time zones](https://tc39.es/proposal-temporal/docs/)
