---
title: Introduction
description: React Timespan exposes Timespan to React components.
product: React Timespan
group: Get Started
order: 20
---

`@undercroft/react-timespan` 1.4.0 exports one function, `useTimespan`. The hook takes no arguments and returns `undefined`. It does not store an interval, format a value, or subscribe to anything.

Interval calculations stay in [`@undercroft/timespan`](/docs/timespan), which this package lists as a peer dependency at version 1.4.0.

```typescript
import { useTimespan } from '@undercroft/react-timespan';

useTimespan(); // undefined
```

## Related

[Installation](/docs/react-timespan/installation) · [useTimespan](/docs/react-timespan/use-timespan) · [Timespan](/docs/timespan/api)
