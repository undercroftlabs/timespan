---
title: useTimespan
description: Call the useTimespan hook from a React component.
product: React Timespan
group: Hooks
order: 22
---

```typescript
function useTimespan(): void;
```

The only export of `@undercroft/react-timespan` 1.4.0. It accepts no parameters. The return type is `void`, and the function returns `undefined`. Calling it does not create a `Timespan`.

```typescript
import { useTimespan } from '@undercroft/react-timespan';

export function Shift() {
  useTimespan();
}
```

Measure or format an interval with [`Timespan`](/docs/timespan/api) until this hook stores one.

## Related

[Installation](/docs/react-timespan/installation) · [Timespan](/docs/timespan/api)
