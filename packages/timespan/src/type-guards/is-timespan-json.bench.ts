import { bench, describe } from 'vitest';

import { isTimespanJson } from './is-timespan-json';

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
 * Asserts that `isTimespanJson` returns `expected` for `value`.
 * @param value - Value to inspect.
 * @param expected - Expected boolean result.
 * @returns Nothing.
 */
function expectResult(value: unknown, expected: boolean): void {
  const actual = isTimespanJson(value);
  if (actual !== expected) {
    throw new Error(`expected ${expected}, received ${actual}`);
  }
}

expectResult(plainObject, true);
expectResult(extraFields, true);
expectResult(nullPrototype, true);
expectResult(nullInput, false);
expectResult(arrayInput, false);
expectResult(missingEnd, false);
expectResult(wrongType, false);

describe('isTimespanJson', () => {
  bench('accepts a plain object', () => {
    isTimespanJson(plainObject);
  });

  bench('accepts an object with extra fields', () => {
    isTimespanJson(extraFields);
  });

  bench('accepts a null-prototype object', () => {
    isTimespanJson(nullPrototype);
  });

  bench('rejects null', () => {
    isTimespanJson(nullInput);
  });

  bench('rejects an array', () => {
    isTimespanJson(arrayInput);
  });

  bench('rejects a missing end', () => {
    isTimespanJson(missingEnd);
  });

  bench('rejects the wrong type', () => {
    isTimespanJson(wrongType);
  });
});
