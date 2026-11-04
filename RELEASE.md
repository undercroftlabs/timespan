# Releasing TimeSpan

Tagged GitHub Actions releases publish `@undercroft/timespan` with **npm Trusted Publishing** (GitHub Actions OIDC). There is no npm token in the workflow.

## Expected sequence

1. Push a version tag matching `v*` (for example `v1.2.0`).
2. `publish.yml` validates the tag format and that it matches `package.json` (`v1.2.0` ↔ `1.2.0`).
3. Jest unit tests, distribution tests, and Playwright browser tests run against **that tagged commit**.
4. The `publish` job (environment `npm-publish`) publishes with OIDC.
5. The workflow checks that the version is visible on the npm registry.
6. A GitHub Release is created from `changelog.md` **after** npm publish succeeds.

```text
validate-tag
    ├── unit-tests
    ├── dist-tests
    └── browser-tests (reusable workflow)
            └── publish  (environment: npm-publish, id-token: write)
                    └── github-release  (contents: write only)
```

A failure in unit, distribution, or browser tests blocks `npm publish`. A failed publish blocks GitHub Release creation.

## GitHub environment: `npm-publish`

The npm trusted publisher is already configured as:

| Setting           | Value            |
| ----------------- | ---------------- |
| Provider          | GitHub Actions   |
| Organization      | `undercroftlabs` |
| Repository        | `timespan`       |
| Workflow filename | `publish.yml`    |
| Environment       | `npm-publish`    |

Create the GitHub Actions environment if it does not exist:

1. Repository **Settings → Environments → New environment**.
2. Name it exactly `npm-publish`.
3. Optional: required reviewers before the publish job starts.
4. **Deployment branches and tags:** Selected tags, pattern `v*`.
5. Do **not** store npm authentication secrets on this environment.

If the environment is limited to branch `main` (or “protected branches only”), a tag push such as `v1.2.0` **cannot** enter `npm-publish` and the publish job will be skipped or blocked. Use a **tag** rule `v*`, not a branch-only rule.

The environment is attached to the job that runs `npm publish`, not to the test jobs.

## OIDC permissions

Only the publish job requests:

```yaml
permissions:
  contents: read
  id-token: write
```

The GitHub Release job requests `contents: write` and does **not** receive `id-token: write`.

Trusted Publishing requires Node.js 22.14+ and npm 11.5.1+. The publish job uses the newest even LTS listed in `package.json` `engines.node` and checks the npm CLI version.

Provenance attestations are generated automatically for public packages from this public repository. After a successful publish:

```bash
npm view @undercroft/timespan@<version> --json
```

Confirm the version exists, then open the package version page on npmjs.com and check the provenance / “Built from” attestation. You can also inspect attestations with `npm audit signatures` for installed copies.

## Lifecycle scripts during CI publish

- `postinstall` runs `husky`. GitHub Actions sets `CI=true`, so Husky does not install local git hooks.
- `prepublishOnly` runs `pinst --disable` (so the published tarball does not run Husky for consumers) and `test:dist` (consumer layout check). That dist check also runs as an explicit job; the extra `prepublishOnly` run is a last-line safety net on the exact files about to be packed.
- `postpublish` runs `pinst --enable` in the runner workspace only. It is not committed.

`files` in `package.json` is `["dist"]`, so the tarball contains the built JavaScript, UMD, and TypeScript declarations.

## Recovery from partial success

### Tests fail

npm is not published and no GitHub Release is created. Fix the tagged commit (or retag after a fix) and push a new tag. Do not treat a green PR on `main` as proof that the tag was tested.

### `npm publish` fails

The GitHub Release job does not run. Inspect the publish logs. Do **not** add a token fallback. Do **not** re-run publish in a way that skips tests. If the version was **not** published, you may re-run the whole workflow after fixing the cause.

### npm published, GitHub Release failed

Do **not** publish the same version again.

Preferred recovery: in the failed workflow run, use **Re-run failed jobs**. That retries only `github-release`. The publish job is left as the successful run.

Manual recovery from the tag:

```bash
git fetch --tags
git checkout "v<version>"
gh release create "v<version>" --title "v<version>" --notes-file changelog.md
```

Prefer the `changelog.md` section for that version when writing notes.

If the GitHub Release already exists, the workflow treats that as success and does not recreate it.

Never skip tag/version validation or tests because a version already exists on npm. An already-published version is a reason **not** to run `npm publish` again, not a reason to ignore a failed check.
