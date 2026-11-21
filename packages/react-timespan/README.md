# React Timespan

`useTimespan` holds a [`Timespan`](https://github.com/undercroftlabs/timespan/blob/main/packages/timespan/README.md) in React state. The stored interval stays where you put it until a setter runs. It does not follow the clock.

Peer dependencies are React 18 or 19 and `@undercroft/timespan` 1.4.0.

# Installation

```shell
npm install @undercroft/react-timespan @undercroft/timespan
```

```typescript
import {
  useTimespan,
  type UseTimespanResult,
} from '@undercroft/react-timespan';
import { Timespan } from '@undercroft/timespan';
```

`import` resolves `dist/index.mjs` and `dist/index.d.mts`. `require` resolves `dist/index.js` and `dist/index.d.ts`.

```javascript
const { useTimespan } = require('@undercroft/react-timespan');
```

# State

`useTimespan` returns the current `Timespan` and three setters. `timespan` is the value for this render. `setStart` and `setEnd` each store a new `Timespan`, keeping the other endpoint from the latest pending value. `setTimespan` stores the instance you pass, or applies a function to that latest value. The setters keep the same identity across renders. Calculation and formatting stay on `Timespan`.

## Start from a Timespan

Pass a `Timespan`. React keeps that value when `initial` changes on a later render. Fourteen days from 1 March 2024 is `2w`.

```tsx
const opening = new Date('2024-03-01T00:00:00.000Z');
const closing = new Date('2024-03-15T00:00:00.000Z');

const { timespan }: UseTimespanResult = useTimespan(
  new Timespan(opening, closing),
);

timespan.start.toISOString(); // '2024-03-01T00:00:00.000Z'
timespan.end.toISOString(); // '2024-03-15T00:00:00.000Z'
timespan.toString(); // '2w'
```

## Start from a function

Pass a function when the first value should be created during state initialization. React calls it then. A later render does not call it again. In development Strict Mode, React may call it twice.

```tsx
const { timespan } = useTimespan(() =>
  Timespan.fromDays(14, new Date('2024-03-01T00:00:00.000Z')),
);
```

## Move one endpoint

`setStart` keeps the latest end. `setEnd` keeps the latest start. Each call stores a new `Timespan`. React runs queued updates in order, and each one reads the Timespan left by the update before it. Every intermediate interval has to be valid. Changing both endpoints with these setters can fail when an intermediate range is reversed. Use `setTimespan` for that change.

```tsx
setStart(new Date('2024-03-05T00:00:00.000Z'));
setEnd(new Date('2024-03-20T00:00:00.000Z'));
```

From 1 March through 15 March, this pair stays valid: 5 March is still on or before 15 March, and 20 March is on or after 5 March.

## Replace the interval

`setTimespan` stores a `Timespan`, or receives the latest one and returns the next one.

```tsx
setTimespan(
  new Timespan(
    new Date('2024-04-01T00:00:00.000Z'),
    new Date('2024-04-08T00:00:00.000Z'),
  ),
);

setTimespan(
  (current) =>
    new Timespan(current.start, new Date('2024-03-20T00:00:00.000Z')),
);
```

## Change both endpoints together

`Timespan` rejects a range whose start is after its end. `setStart` and `setEnd` each build the next interval from one new endpoint and the other endpoint already stored. Moving the start past the current end, then moving the end, can throw on the first update even when the two new instants would form a valid range. Change both endpoints in one update:

```tsx
setTimespan((current) => new Timespan(newStart, newEnd));
```

`Timespan` also rejects an invalid `Date`. That check runs when React processes the update, which may be during the following render rather than inside the setter call.

## Validate before updating

`Timespan.tryCreate(start, end)` runs those same checks and returns the result instead of throwing. Call it before `setTimespan` when both endpoints should be checked before React schedules an update. A failure leaves the stored interval unchanged. The hook does not add a non-throwing setter.

```tsx
const { setTimespan } = useTimespan(initial);

function updateInterval(start: Date, end: Date) {
  const result = Timespan.tryCreate(start, end);

  if (result.success) {
    setTimespan(result.value);
  }

  return result;
}
```

# Example

```tsx
import { Timespan } from '@undercroft/timespan';
import { useTimespan } from '@undercroft/react-timespan';

const opening = new Date('2024-03-01T00:00:00.000Z');
const closing = new Date('2024-03-15T00:00:00.000Z');

function BookingWindow() {
  const { timespan, setEnd } = useTimespan(new Timespan(opening, closing));

  return (
    <button
      type="button"
      onClick={() => setEnd(new Date('2024-03-20T00:00:00.000Z'))}
    >
      {timespan.toString()}
    </button>
  );
}
```
