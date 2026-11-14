# Timespan benchmarks

Each release gets its own directory. `results.json` is Vitest's benchmark report and is what later runs compare against. `environment.json` records the commit, Node version, Vitest version, CPU, and operating system for that measurement.

```
benchmarks/timespan/
└── 1.2.1/
    ├── results.json
    └── environment.json
```

`pnpm bench` runs the benchmarks once and prints them. It does not save anything.

Save a release record from the repository root:

```bash
pnpm bench:save -- 1.2.1
```

Compare the current source with a saved release:

```bash
pnpm bench:compare -- 1.2.1
```

Vitest prints the ratio of current operations per second to the saved operations per second. A ratio above 1 is faster. These are local judgments, not a CI failure:

| Current / saved | Meaning                                                    |
| --------------- | ---------------------------------------------------------- |
| 0.95–1.00       | Ignore                                                     |
| 0.90–0.95       | Monitor                                                    |
| 0.80–0.90       | Investigate                                                |
| Below 0.80      | Potential regression; reproduce before treating it as real |

A single run's margin of error is not the same as variation between runs. Repeat an unchanged tree before treating a small drop as a regression. Only compare records taken on similar hardware, Node versions, and Vitest versions. This machine's snapshot is not a threshold for GitHub-hosted runners. Vitest matches rows by a hash of the benchmark file's absolute path, so compare from this checkout.

The table inside one run, such as a short valid string versus a long invalid string, is not a regression. Those cases do different work.

These records measure the TypeScript source through Vitest. They do not measure the published, minified bundle.

Omitting the version uses the version in `packages/timespan/package.json`.
