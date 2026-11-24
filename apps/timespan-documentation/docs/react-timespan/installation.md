---
title: Installation
description: Install the React package and its peer dependencies.
product: React Timespan
group: Get Started
order: 21
---

```shell
npm install @undercroft/react-timespan @undercroft/timespan react
```

| Peer                   | Accepted version       |
| ---------------------- | ---------------------- |
| `@undercroft/timespan` | `1.4.0`                |
| `react`                | `^18.0.0 \|\| ^19.0.0` |

The Timespan peer is an exact version. `engines` declares Node.js `^22.0.0 || ^24.0.0 || ^26.0.0`.

```typescript
import { Timespan } from '@undercroft/timespan';
import {
  useTimespan,
  type UseTimespanResult,
} from '@undercroft/react-timespan';

const { timespan }: UseTimespanResult = useTimespan(
  new Timespan(
    new Date('2024-03-01T00:00:00.000Z'),
    new Date('2024-03-15T00:00:00.000Z'),
  ),
);
```

`import` loads `dist/index.mjs`. `require` loads `dist/index.js`.

## Related

[Introduction](/docs/react-timespan) · [useTimespan](/docs/react-timespan/use-timespan) · [Timespan installation](/docs/timespan/installation)
