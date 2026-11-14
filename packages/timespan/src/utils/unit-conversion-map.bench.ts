import { bench, describe } from 'vitest';

import { TimeUnit } from '../types/time-unit';
import { getConverter, getTimeUnits } from './unit-conversion-map';

const rejectionMessage = 'Invalid time unit: expected a recognized time unit.';

const dayAlias = 'd' as const;
const minuteAlias = 'm' as const;
const monthAlias = 'M' as const;
const longestAlias = 'milliseconds' as const;
const unknownUnit = 'decade' as TimeUnit;
const nullUnit = null as unknown as TimeUnit;

function expectUnits(): void {
  const units = getTimeUnits();
  if (!units.includes('day') || units.includes('decade' as TimeUnit)) {
    throw new Error('expected the copied unit list to contain day only');
  }
}

function expectConverter(unit: TimeUnit, abbreviation: string): void {
  const converter = getConverter(unit);
  if (converter.abbreviation !== abbreviation) {
    throw new Error(
      `expected ${unit} to abbreviate as ${abbreviation}, received ${converter.abbreviation}`,
    );
  }
}

function expectRejected(unit: TimeUnit): void {
  try {
    getConverter(unit);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectUnits();
expectConverter(dayAlias, 'd');
expectConverter(minuteAlias, 'm');
expectConverter(monthAlias, 'M');
expectConverter(longestAlias, 'ms');
expectRejected(unknownUnit);
expectRejected(nullUnit);

describe('getTimeUnits', () => {
  bench('copies the registered unit list', () => {
    getTimeUnits();
  });
});

describe('getConverter', () => {
  bench('resolves a one-character day alias', () => {
    getConverter(dayAlias);
  });

  bench('resolves the minute alias', () => {
    getConverter(minuteAlias);
  });

  bench('resolves the month alias', () => {
    getConverter(monthAlias);
  });

  bench('resolves the longest alias', () => {
    getConverter(longestAlias);
  });

  bench('rejects an unknown unit', () => {
    try {
      getConverter(unknownUnit);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      getConverter(nullUnit);
    } catch {
      return;
    }
  });
});
