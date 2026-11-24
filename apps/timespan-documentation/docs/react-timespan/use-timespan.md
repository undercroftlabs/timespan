---
title: useTimespan
description: Call the useTimespan hook from a React component.
product: React Timespan
group: Hooks
order: 22
---

```typescript
function useTimespan(initial: Timespan | (() => Timespan)): UseTimespanResult;

interface UseTimespanResult {
  timespan: Timespan;
  setStart: (start: Date) => void;
  setEnd: (end: Date) => void;
  setTimespan: Dispatch<SetStateAction<Timespan>>;
}
```

`useTimespan` and `UseTimespanResult` are the exports of `@undercroft/react-timespan` 1.4.0. The hook stores `initial` in React state. A function is called while React initializes that state. A later change to `initial` leaves the stored timespan in place. The stored value stays there until a setter runs. It does not follow the current time.

The hook does not format. Read the stored value with [`Timespan`](/docs/timespan/api) methods such as `timespan.toString()` and `timespan.format()`.

| Member            | Behavior                                                              |
| ----------------- | --------------------------------------------------------------------- |
| `timespan`        | Stored `Timespan` for this render                                     |
| `setStart(start)` | Stores `new Timespan(start, latest.end)`                              |
| `setEnd(end)`     | Stores `new Timespan(latest.start, end)`                              |
| `setTimespan`     | Stores a `Timespan`, or calls a function with the latest stored value |

`latest` includes updates already queued in the same turn. Queued updates run in order, and each intermediate interval has to be valid. Change both endpoints in one `setTimespan` call. The three setters keep the same identity across renders.

`Timespan` rejects an invalid date or a reversed range when React processes the update. [`Timespan.tryCreate`](/docs/timespan/api#creating) runs those checks and returns the result. Store `result.value` only when `result.success` is true.

```typescript
import { Timespan } from '@undercroft/timespan';
import { useTimespan } from '@undercroft/react-timespan';

const opening = new Date('2024-03-01T00:00:00.000Z');
const closing = new Date('2024-03-15T00:00:00.000Z');

export function BookingWindow() {
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

`timespan.toString()` is `2w` until the click. After the click it is the interval from 1 March through 20 March.

## Related

[Installation](/docs/react-timespan/installation) · [Timespan](/docs/timespan/api) · [Date ranges](/docs/timespan/date-ranges)
