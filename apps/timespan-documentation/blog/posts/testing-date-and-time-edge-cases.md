---
title: 'Testing Date and Time Calculations: The Edge Cases Everyone Misses'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Test JavaScript date calculations with Vitest. Cover month ends, leap years, time-zone changes, invalid inputs, and serialization edge cases.'
keywords:
  - JavaScript date testing
  - Date and time edge cases
  - Vitest
  - Calendar arithmetic
  - Leap years
  - Time zones
  - Timespan
  - TypeScript
canonical: /blog/testing-date-and-time-edge-cases
section: Engineering
---

A date library can look correct in happy-path tests while failing on a subscription renewal at the end of February. Ordinary dates don't always exercise the rules that matter.

The most valuable tests often sit at boundaries: just before an anniversary, after a daylight-saving adjustment, at a zero-length interval, or at the highest representable timestamp. These are places where an implementation must make a choice.

Timespan 1.3.0 provides a useful case study. The examples use Vitest and the package's public interface, with snippets designed to fit into one test file.

## Deterministic Tests Start with Explicit Instants

An explicit test anchor makes failures repeatable. If behavior doesn't depend on the current time, using `new Date()` in a fixture adds unnecessary variability. Fixed instants also document assumptions about UTC and local offsets.

```typescript
import { describe, expect, it } from 'vitest';
import { Timespan } from '@undercroft/timespan';

const at = (text: string) => new Date(text);
const anchor = at('2024-01-15T12:00:00Z');

it('counts whole total units', () => {
  const span = Timespan.fromHours(1.5, anchor);
  expect(span.toHours()).toBe(1);
  expect(span.toMinutes()).toBe(90);
});
```

Factories default to the current time when the start is omitted. An explicit anchor makes failures reproducible and avoids needing a fake clock for calculations that don't actually depend on “now.”

Explicit `Z` or numeric offsets also prevent the test runner's local zone from changing the intended instants.

## Test Where Calendar Rules Change

Boundary tests compare inputs on opposite sides of a rule. The instant before a monthly anniversary should behave differently from the anniversary itself, and January 31 should exercise a different path from January 15. Such cases can reveal off-by-one errors that ordinary dates miss.

```typescript
describe('month-end clamping', () => {
  it.each([
    ['2023-01-31T00:00:00Z', '2023-02-28T00:00:00.000Z'],
    ['2024-01-31T00:00:00Z', '2024-02-29T00:00:00.000Z'],
    ['2024-03-31T00:00:00Z', '2024-04-30T00:00:00.000Z'],
  ])('%s moves to %s', (start, expected) => {
    expect(Timespan.fromMonths(1, at(start)).end.toISOString()).toBe(expected);
  });
});

it('waits for the complete anniversary instant', () => {
  expect(new Timespan(anchor, at('2024-02-15T11:59:59.999Z')).toMonths()).toBe(
    0,
  );
  expect(new Timespan(anchor, at('2024-02-15T12:00:00Z')).toMonths()).toBe(1);
});
```

These cases reflect the clamping and anniversary checks exercised in the tagged converter tests. Checking only matching day numbers would miss an off-by-one result just before noon.

Add leap-day year cases too. Gregorian century rules matter: 1900 isn't a leap year, while 2000 is. “Divisible by four” isn't the complete rule.

## Zero and Invalid Inputs Are First-Class Cases

A zero-length interval is not inherently invalid, and a reversed interval is not the same thing as a zero-length interval. Distinguishing these states in tests clarifies the class's contract and prevents a future refactor from accidentally treating them alike.

```typescript
it('allows equal endpoints', () => {
  const zero = new Timespan(anchor, anchor);
  expect(zero.isZero()).toBe(true);
  expect(zero.toString()).toBe('');
});

it('rejects invalid and reversed ranges', () => {
  expect(() => new Timespan(new Date(NaN), anchor)).toThrow();
  expect(() => new Timespan(anchor, at('2024-01-14T12:00:00Z'))).toThrow();
  expect(() => Timespan.fromHours(Infinity, anchor)).toThrow();
});
```

An empty string is the zero span's compact representation. If the interface must display `0s`, add that as a presentation rule and test it separately.

Prefer checking the failure contract over copying exact error text into every test, unless the application intentionally depends on that text.

## Parsing Recovery and Serialization Round Trips

Recovery matters as much as rejection. A parser that throws on invalid input but corrupts shared state may fail on the next valid request. Serialization tests likewise need to check that reconstructed objects have both the right values and their expected methods.

```typescript
it('parses correctly after an earlier failure', () => {
  expect(() => Timespan.fromString('1h 2hours', anchor)).toThrow();
  expect(Timespan.fromString('2h', anchor).toHours()).toBe(2);
});

it('preserves endpoints through nested JSON', () => {
  const span = Timespan.fromHours(2, anchor);
  const restored = JSON.parse(JSON.stringify({ span }), Timespan.reviver);
  expect(restored.span.equals(span, 'range')).toBe(true);
});
```

A parser can pass isolated tests while leaking global regex state between calls. A failure followed by a valid parse checks behavior that a happy-path example doesn't.

Range equality is the right assertion for persistence. Duration equality could pass even if both endpoints moved.

## Timezone and Timestamp Boundaries

A named time zone and a numeric offset are not interchangeable. When testing elapsed instants, explicit offsets prevent the host machine from deciding what the input means. When testing a user's local calendar rules, the test needs to preserve the relevant zone and its transitions.

```typescript
it('rejects addition beyond the Date range', () => {
  const maximum = new Date(8.64e15);
  expect(() => Timespan.fromMilliseconds(1, maximum)).toThrow();
});

it('measures elapsed time across an offset change', () => {
  const span = new Timespan(
    at('2024-03-09T12:00:00-05:00'),
    at('2024-03-10T12:00:00-04:00'),
  );
  expect(span.toHours()).toBe(23);
  expect(span.toDays()).toBe(0);
});
```

The offset example checks elapsed behavior; it doesn't ask Timespan to resolve a named zone. Test local-calendar scheduling in the component responsible for that rule.

Finally, verify defensive copies and run consumer examples against built packages, not only source imports. Boundary, failure, and serialization tests expose bugs that ordinary examples often miss. Distribution tests verify a separate promise: that the package consumers install is usable.

## Sources and Further Reading

- [Month converter tests](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/converters/month-converter.test.ts)
- [Year converter tests](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/converters/year-converter.test.ts)
- [Timespan tests](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.test.ts)
- [Distribution test contract](https://github.com/undercroftlabs/timespan/blob/v1.3.0/tests/bundle-e2e/timespan-contract.ts)
