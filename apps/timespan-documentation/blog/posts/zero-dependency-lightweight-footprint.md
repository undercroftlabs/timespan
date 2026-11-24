---
title: 'Does Zero-Dependency Actually Mean Lightweight?'
date: '2026-11-23'
author: Michael Goodwin
excerpt: 'Does zero-dependency mean lightweight? Explore JavaScript bundle size, install size, and runtime costs using Timespan as a practical example.'
keywords:
  - Zero-dependency JavaScript
  - JavaScript bundle size
  - npm package size
  - Runtime dependencies
  - JavaScript performance
  - Benchmarking
  - Timespan
  - TypeScript
canonical: /blog/zero-dependency-lightweight-footprint
section: Engineering
---

A package advertising zero dependencies may sound as though it will have almost no effect on an application. The actual claim is narrower—and still useful: the package doesn't ask the package manager to install additional runtime libraries on its behalf.

That says something about dependency management, but not necessarily about download size, execution time, memory use, or bundler behavior. Those costs need separate measurements. Timespan 1.3.0 provides a concrete example.

## What Zero Runtime Dependencies Actually Promises

A large development toolchain doesn't necessarily make a published library heavy, and zero runtime dependencies doesn't guarantee that the library's own code is tiny. Consumers install the published artifact, not the entire development toolchain.

Timespan's tagged package metadata has no runtime `dependencies` list. Its development dependencies include tools for building, unit testing, coverage, type compatibility, and size checks. The workspace adds repository-level tooling too.

Those tools support development and publishing. They aren't ordinary transitive runtime dependencies of an application that installs the published library.

That distinction makes zero-runtime-dependency a meaningful property. It can reduce the number of separately versioned packages in a consumer's runtime graph. It doesn't eliminate bugs or guarantee a small bundle.

## Bundle Size and Install Size Measure Different Costs

Compressed transfer size, unpacked package size, and the JavaScript a runtime parses are related but distinct. A few kilobytes transferred over the network doesn't mean the installed package occupies only a few kilobytes on disk, and it doesn't predict startup or execution cost.

The v1.3.0 README records approximately **3.8 kB Brotli-compressed bundle size** and **402.3 kB install size**. These are release-documentation figures, not measurements newly produced by this article.

Why can they differ so much?

The distribution includes multiple module formats, type declarations, and source maps. A browser generally receives one selected build or the application's generated bundle, rather than every file in the installed package.

Brotli measures compressed bytes under a particular setup. Install size describes a different artifact. Neither figure alone tells us an application's incremental payload after bundling.

The tagged Size Limit configuration sets separate 4 KB budgets for `dist/index.js`, `dist/index.mjs`, and `dist/index.umd.js`. Treat a budget as a regression threshold, not proof of a fresh measurement or a performance ranking.

## The Consumer Build Is the Real Test

An application may tree-shake unused exports, combine dependencies into chunks, or transform code differently from an isolated package benchmark. Measure the actual consumer build as well as the package.

A useful comparison starts with two production builds: the application before adding a feature, and the application after implementing the same feature with Timespan.

Record which output changed, its compressed transfer size, and the bundler and settings used. If code splitting moves the library into a shared chunk, include that chunk in the comparison.

Don't assume that importing one class means a bundler can remove every unused class method. The emitted structure and the bundler's analysis determine what remains.

For a minimal local investigation after building the tagged repository:

```shell
pnpm --filter @undercroft/timespan build
pnpm --filter @undercroft/timespan size
```

These commands use the repository's pinned workspace toolchain after its development dependencies have been installed. They aren't commands an ordinary application consumer needs to run.

For the application itself, use its production bundle report. Compare equal behavior: a handwritten subtraction helper and a complete parser-plus-calendar-plus-serializer solve different amounts of work.

## Construction and Reuse Affect Runtime Cost

Runtime costs depend on the workload. Constructing thousands of intervals and formatting each once differs from constructing one and repeatedly reading cached values. An optimization for one pattern may not help another.

Timespan's constructor copies both endpoints, computes a timeframe, and prepares a compact string. That moves work to construction so repeated `toString()` calls can return a stored value.

It also creates retained data and work that simple timestamp subtraction wouldn't need. Whether the tradeoff helps depends on the workload.

```typescript
import { Timespan } from '@undercroft/timespan';

const start = new Date('2024-01-01T00:00:00Z');
const end = new Date('2024-01-02T02:30:00Z');
const span = new Timespan(start, end);
console.log(span.toString()); // '1d 2h 30m'
console.log(span.toString()); // Same precomputed compact representation.
```

A benchmark that constructs a new object for every read measures a different usage pattern from one that constructs once and formats repeatedly.

The v1.3.0 repository contains Vitest benchmark files and save/compare tooling. Their presence supports performance investigation; it doesn't establish that Timespan is faster than Date, Temporal, or another library.

## Benchmarking with Questions That Matter

Good benchmarks begin with a hypothesis. Are we measuring input parsing throughput, package initialization, date arithmetic, or formatting? Only after naming the question can we choose representative inputs, isolate noise, and interpret a result responsibly.

For a dashboard, measure repeated rendering of existing intervals. For importing a large file, include parsing and object construction. For a server processing many intervals, observe allocation and memory as well as elapsed time.

Keep runtime version, hardware, inputs, warmup, and sample sizes visible. Test ordinary inputs and relevant calendar boundaries. Separate correctness from speed: a faster calculation with different month-end semantics isn't an interchangeable result.

If a feature only needs `end.getTime() - start.getTime()`, native subtraction remains an excellent baseline. If several features need parsing, calendar breakdowns, formatting, and persistence, a focused library may replace duplicated application code.

Zero runtime dependencies is one useful fact, not a complete measure of “lightweight.” Compressed bytes, installed files, startup cost, and hot-path throughput answer different questions. Measure the costs that matter to your application, using a workload that resembles production and verifies the required behavior.

## Sources and Further Reading

- [Release README and size figures](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/README.md)
- [Runtime and development metadata](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/package.json)
- [Size budgets](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/.size-limit.js)
- [Benchmark tooling](https://github.com/undercroftlabs/timespan/blob/v1.3.0/tools/timespan-bench.mjs)
- [Timespan v1.3.0 implementation](https://github.com/undercroftlabs/timespan/blob/v1.3.0/packages/timespan/src/timespan.ts)
