import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

/**
 * Runs one known duration through the built Timespan export.
 * @param Timespan - Built Timespan constructor.
 */
function assertCanonicalTimespan(Timespan) {
  const timespan = Timespan.fromString(
    '1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss',
    new Date(Date.UTC(2000, 0, 1)),
  );

  assert.equal(timespan.toYears(), 1);
  assert.equal(timespan.toMonths(), 14);
  assert.equal(timespan.toWeeks(), 64);
  assert.equal(timespan.toDays(), 450);
  assert.equal(timespan.toHours(), 10805);
  assert.equal(timespan.toMinutes(), 648306);
  assert.equal(timespan.toSeconds(), 38898367);
  assert.equal(timespan.toMilliseconds(), 38898367008);
  assert.equal(timespan.toString(), '1y 2M 3w 4d 5h 6m 7s 8ms');
}

// node:assert is not recognized as a test assertion by this rule.
// oxlint-disable-next-line sonarjs/assertions-in-tests
test('CommonJS entry resolves from the installed package', () => {
  const loaded = require('@undercroft/timespan');
  assert.equal(typeof loaded.Timespan, 'function');
  assertCanonicalTimespan(loaded.Timespan);
});

// node:assert is not recognized as a test assertion by this rule.
// oxlint-disable-next-line sonarjs/assertions-in-tests
test('ESM entry resolves from the installed package', async () => {
  const loaded = await import('@undercroft/timespan');
  assert.equal(typeof loaded.Timespan, 'function');
  assert.equal(loaded.default, loaded.Timespan);
  assertCanonicalTimespan(loaded.Timespan);
});
