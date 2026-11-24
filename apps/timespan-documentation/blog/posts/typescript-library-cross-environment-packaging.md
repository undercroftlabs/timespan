---
title: 'Building a TypeScript Library That Actually Works Everywhere'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Learn to package and test a TypeScript library for ESM, CommonJS, and browsers, including exports, declarations, and consumer builds.'
keywords:
  - TypeScript library packaging
  - npm package exports
  - ESM
  - CommonJS
  - UMD
  - TypeScript declarations
  - Browser compatibility
  - Timespan
canonical: /blog/typescript-library-cross-environment-packaging
section: Engineering
---

A TypeScript library passes its unit tests and builds without errors. Then a consumer installs it and encounters a module-resolution error before calling the first function.

The source and the npm package are different products. Consumers receive compiled JavaScript, declaration files, metadata, and an export map. A mistake in any of them can make a correct implementation unusable.

Timespan's development history illustrates this distinction. Browser delivery arrived in 1.1.0, cross-browser distribution tests strengthened 1.2.0, and the 1.3.0 monorepo places even more attention on entry points and package verification. The goal isn't compatibility with every runtime in existence, but reliable behavior in clearly supported environments.

## A Working Source Tree Is Not a Working Package

Local tests often import `src/index.ts` directly. That tests implementation logic, but bypasses the package-resolution decisions an npm consumer encounters. Passing those tests doesn't prove a consumer can load `dist/index.mjs` or resolve its declaration file. Publishing also requires deciding which generated file each loader should open.

Timespan keeps its publishable library under `packages/timespan` and its external bundle tests under `tests/bundle-e2e`. This makes room for testing the package boundary independently of source-level imports.

## ESM and CommonJS Need Explicit Routing

Modern packages may need to satisfy more than one module loader. The `exports` map isn't only documentation; it controls what consumers can import and which implementation each loader receives. It also prevents users from treating internal files as a stable public API.

The tagged package has `type: 'commonjs'`. Its public root export routes ESM imports to an `.mjs` file and CommonJS requires to a `.js` file:

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./umd": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.umd.js"
    }
  }
}
```

This is an excerpt of the v1.3.0 metadata, not a universal package template. Declaration extensions and package type must be designed together.

An ESM consumer can write:

```javascript
import { Timespan } from '@undercroft/timespan';
console.log(
  Timespan.fromHours(2, new Date('2024-01-01T00:00:00Z')).toMinutes(),
);
// 120
```

A CommonJS consumer uses:

```javascript
const { Timespan } = require('@undercroft/timespan');
console.log(
  Timespan.fromHours(2, new Date('2024-01-01T00:00:00Z')).toMinutes(),
);
// 120
```

An exports map also defines the public boundary. Source folders and arbitrary internal paths aren't promised module entry points.

## Type Declarations Are Part of the Public Contract

JavaScript can load while TypeScript reports incompatible declarations; declarations can also compile while the runtime path is wrong. Test both: type resolution and runtime resolution are separate contracts that must agree.

Producing a declaration file isn't enough if TypeScript resolves it under the wrong module interpretation. Timespan supplies `.d.mts` for the ESM branch and `.d.ts` for the CommonJS branch, with `types` conditions before each branch's default target.

The package also includes top-level `main` and `types` fields. Modern exports-aware tools use the explicit map; other tooling may consult those legacy fields.

The tagged distribution checks use publint and Are the Types Wrong, alongside loader tests. These checks address different failure modes: metadata validity, declaration compatibility, and actual runtime loading.

## Browser Distribution Has Different Requirements

UMD isn't simply ESM with a different extension. A classic browser script needs a global entry point; native ESM expects module syntax and a different loading path. Test both generated assets in browsers rather than assuming a successful build proves they work.

A script-tag consumer doesn't need a Node-style require call:

```html
<script src="https://cdn.jsdelivr.net/npm/@undercroft/timespan@1.3.0/dist/index.umd.js"></script>
<script>
  const span = window.Timespan.fromHours(2, new Date('2024-01-01T00:00:00Z'));
  console.log(span.toMinutes()); // 120
</script>
```

Timespan's UMD entry exposes the class itself as `window.Timespan`. That global shape is a contract worth testing; it isn't necessarily the same shape as a named ESM namespace.

The CDN URL above identifies a physical distribution file. Package specifier resolution through an exports map is a separate mechanism.

The v1.3.0 tsdown configuration generates ESM, CommonJS, and UMD, targets ES2022, and enables minification, source maps, and declarations. Its browser tests exercise ESM and UMD in Chromium, Firefox, and WebKit.

## Test the Artifact Consumers Actually Install

A release check should pack the library and exercise the files that ship. Otherwise an untracked local file, missing declaration, or incorrect `files` list can escape a green source test run.

In this tag, package scripts build the distribution, run publint, check declarations with Are the Types Wrong, and execute bundle loading tests. The `prepublishOnly` hook invokes the distribution checks. Browser testing is another explicit verification path.

The declared Node engine range is `^22.0.0 || ^24.0.0 || ^26.0.0`. ES2022 output and a browser test matrix don't imply support for every older browser or Node release.

After adding browser delivery in 1.1.0, Timespan 1.3.0 makes routing and consumer verification more explicit. A library's public API includes more than exported TypeScript names: package paths, loader compatibility, declaration resolution, and browser behavior matter too. Testing the npm artifact from the outside helps turn internal confidence into a dependable consumer experience.

## Sources and Further Reading

- [Package metadata](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/package.json)
- [Build configuration](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/tsdown.config.mts)
- [Browser and loader tests](https://github.com/undercroftlabs/timespan/blob/v1.3.0/tests/bundle-e2e/README.md)
- [UMD entry](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/entries/umd.ts)
