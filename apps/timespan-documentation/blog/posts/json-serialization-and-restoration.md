---
title: "Why JSON.stringify Doesn't Preserve Your JavaScript Objects"
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'See why JSON.stringify loses Date and class behavior, then learn to restore JavaScript objects and Timespan intervals with JSON revivers.'
keywords:
  - JSON.stringify
  - JavaScript JSON serialization
  - JSON reviver
  - JavaScript Date serialization
  - Class instances
  - Timespan
  - TypeScript
canonical: /blog/json-serialization-and-restoration
section: Guides
---

Serialization seems symmetrical: turn an object into JSON, store or transmit it, and parse it later. But the result isn't necessarily equivalent to the original. JSON doesn't preserve JavaScript prototypes, methods, or application-specific classes. For example, a `Date` becomes an ISO string, and parsing leaves it as a string.

That's not a defect in JSON. It means persistence needs a data contract and a reconstruction step, not just `JSON.stringify()`. Timespan 1.3.0 provides a practical example.

## JSON Preserves Data, Not Object Behavior

A TypeScript assertion can tell the compiler that a parsed property is a `Date`, but it won't give the runtime value a Date prototype. A successful round trip requires reconstruction, ideally where external data enters the application.

```javascript
const original = { createdAt: new Date('2024-05-01T15:00:00Z') };
const text = JSON.stringify(original);
const restored = JSON.parse(text);
console.log(restored.createdAt); // '2024-05-01T15:00:00.000Z'
console.log(restored.createdAt instanceof Date); // false
```

`JSON.stringify()` calls a Date's `toJSON()` method. The resulting JSON contains an ISO string. Parsing has no general reason to interpret that string as a Date rather than text.

A TypeScript assertion won't change this:

```typescript
const asserted = JSON.parse(text) as { createdAt: Date };
// The assertion changes the static type; the runtime value is still a string.
```

If a later method call expects a real Date, our apparent round trip has become a runtime error.

## Defining the Shape of a Round Trip

A serialized representation should answer two questions: what data is needed to recreate the value, and how can a reader recognize it? For an interval, the endpoints provide the essential data. A discriminator such as `$type` identifies how to interpret it without serializing executable behavior.

We could revive a known field:

```javascript
const restoredDate = JSON.parse(text, (key, value) =>
  key === 'createdAt' && typeof value === 'string' ? new Date(value) : value,
);
console.log(restoredDate.createdAt instanceof Date); // true
```

That approach works for a controlled schema, but guessing every date-shaped string can corrupt ordinary text. A larger application benefits from an explicit type discriminator and validation during reconstruction.

The discriminator answers “what kind of value is this?” The constructor still needs to answer “are these endpoints valid?”

## A Serializable Representation for Timespan

```typescript
import { Timespan } from '@undercroft/timespan';
import type { TimespanJson } from '@undercroft/timespan';

const span = new Timespan(
  new Date('2024-05-01T15:00:00Z'),
  new Date('2024-05-03T18:30:00Z'),
);
const json: TimespanJson = span.toJSON();
console.log(json);
// {
//   $type: 'Timespan',
//   start: '2024-05-01T15:00:00.000Z',
//   end: '2024-05-03T18:30:00.000Z'
// }
```

The payload preserves the endpoints rather than only a formatted duration. `JSON.stringify(span)` invokes `toJSON()` automatically. `Timespan.stringify(span)` is a convenience wrapper for that operation.

No custom replacer is needed to write the object.

## Reconstructing a Single Interval

Deserializing a single object and a nested graph are distinct jobs. The first can validate the document as one Timespan; the second must recognize special values wherever they appear. Confusing the two can leave nested intervals as ordinary objects.

```typescript
const text = Timespan.stringify(span);
const restored = Timespan.parse(text);
console.log(restored instanceof Timespan); // true
console.log(restored.equals(span, 'range')); // true

const fromObject = Timespan.fromJSON(json);
console.log(fromObject.equals(span, 'range')); // true
```

`parse()` accepts a JSON document whose root is one Timespan payload. It doesn't recursively search a wrapper or array. `fromJSON()` accepts the already-parsed object.

Use range equality when testing serialization: duration equality alone could miss a round trip that moved both endpoints by the same amount.

## Reviving Intervals Inside Larger Documents

For an application document, pass the library's reviver to native JSON parsing:

```typescript
const text = JSON.stringify({ label: 'on-call shift', spans: [span] });
const restored = JSON.parse(text, Timespan.reviver);
console.log(restored.label); // 'on-call shift'
console.log(restored.spans[0] instanceof Timespan); // true
console.log(restored.spans[0].equals(span, 'range')); // true
```

The reviver reconstructs objects marked with `$type: 'Timespan'` and leaves other values unchanged. Reserve that discriminator for actual Timespan payloads in your schema.

## Shape Validation Is Not Date Validation

A structural type guard checks whether fields have the expected shapes. Reconstructing an interval also requires parsing dates, validating their ranges, and enforcing the class's invariants. These operations answer different questions.

`Timespan.isTimespanJSON()` checks the discriminator and string fields. It doesn't parse or order the dates:

```typescript
const candidate = {
  $type: 'Timespan',
  start: 'not a date',
  end: 'also invalid',
};
console.log(Timespan.isTimespanJSON(candidate)); // true
// Timespan.fromJSON(candidate) throws because the dates are invalid.
```

Malformed JSON makes `parse()` throw `SyntaxError`. An incorrect payload shape throws `TypeError`; invalid or reversed dates fail reconstruction. A malformed object carrying the discriminator also makes the reviver throw, so handle errors at the boundary where you load the document.

JSON remains a useful persistence format, but a reliable round trip depends on an explicit agreement about data shape and reconstruction. Timespan makes that contract visible so it can be validated and tested at application boundaries.

## Sources and Further Reading

- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
- [Serialized payload type](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/types/timespan-json.ts)
