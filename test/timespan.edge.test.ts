// Edge-case and fuzz suite for Timespan.
//
// These tests assert INTENDED behaviour. Some currently fail; each failure
// maps to a finding in AUDIT-1.2.0.md or to a semantics decision marked
// [SEMANTICS] that needs a maintainer call before fixing. Nothing in this
// file changes library behaviour — it only documents and exposes it.

import { Timespan } from '../src';

// Deterministic PRNG (mulberry32) so fuzz runs are reproducible.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const START = new Date('2023-06-15T12:00:00.000Z');

describe('edge: constructor', () => {
  it('allows a zero-length span (start === end)', () => {
    const ts = new Timespan(START, new Date(START));
    expect(ts.toMilliseconds()).toBe(0);
    expect(ts.toTimeframe()).toEqual({
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('represents a zero-length span as an empty string', () => {
    const ts = new Timespan(START, new Date(START));
    expect(ts.toString()).toBe('');
  });

  it('handles a 1ms span', () => {
    const ts = new Timespan(START, new Date(START.getTime() + 1));
    expect(ts.toMilliseconds()).toBe(1);
    expect(ts.toString()).toBe('1ms');
  });

  it('throws for an invalid Date object', () => {
    expect(() => new Timespan(new Date('not a date'), START)).toThrow();
    expect(() => new Timespan(START, new Date(NaN))).toThrow();
  });

  it('returns independent timeframe objects on each toTimeframe call', () => {
    const ts = new Timespan(START, new Date(START.getTime() + 1000));
    const first = ts.toTimeframe();
    first.seconds = 9999;
    expect(ts.toTimeframe().seconds).toBe(1);
  });
});

describe('edge: fromString parsing', () => {
  it('parses a full long-form string', () => {
    const ts = Timespan.fromString(
      '1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss',
      new Date('2023-01-01T00:00:00.000Z'),
    );
    expect(ts.start.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    expect(ts.end.getTime()).toBeGreaterThan(ts.start.getTime());
  });

  it('parses units with no separating space', () => {
    const ts = Timespan.fromString('1h30m', START);
    expect(ts.toMinutes()).toBe(90);
  });

  it('tolerates runs of spaces, tabs and newlines between units', () => {
    const ts = Timespan.fromString('  1h\t30m\n15s  ', START);
    expect(ts.toSeconds()).toBe(5415);
  });

  it('distinguishes months (M) from minutes (m)', () => {
    expect(Timespan.fromString('1M', START).end.toISOString()).toBe(
      '2023-07-15T12:00:00.000Z',
    );
    expect(Timespan.fromString('1m', START).toMinutes()).toBe(1);
  });

  it('throws for an empty string', () => {
    expect(() => Timespan.fromString('', START)).toThrow();
  });

  it('throws for a whitespace-only string', () => {
    expect(() => Timespan.fromString('   ', START)).toThrow();
  });

  it('throws for a number with no unit', () => {
    expect(() => Timespan.fromString('42', START)).toThrow();
  });

  it('throws for an unknown unit', () => {
    expect(() => Timespan.fromString('1x', START)).toThrow();
    expect(() => Timespan.fromString('1fortnight', START)).toThrow();
  });

  it('is case-sensitive about unit abbreviations', () => {
    expect(() => Timespan.fromString('1H', START)).toThrow();
    expect(() => Timespan.fromString('1MS', START)).toThrow();
  });

  it('throws for signed values', () => {
    expect(() => Timespan.fromString('-1h', START)).toThrow();
    expect(() => Timespan.fromString('+1h', START)).toThrow();
  });

  it('accepts an input of exactly the maximum length (75 chars)', () => {
    const input = `1h${' '.repeat(73)}`;
    expect(input.length).toBe(75);
    expect(() => Timespan.fromString(input, START)).not.toThrow();
  });

  it('rejects an input one character over the maximum length', () => {
    const input = `${'1h '.repeat(25)} `; // 76 chars
    expect(input.length).toBe(76);
    expect(() => Timespan.fromString(input, START)).toThrow(
      'Invalid input string',
    );
  });

  it('parses the largest 10-digit value', () => {
    const ts = Timespan.fromString('9999999999ms', START);
    expect(ts.toMilliseconds()).toBe(9999999999);
  });

  // An 11-digit number overflows the \d{0,10} capture: the parser can end up
  // matching the bare unit with an empty value and silently returning zero.
  it('does not silently return zero for an 11-digit value', () => {
    expect(() => Timespan.fromString('99999999999ms', START)).toThrow();
  });

  it('does not silently accept a bare unit with no value', () => {
    expect(() => Timespan.fromString('h', START)).toThrow();
  });

  it('throws when a unit is repeated', () => {
    expect(() => Timespan.fromString('1h 2h', START)).toThrow(
      'Duplicate date unit: h.',
    );
    expect(() => Timespan.fromString('30m 30m', START)).toThrow(
      'Duplicate date unit: m.',
    );
    expect(() => Timespan.fromString('1h 30m 2hours', START)).toThrow(
      'Duplicate date unit: hours.',
    );
  });

  // [SEMANTICS] Fractional values are currently rejected by the
  // allowed-characters check before parsing even starts.
  it('[SEMANTICS] supports fractional values', () => {
    expect(Timespan.fromString('1.5h', START).toMinutes()).toBe(90);
    expect(Timespan.fromString('0.5d', START).toHours()).toBe(12);
  });

  it('produces a zero span for an all-zero input', () => {
    const ts = Timespan.fromString('0d 0h 0m', START);
    expect(ts.toMilliseconds()).toBe(0);
    expect(ts.end.getTime()).toBe(START.getTime());
  });

  it('keeps working after a failed parse (parser state isolation)', () => {
    expect(Timespan.fromString('1h', START).toHours()).toBe(1);
    expect(() => Timespan.fromString('1h 2x', START)).toThrow();
    expect(Timespan.fromString('1h', START).toHours()).toBe(1);
    expect(Timespan.fromString('3d', START).toDays()).toBe(3);
  });

  it('throws when a huge year value overflows the Date range', () => {
    expect(() => Timespan.fromString('9999999999y', START)).toThrow();
  });
});

describe('edge: calendar arithmetic', () => {
  it('does not report a full year for a 1-day span crossing New Year', () => {
    const ts = new Timespan(
      new Date('2022-12-31T00:00:00.000Z'),
      new Date('2023-01-01T00:00:00.000Z'),
    );
    expect(ts.toDays()).toBe(1);
    expect(ts.toYears()).toBe(0);
  });

  it('never produces negative timeframe components (New Year crossing)', () => {
    const ts = new Timespan(
      new Date('2022-12-31T00:00:00.000Z'),
      new Date('2023-01-01T00:00:00.000Z'),
    );
    const tf = ts.toTimeframe();
    for (const value of Object.values(tf)) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
    expect(ts.toString()).toBe('1d');
  });

  it('counts a year only once the anniversary is reached', () => {
    const start = new Date('2022-06-15T00:00:00.000Z');
    expect(
      new Timespan(start, new Date('2023-06-14T00:00:00.000Z')).toYears(),
    ).toBe(0);
    expect(
      new Timespan(start, new Date('2023-06-15T00:00:00.000Z')).toYears(),
    ).toBe(1);
  });

  it('counts a month only once the full month has elapsed', () => {
    const start = new Date('2023-01-15T12:00:00.000Z');
    expect(
      new Timespan(start, new Date('2023-02-15T11:00:00.000Z')).toMonths(),
    ).toBe(0);
    expect(
      new Timespan(start, new Date('2023-02-15T12:00:00.000Z')).toMonths(),
    ).toBe(1);
  });

  it('clamps month addition at month end (non-leap February)', () => {
    const ts = Timespan.fromMonths(1, new Date('2023-01-31T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2023-02-28T00:00:00.000Z');
  });

  it('clamps month addition at month end (leap February)', () => {
    const ts = Timespan.fromMonths(1, new Date('2024-01-31T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2024-02-29T00:00:00.000Z');
  });

  it('clamps month addition into a 30-day month', () => {
    const ts = Timespan.fromMonths(1, new Date('2023-03-31T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2023-04-30T00:00:00.000Z');
  });

  it('lands exactly when adding months does not cross a short month', () => {
    const ts = Timespan.fromMonths(2, new Date('2023-01-31T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2023-03-31T00:00:00.000Z');
  });

  it('clamps year addition from Feb 29 via fromYears', () => {
    const ts = Timespan.fromYears(1, new Date('2020-02-29T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2021-02-28T00:00:00.000Z');
  });

  it('clamps year addition from Feb 29 via fromString, consistently', () => {
    const ts = Timespan.fromString('1y', new Date('2020-02-29T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2021-02-28T00:00:00.000Z');
  });

  it('clamps month addition via fromString, consistently', () => {
    const ts = Timespan.fromString('1M', new Date('2023-01-31T00:00:00.000Z'));
    expect(ts.end.toISOString()).toBe('2023-02-28T00:00:00.000Z');
  });

  it('knows 2000 was a leap year but 2100 is not', () => {
    const leap = new Timespan(
      new Date('2000-02-28T00:00:00.000Z'),
      new Date('2000-03-01T00:00:00.000Z'),
    );
    expect(leap.toDays()).toBe(2);
    const notLeap = new Timespan(
      new Date('2100-02-28T00:00:00.000Z'),
      new Date('2100-03-01T00:00:00.000Z'),
    );
    expect(notLeap.toDays()).toBe(1);
  });

  it('decomposes 366 days across a non-leap year boundary as 1y 1d', () => {
    const start = new Date('2023-01-01T00:00:00.000Z');
    const ts = new Timespan(start, new Date(start.getTime() + 366 * 86400000));
    expect(ts.toString()).toBe('1y 1d');
  });

  it('decomposes exactly 8 days as 1w 1d', () => {
    const ts = Timespan.fromDays(8, START);
    expect(ts.toString()).toBe('1w 1d');
  });

  it('decomposes exactly 7 days as 1w', () => {
    const ts = Timespan.fromDays(7, START);
    expect(ts.toString()).toBe('1w');
  });
});

describe('edge: fromUnits and conversions', () => {
  it('creates a zero span from zero units', () => {
    expect(Timespan.fromDays(0, START).toMilliseconds()).toBe(0);
    expect(Timespan.fromMilliseconds(0, START).toMilliseconds()).toBe(0);
  });

  it('supports fractional fixed-length units', () => {
    expect(Timespan.fromHours(1.5, START).toMilliseconds()).toBe(5400000);
    expect(Timespan.fromDays(1.5, START).toHours()).toBe(36);
    expect(Timespan.fromMinutes(0.25, START).toSeconds()).toBe(15);
  });

  it('documents that unit conversions floor to whole units', () => {
    const halfWeek = Timespan.fromWeeks(0.5, START); // exactly 3.5 days long
    expect(halfWeek.toMilliseconds()).toBe(302400000);
    expect(halfWeek.toDays()).toBe(3);
  });

  it('documents fractional months: 0.5 months currently truncates to none', () => {
    const ts = Timespan.fromMonths(0.5, START);
    expect(ts.end.toISOString()).toBe(START.toISOString());
  });

  it('round-trips large day counts', () => {
    const ts = Timespan.fromDays(365000, START);
    expect(ts.toDays()).toBe(365000);
  });

  it('throws for negative amounts in every factory', () => {
    expect(() => Timespan.fromMilliseconds(-1, START)).toThrow();
    expect(() => Timespan.fromSeconds(-1, START)).toThrow();
    expect(() => Timespan.fromMinutes(-1, START)).toThrow();
    expect(() => Timespan.fromHours(-1, START)).toThrow();
    expect(() => Timespan.fromDays(-1, START)).toThrow();
    expect(() => Timespan.fromWeeks(-1, START)).toThrow();
    expect(() => Timespan.fromMonths(-1, START)).toThrow();
    expect(() => Timespan.fromYears(-1, START)).toThrow();
  });

  it('throws for an invalid unit passed to fromUnits / toUnit', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => Timespan.fromUnits(1, 'fortnights' as any, START)).toThrow();
    const ts = Timespan.fromDays(1, START);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => ts.toUnit('fortnights' as any)).toThrow();
  });

  it('agrees across factories for equivalent spans', () => {
    const a = Timespan.fromWeeks(2, START);
    const b = Timespan.fromDays(14, START);
    const c = Timespan.fromHours(336, START);
    const d = Timespan.fromMinutes(20160, START);
    expect(a.toMilliseconds()).toBe(b.toMilliseconds());
    expect(b.toMilliseconds()).toBe(c.toMilliseconds());
    expect(c.toMilliseconds()).toBe(d.toMilliseconds());
  });

  it('floors sub-unit remainders consistently', () => {
    const ts = Timespan.fromMilliseconds(90061, START); // 1m 30s 61ms
    expect(ts.toSeconds()).toBe(90);
    expect(ts.toMinutes()).toBe(1);
    expect(ts.toTimeframe()).toEqual({
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 30,
      milliseconds: 61,
    });
  });
});

describe('edge: equals and compareTo', () => {
  const a = Timespan.fromDays(2, new Date('2023-01-01T00:00:00.000Z'));
  const b = Timespan.fromDays(2, new Date('2024-05-05T00:00:00.000Z'));
  const c = Timespan.fromDays(3, new Date('2023-01-01T00:00:00.000Z'));

  it('compares by duration by default', () => {
    expect(a.equals(b)).toBe(true);
    expect(Timespan.equals(a, b)).toBe(true);
  });

  it('compares by range when asked', () => {
    expect(a.equals(b, 'range')).toBe(false);
    expect(a.equals(a, 'range')).toBe(true);
    expect(Timespan.equals(a, b, 'range')).toBe(false);
  });

  it('orders by duration with a -1 / 0 / 1 contract', () => {
    expect(a.compareTo(c)).toBe(-1);
    expect(c.compareTo(a)).toBe(1);
    expect(a.compareTo(b)).toBe(0);
    expect(Timespan.compareTo(a, c)).toBe(-1);
    expect(Timespan.compareTo(c, a)).toBe(1);
  });

  it('is antisymmetric: compareTo(x, y) === -compareTo(y, x)', () => {
    const rand = mulberry32(42);
    for (let i = 0; i < 50; i++) {
      const x = Timespan.fromMilliseconds(Math.floor(rand() * 1e9), START);
      const y = Timespan.fromMilliseconds(Math.floor(rand() * 1e9), START);
      // Use === via expect on the sum to avoid -0 pitfalls in toBe.
      expect(x.compareTo(y) + y.compareTo(x)).toBe(0);
      expect(x.equals(y)).toBe(x.compareTo(y) === 0);
    }
  });
});

describe('fuzz: sub-month durations (deterministic)', () => {
  const rand = mulberry32(20261103);
  const MS = {
    weeks: 604800000,
    days: 86400000,
    hours: 3600000,
    minutes: 60000,
    seconds: 1000,
  };

  it('preserves total milliseconds and floors every fixed unit', () => {
    for (let i = 0; i < 250; i++) {
      // Mid-year starts avoid the known year-boundary defect, which has
      // dedicated tests above; this loop guards everything else.
      const start = new Date(
        Date.UTC(2021 + Math.floor(rand() * 3), 5, 15) +
          Math.floor(rand() * 86400000),
      );
      const offset = Math.floor(rand() * 27 * 86400000);
      const ts = new Timespan(start, new Date(start.getTime() + offset));
      expect(ts.toMilliseconds()).toBe(offset);
      expect(ts.toSeconds()).toBe(Math.floor(offset / MS.seconds));
      expect(ts.toMinutes()).toBe(Math.floor(offset / MS.minutes));
      expect(ts.toHours()).toBe(Math.floor(offset / MS.hours));
      expect(ts.toDays()).toBe(Math.floor(offset / MS.days));
      expect(ts.toWeeks()).toBe(Math.floor(offset / MS.weeks));
    }
  });

  it('decomposes into a timeframe that recomposes to the same duration', () => {
    for (let i = 0; i < 250; i++) {
      const start = new Date(
        Date.UTC(2021 + Math.floor(rand() * 3), 5, 15) +
          Math.floor(rand() * 86400000),
      );
      const offset = Math.floor(rand() * 27 * 86400000);
      const ts = new Timespan(start, new Date(start.getTime() + offset));
      const tf = ts.toTimeframe();
      expect(tf.years).toBe(0);
      expect(tf.months).toBe(0);
      const recomposed =
        tf.weeks * MS.weeks +
        tf.days * MS.days +
        tf.hours * MS.hours +
        tf.minutes * MS.minutes +
        tf.seconds * MS.seconds +
        tf.milliseconds;
      expect(recomposed).toBe(offset);
    }
  });

  it('round-trips through toString and fromString', () => {
    for (let i = 0; i < 250; i++) {
      const start = new Date(
        Date.UTC(2021 + Math.floor(rand() * 3), 5, 15) +
          Math.floor(rand() * 86400000),
      );
      const offset = 1 + Math.floor(rand() * 27 * 86400000);
      const ts = new Timespan(start, new Date(start.getTime() + offset));
      const parsed = Timespan.fromString(ts.toString(), start);
      expect(parsed.toMilliseconds()).toBe(offset);
    }
  });
});

describe('fuzz: generated duration strings (deterministic)', () => {
  const UNITS: Array<[string, string]> = [
    ['y', 'years'],
    ['M', 'months'],
    ['w', 'weeks'],
    ['d', 'days'],
    ['h', 'hours'],
    ['m', 'minutes'],
    ['s', 'seconds'],
    ['ms', 'milliseconds'],
  ];

  it('parses well-formed strings deterministically and never goes backwards', () => {
    const rand = mulberry32(777);
    for (let i = 0; i < 200; i++) {
      const parts: string[] = [];
      const used = new Set<number>();
      const count = 1 + Math.floor(rand() * 4);
      for (let j = 0; j < count; j++) {
        const idx = Math.floor(rand() * UNITS.length);
        if (used.has(idx)) continue;
        used.add(idx);
        parts.push(`${1 + Math.floor(rand() * 50)}${UNITS[idx][0]}`);
      }
      const input = parts.join(' ');
      const first = Timespan.fromString(input, START);
      const second = Timespan.fromString(input, START);
      expect(first.end.getTime()).toBe(second.end.getTime());
      expect(first.end.getTime()).toBeGreaterThan(START.getTime());
      expect(first.toMilliseconds()).toBe(
        first.end.getTime() - START.getTime(),
      );
    }
  });

  it('survives interleaved failures without corrupting later parses', () => {
    const rand = mulberry32(31337);
    for (let i = 0; i < 100; i++) {
      const good = `${1 + Math.floor(rand() * 90)}d`;
      expect(Timespan.fromString(good, START).toDays()).toBeGreaterThan(0);
      expect(() => Timespan.fromString('1h 2bogus', START)).toThrow();
      const again = Timespan.fromString(good, START);
      expect(again.toMilliseconds()).toBe(
        Timespan.fromString(good, START).toMilliseconds(),
      );
    }
  });
});
