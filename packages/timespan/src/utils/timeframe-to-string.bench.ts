import { bench, describe } from 'vitest';

import { TimeFrame } from '../types/timeframe';
import { timeFrameToString } from './timeframe-to-string';

const zeroFrame: TimeFrame = {
  years: 0,
  months: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
};
const singleDay: TimeFrame = {
  ...zeroFrame,
  days: 1,
};
const fullFrame: TimeFrame = {
  years: 1,
  months: 2,
  weeks: 3,
  days: 4,
  hours: 5,
  minutes: 6,
  seconds: 7,
  milliseconds: 8,
};
const negativeFrame: TimeFrame = {
  ...zeroFrame,
  days: -1,
};
const nonFiniteFrame: TimeFrame = {
  ...zeroFrame,
  hours: Number.NaN,
};
const negativeMessage =
  'Invalid number of days: expected zero or a positive number.';
const nonFiniteMessage =
  'Invalid number of hours: expected zero or a positive number.';

function expectString(timeFrame: TimeFrame, expected: string): void {
  const actual = timeFrameToString(timeFrame);
  if (actual !== expected) {
    throw new Error(`expected "${expected}", received "${actual}"`);
  }
}

function expectRejected(timeFrame: TimeFrame, message: string): void {
  try {
    timeFrameToString(timeFrame);
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      return;
    }

    throw error;
  }

  throw new Error(message);
}

expectString(zeroFrame, '');
expectString(singleDay, '1d');
expectString(fullFrame, '1y 2M 3w 4d 5h 6m 7s 8ms');
expectRejected(negativeFrame, negativeMessage);
expectRejected(nonFiniteFrame, nonFiniteMessage);

describe('timeFrameToString', () => {
  bench('formats an empty timeframe', () => {
    timeFrameToString(zeroFrame);
  });

  bench('formats a single day', () => {
    timeFrameToString(singleDay);
  });

  bench('formats every unit', () => {
    timeFrameToString(fullFrame);
  });

  bench('rejects a negative day count', () => {
    try {
      timeFrameToString(negativeFrame);
    } catch {
      return;
    }
  });

  bench('rejects a non-finite hour count', () => {
    try {
      timeFrameToString(nonFiniteFrame);
    } catch {
      return;
    }
  });
});
