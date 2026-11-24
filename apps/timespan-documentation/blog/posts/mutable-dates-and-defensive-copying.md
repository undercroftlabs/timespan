---
title: 'The Hidden Danger of Mutable Dates in JavaScript'
date: '2026-11-23'
author: Michael Goodwin
excerpt: "Avoid accidental JavaScript Date mutations. Learn why readonly and Object.freeze aren't enough and how defensive copying protects intervals."
keywords:
  - JavaScript Date mutation
  - Mutable Date objects
  - Defensive copying
  - TypeScript readonly
  - Object.freeze
  - Immutability
  - Timespan
canonical: /blog/mutable-dates-and-defensive-copying
section: Engineering
---

Some date bugs have nothing to do with time zones, leap years, or arithmetic. They occur because two parts of an application share the same mutable object.

A function might accept a `Date` and change it, causing state elsewhere to change without going through its intended update path. The operation is valid, but it violates the caller's expectations about ownership. Because JavaScript shares objects by reference and `Date` has built-in setters, ownership matters when designing APIs, utilities, and stateful applications.

## The Reference You Did Not Mean to Share

This can be particularly confusing in state-management code. A developer may expect a new value to trigger an update, but a mutation of a shared object changes the old value in place. The bug is not necessarily visible at the call site where it occurred.

```javascript
const state = { start: new Date('2024-07-01T00:00:00Z') };
const selected = state.start;
selected.setUTCDate(10);
console.log(state.start.toISOString()); // '2024-07-10T00:00:00.000Z'
console.log(selected === state.start); // true
```

The assignment copied a reference. Both variables point to the same mutable Date.

The same issue can appear inside a helper with a friendly name such as `nextWeek()`. If it uses a setter on its argument, every caller needs to know that the input is consumed or modified.

## Copying Dates Before Mutating Them

Defensive copying means creating a new `Date` from the original timestamp before making changes. Apply that rule consistently: a utility that sometimes returns a copy and sometimes the original reference is hard to reason about, even when its calculations are correct.

```javascript
function sevenDaysLater(start) {
  return new Date(start.getTime() + 7 * 86_400_000);
}

const start = new Date('2024-07-01T00:00:00Z');
const end = sevenDaysLater(start);
console.log(start.toISOString()); // '2024-07-01T00:00:00.000Z'
console.log(end.toISOString()); // '2024-07-08T00:00:00.000Z'
```

This helper returns a new Date. Its definition is seven fixed 24-hour days, which is appropriate only if that matches the requirement.

A shallow object copy doesn't provide the same protection:

```javascript
const first = { start };
const second = { ...first };
console.log(first.start === second.start); // true
```

The outer objects differ, but the nested Date remains shared. Defensive copying needs to reach the mutable value itself.

## Why TypeScript readonly Is Not Deep Immutability

TypeScript's `readonly` prevents reassignment through the type system, but it doesn't freeze the object at runtime or remove setters such as `setUTCDate()`. API boundaries still need an ownership policy:

```typescript
interface Schedule {
  readonly start: Date;
}
const schedule: Schedule = { start: new Date('2024-07-01T00:00:00Z') };
schedule.start.setUTCFullYear(1990); // Allowed: the Date is still mutable.
```

Even `Object.freeze()` doesn't freeze a Date's internal timestamp:

```javascript
const frozen = Object.freeze(new Date('2024-07-01T00:00:00Z'));
frozen.setUTCFullYear(1990);
console.log(frozen.getUTCFullYear()); // 1990
```

Freezing ordinary properties and preventing mutation of a built-in object's internal state are different operations. For a public API, copies or primitive timestamps can provide a clearer ownership boundary.

## How Timespan Protects Its Endpoints

An interval library must protect both construction and reads. Copying input dates prevents callers from changing stored endpoints through the originals, but returning the stored objects would expose them again. The policy must work in both directions.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-07-01T00:00:00Z');
const end = new Date('2024-07-10T00:00:00Z');
const span = new Timespan(start, end);

start.setUTCFullYear(1990);
end.setUTCFullYear(1991);
console.log(span.start.toISOString()); // '2024-07-01T00:00:00.000Z'
console.log(span.end.toISOString()); // '2024-07-10T00:00:00.000Z'
```

The constructor validates and copies both endpoints. Changing the original input objects therefore doesn't invalidate the span's stored breakdown or compact string.

Input copying solves only half the problem, though. Returning an internal Date reference would expose the same mutation path again.

## Defensive Copies Must Work in Both Directions

```typescript
const exposed = span.start;
exposed.setUTCFullYear(1980);
console.log(span.start.toISOString()); // '2024-07-01T00:00:00.000Z'
console.log(span.start === span.start); // false

const frame = span.toTimeframe();
frame.days = 999;
console.log(span.toTimeframe().days); // 2
```

The date getters return fresh objects. `toTimeframe()` returns a shallow copy, which is sufficient for its numeric fields. The nine-day example breaks down as one week and two days, so its day component remains two.

When a separate Timespan instance is useful, `clone()` preserves the range:

```typescript
const copy = span.clone();
console.log(copy === span); // false
console.log(copy.equals(span, 'range')); // true
```

This is defensive copying through the public API, rather than a claim that the entire JavaScript object graph is deeply frozen. Compare Dates by timestamps, and compare spans with the equality mode your application needs.

The practical question is who owns each mutable object. Defensive copying doesn't make an entire system immutable, but copying dates both into and out of an interval gives the API a clear ownership rule and makes behavior less surprising across application layers.

## Sources and Further Reading

- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
- [Timespan v1.3.0 usage guide](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/README.md)
