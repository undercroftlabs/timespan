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
import { useTimespan } from '@undercroft/react-timespan';

useTimespan(); // undefined
```

`import` loads `dist/index.mjs`. `require` loads `dist/index.js`.

## Related

[Introduction](/docs/react-timespan) · [useTimespan](/docs/react-timespan/use-timespan) · [Timespan installation](/docs/timespan/installation)
