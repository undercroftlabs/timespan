---
title: Saving and restoring
description: Serialize a Timespan to JSON and restore the class from that payload.
product: Timespan
group: Guides
order: 9
---

```typescript
type TimespanJson = {
  $type: 'Timespan';
  start: string;
  end: string;
};
```

`TimespanJson` is exported. `toJSON()` writes both instants with `toISOString()`, so the strings are UTC. `JSON.stringify` calls the instance method when it encounters a timespan. Extra fields on a parsed object are ignored by `fromJSON`.

```typescript
toJSON(): TimespanJson
static toJSON(timespan: Timespan): TimespanJson
static fromJSON(json: unknown): Timespan
static stringify(timespan: Timespan): string
static parse(jsonString: string): Timespan
static reviver(key: string, value: unknown): unknown
static isTimespanJSON(value: unknown): value is TimespanJson
```

`stringify` is `JSON.stringify` of one timespan. `parse` is `fromJSON(JSON.parse(jsonString))` and expects that one object. A timespan nested in a larger document needs `reviver`.

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = new Timespan(
  new Date('2024-05-01T15:00:00.000Z'),
  new Date('2024-05-03T18:30:00.000Z'),
);

timespan.toJSON();
// {
//   $type: 'Timespan',
//   start: '2024-05-01T15:00:00.000Z',
//   end: '2024-05-03T18:30:00.000Z',
// }

const restored = Timespan.parse(Timespan.stringify(timespan));
restored.equals(Timespan.fromJSON(timespan.toJSON()), 'range'); // true
```

## Shape check

`isTimespanJSON` returns true when `$type` is `'Timespan'` and `start` and `end` are strings. It does not parse the strings or compare the endpoints, so a true result can still make `fromJSON` throw. A `Timespan` instance returns false.

## Nested values

`reviver` restores a plain object whose `$type` is `'Timespan'`. Every other value, including arrays, is returned unchanged. Pass it to `JSON.parse`. The property name is unused.

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = new Timespan(
  new Date('2024-05-01T15:00:00.000Z'),
  new Date('2024-05-03T18:30:00.000Z'),
);

const payload = JSON.parse(
  JSON.stringify({ label: 'on-call shift', span: timespan }),
  Timespan.reviver,
);

payload.label; // 'on-call shift'
payload.span.equals(timespan, 'range'); // true
```

Invalid JSON throws `SyntaxError`. A value that is not Timespan JSON throws `TypeError: Invalid Timespan JSON.` Date strings that do not parse, and a start after the end, throw the date errors on [Errors](/docs/timespan/errors).

## Related

[Timespan](/docs/timespan/api) · [JSON serialization](/blog/json-serialization-and-restoration)
