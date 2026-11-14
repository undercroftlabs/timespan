import { bench, describe } from 'vitest';

import { assertValidTimespanJson } from './assert-valid-timespan-json';

const rejectionMessage = 'Invalid Timespan JSON.';

const plainObject = {
  $type: 'Timespan',
  start: '2022-01-01T06:24:00.000Z',
  end: '2023-02-21T10:52:00.123Z',
};
const extraFields = {
  ...plainObject,
  label: 'kept',
};
const nullPrototype = Object.create(null) as {
  $type: string;
  start: string;
  end: string;
};
nullPrototype.$type = 'Timespan';
nullPrototype.start = plainObject.start;
nullPrototype.end = plainObject.end;

const nullInput = null;
const arrayInput = [plainObject];
const missingEnd = {
  $type: 'Timespan',
  start: plainObject.start,
};
const wrongType = {
  ...plainObject,
  $type: 'timespan',
};

/**
 * Asserts that `value` is accepted.
 * @param value - Timespan JSON that must pass.
 * @returns Nothing.
 */
function expectAccepted(value: object): void {
  assertValidTimespanJson(value);
}

/**
 * Asserts that `value` is rejected with the Timespan JSON error.
 * @param value - Value that must fail.
 * @returns Nothing.
 */
function expectRejected(value: unknown): void {
  try {
    assertValidTimespanJson(value);
  } catch (error) {
    if (error instanceof TypeError && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new TypeError(rejectionMessage);
}

expectAccepted(plainObject);
expectAccepted(extraFields);
expectAccepted(nullPrototype);
expectRejected(nullInput);
expectRejected(arrayInput);
expectRejected(missingEnd);
expectRejected(wrongType);

describe('assertValidTimespanJson', () => {
  bench('accepts a plain object', () => {
    assertValidTimespanJson(plainObject);
  });

  bench('accepts an object with extra fields', () => {
    assertValidTimespanJson(extraFields);
  });

  bench('accepts a null-prototype object', () => {
    assertValidTimespanJson(nullPrototype);
  });

  bench('rejects null', () => {
    try {
      assertValidTimespanJson(nullInput);
    } catch {
      return;
    }
  });

  bench('rejects an array', () => {
    try {
      assertValidTimespanJson(arrayInput);
    } catch {
      return;
    }
  });

  bench('rejects a missing end', () => {
    try {
      assertValidTimespanJson(missingEnd);
    } catch {
      return;
    }
  });

  bench('rejects the wrong type', () => {
    try {
      assertValidTimespanJson(wrongType);
    } catch {
      return;
    }
  });
});
