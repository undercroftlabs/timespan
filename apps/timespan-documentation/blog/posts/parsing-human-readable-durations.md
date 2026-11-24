---
title: 'Parsing Human-Readable Durations in JavaScript'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Parse human-readable durations in JavaScript with a strict parser. Explore regex pitfalls, input validation, and Timespan.fromString().'
keywords:
  - JavaScript duration parser
  - Parse duration strings
  - Human-readable durations
  - Regular expressions
  - Input validation
  - Timespan.fromString
  - TypeScript
canonical: /blog/parsing-human-readable-durations
section: Guides
---

A duration like `3d 5h 30m` is short, readable, and easier to enter than a large millisecond value. But that convenience depends on a small language the application must interpret.

A parser prototype might start with a regular expression. A production parser must also decide which aliases are valid, whether units can repeat, whether fractions are accepted, and what happens when only part of the input matches. Parsing means defining which strings have meaning and rejecting the rest. Timespan 1.3.0 makes those rules explicit.

## Recognizing Duration Tokens Is the Easy Part

A regular expression can find valid-looking tokens inside invalid text. That's useful for search but dangerous when parsing configuration or user input: accepting a substring as the whole duration can produce a successful calculation with the wrong result.

A regular expression can find a number followed by a unit:

```javascript
console.log(
  [...'3d 5h 30m'.matchAll(/(\d+)(d|h|m)/g)].map((match) => [
    Number(match[1]),
    match[2],
  ]),
);
// [[3, 'd'], [5, 'h'], [30, 'm']]
```

This recognizes tokens, but it doesn't validate the whole input. The same pattern can extract `5h` from a string containing unrelated text.

A parser must establish that every non-whitespace character belongs to the grammar. Otherwise it can silently accept a partial match.

## A Parser Must Account for Every Character

Define the accepted language before calculating. A parser that consumes valid tokens and checks for leftover characters gives users a clearer contract than one that silently skips unfamiliar input.

Here's a small fixed-unit parser. Its grammar allows lowercase `d`, `h`, and `m`, whole nonnegative values, and whitespace between tokens. It deliberately excludes calendar months and years.

```javascript
function parseFixedDuration(input) {
  if (typeof input !== 'string' || input.length > 75) {
    throw new Error('Invalid input');
  }
  const text = input.replace(/\s+/g, '');
  const token = /(\d+)(d|h|m)/gy;
  const factors = { d: 86_400_000, h: 3_600_000, m: 60_000 };
  const seen = new Set();
  let cursor = 0;
  let total = 0;

  while (cursor < text.length) {
    token.lastIndex = cursor;
    const match = token.exec(text);
    if (!match || seen.has(match[2])) throw new Error('Invalid token');
    seen.add(match[2]);
    const value = Number(match[1]);
    if (!Number.isSafeInteger(value)) throw new Error('Value too large');
    total += value * factors[match[2]];
    if (!Number.isSafeInteger(total)) throw new Error('Duration too large');
    cursor = token.lastIndex;
  }
  if (seen.size === 0) throw new Error('Empty duration');
  return total;
}

console.log(parseFixedDuration('3d 5h 30m') / 60_000); // 4650
```

The sticky flag requires a match at the current position. The set rejects duplicate units. We also check numeric bounds rather than treating every digit string as a safely represented integer.

Whitespace removal is a grammar decision: this helper also accepts spaces between a number and its unit. A different interface could require those characters to be adjacent.

## Small Grammars Become Substantial APIs

The implementation grows with the grammar. Month aliases introduce a case distinction between `M` and `m`; duplicate detection requires canonicalizing aliases; and a global regular expression requires care with mutable `lastIndex`. Each feature is small until it interacts with the others.

Supporting `hour`, `hours`, and `hr` introduces aliases. Duplicate detection must then treat `1h 2hours` as a repeated canonical unit, not two unrelated labels.

Supporting `M` for months adds calendar context. Supporting decimal values adds another policy. Supporting user-friendly error messages adds an application concern beyond tokenization.

Global and sticky regexes also carry mutable `lastIndex` state. Reusing one shared instance across calls can make a failure affect the next parse if the parser throws before resetting it. Creating the regex inside the function, as above, isolates that state.

## Parsing Durations with Timespan

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-15T09:00:00Z');
const span = Timespan.fromString('3d 5h 30m', start);
console.log(span.toString()); // '3d 5h 30m'
console.log(span.toHours()); // 77
console.log(span.toMinutes()); // 4650
console.log(Timespan.fromString('2years 1month', start).toString()); // '2y 1M'
```

The parser accepts whole-number values and supported unit aliases. Case matters: `M` means months, while `m` means minutes. It applies units in a canonical order from years down to milliseconds, using calendar clamping for years and months.

Version 1.3.0 checks allowed characters, limits input to 75 characters, detects repeated canonical units, verifies complete consumption, and clones its regex per call.

## Why Explicit Rejection Is Part of Good Design

A clear failure is often the most helpful result a parser can produce. If the interface accepts only integer components, a rejected fractional token should point the caller toward a unit factory rather than being silently rounded or ignored. That boundary is what makes human-friendly input safe to automate.

These inputs are rejected:

```typescript
for (const input of ['1.5h', '1h 2hours', 'h', '3d later']) {
  try {
    Timespan.fromString(input, start);
  } catch {
    console.log(`Cannot parse: ${input}`);
  }
}
```

For a fractional fixed unit, use a numeric factory instead:

```typescript
console.log(Timespan.fromHours(1.5, start).toString()); // '1h 30m'
```

Timespan parses a compact duration grammar, not arbitrary natural language. An interface promising “next Friday after lunch” needs a different parser and additional rules.

Choose a small grammar, explain it beside the input, and make failure visible. Clear tokens, whole-input validation, and explicit errors make a friendly string dependable without requiring the parser to accept every imaginable phrase.

## Sources and Further Reading

- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
- [Parser limits and patterns](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/constants.ts)
