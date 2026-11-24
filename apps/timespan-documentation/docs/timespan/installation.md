---
title: Installation
description: Install Timespan for Node.js, a bundler, or a browser script.
product: Timespan
group: Get Started
order: 2
---

```shell
npm install @undercroft/timespan
```

The package version documented here is 1.4.0. `engines` declares Node.js `^22.0.0 || ^24.0.0 || ^26.0.0`. The package has no runtime dependencies.

## Module formats

`import` loads `dist/index.mjs`. `require` loads `dist/index.js`. Type declarations are `dist/index.d.mts` and `dist/index.d.ts`.

```typescript
import { Timespan } from '@undercroft/timespan';
import Timespan from '@undercroft/timespan';

const span = Timespan.fromHours(2);
span.toString(); // '2h'
```

```javascript
const { Timespan } = require('@undercroft/timespan');

const span = Timespan.fromHours(2);
span.toString(); // '2h'
```

The named import, the default import, and the `require` binding are the same class.

## Browser

The UMD build assigns the class to `window.Timespan`. The same file is the `./umd` export.

```html
<script src="https://cdn.jsdelivr.net/npm/@undercroft/timespan/dist/index.umd.js"></script>
<script>
  const span = window.Timespan.fromHours(2);
  console.log(span.toString()); // '2h'
</script>
```

## Related

[Introduction](/docs/timespan) · [Timespan](/docs/timespan/api) · [React installation](/docs/react-timespan/installation)
