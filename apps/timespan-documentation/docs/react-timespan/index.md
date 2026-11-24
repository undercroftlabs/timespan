---
title: Introduction
description: React Timespan exposes Timespan to React components.
product: React Timespan
group: Get Started
order: 20
---

`@undercroft/react-timespan` 1.4.0 exports `useTimespan` and the `UseTimespanResult` type. The hook stores one `Timespan` in React state. It does not format that value and it does not follow the clock. Formatting and interval math stay on [`Timespan`](/docs/timespan/api).

```typescript
import { Timespan } from '@undercroft/timespan';
import { useTimespan } from '@undercroft/react-timespan';

const { timespan } = useTimespan(
  new Timespan(
    new Date('2024-03-01T00:00:00.000Z'),
    new Date('2024-03-15T00:00:00.000Z'),
  ),
);

timespan.toString(); // '2w'
```

The package lists `@undercroft/timespan` 1.4.0 as a peer dependency.

## Related

[Installation](/docs/react-timespan/installation) · [useTimespan](/docs/react-timespan/use-timespan) · [Timespan](/docs/timespan/api)
