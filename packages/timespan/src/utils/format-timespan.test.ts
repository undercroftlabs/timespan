import { Timespan } from '../timespan';
import { formatTimespan } from './format-timespan';

/**
 * Width and precision from 0 through this value must be accepted.
 * 1_000_000 and above must be rejected. Limits in between are not specified.
 */
const maxAcceptedField = 64;

/**
 * Width or precision at or above this value must be rejected.
 */
const minimumRejectedField = 1_000_000;

/**
 * 2 weeks, 3 days, 4 hours, 5 minutes, 6 seconds, and 123 milliseconds.
 * Totals use the library's floored fixed-unit conversions.
 */
const workedElapsed = 1_483_506_123;

const workedTotals = {
  Y: '0',
  B: '0',
  W: '2',
  D: '17',
  H: '412',
  M: '24725',
  S: '1483506',
  L: '1483506123',
} as const;

const workedComponents = {
  y: '0',
  b: '0',
  w: '2',
  d: '3',
  h: '4',
  m: '5',
  s: '6',
  l: '123',
  f: '123',
} as const;

const supportedSpecifiers = new Set([
  ...'YBW DHMSL'.replaceAll(' ', ''),
  ...'ybwdhmslf',
]);

/**
 * Asserts that `formatTimespan` returns the expected text.
 * @param timespan - Timespan being formatted.
 * @param formatString - Caller-supplied format string.
 * @param expected - Exact formatted text.
 * @returns Nothing.
 */
function expectFormat(
  timespan: Timespan,
  formatString: string,
  expected: string,
): void {
  expect(formatTimespan(formatString, timespan)).toBe(expected);
}

/**
 * Asserts that `formatTimespan` rejects a directive with TypeError.
 * @param timespan - Timespan passed to the formatter.
 * @param formatString - Malformed format string.
 * @param message - Pattern the TypeError message must match.
 * @returns Nothing.
 */
function expectFormatError(
  timespan: Timespan,
  formatString: string,
  message: RegExp,
): void {
  expect(() => formatTimespan(formatString, timespan)).toThrow(TypeError);
  expect(() => formatTimespan(formatString, timespan)).toThrow(message);
}

/**
 * Builds a timespan from an exact elapsed millisecond count.
 * @param elapsed - Nonnegative duration in milliseconds.
 * @param start - Range start. Defaults to 2023-06-01T00:00:00.000Z.
 * @returns The timespan covering that elapsed duration.
 */
function spanOf(
  elapsed: number,
  start = new Date('2023-06-01T00:00:00.000Z'),
): Timespan {
  return new Timespan(start, new Date(start.getTime() + elapsed));
}

/**
 * Asserts that total specifiers match the existing conversion methods.
 * @param timespan - Timespan whose totals are checked.
 * @returns Nothing.
 */
function expectTotalsMatchConversions(timespan: Timespan): void {
  const totals = {
    Y: timespan.toYears(),
    B: timespan.toMonths(),
    W: timespan.toWeeks(),
    D: timespan.toDays(),
    H: timespan.toHours(),
    M: timespan.toMinutes(),
    S: timespan.toSeconds(),
    L: timespan.toMilliseconds(),
  };
  for (const [specifier, value] of Object.entries(totals)) {
    expectFormat(timespan, `%${specifier}`, String(value));
    expect(formatTimespan(`%${specifier}`, timespan)).not.toMatch(/e\+|e-/i);
  }
}

/**
 * Asserts that component specifiers match `toTimeframe()` with no extra padding.
 * @param timespan - Timespan whose components are checked.
 * @returns Nothing.
 */
function expectComponentsMatchTimeframe(timespan: Timespan): void {
  const frame = timespan.toTimeframe();
  const components = {
    y: frame.years,
    b: frame.months,
    w: frame.weeks,
    d: frame.days,
    h: frame.hours,
    m: frame.minutes,
    s: frame.seconds,
    l: frame.milliseconds,
  };
  for (const [specifier, value] of Object.entries(components)) {
    expectFormat(timespan, `%${specifier}`, String(value));
  }
}

describe('formatTimespan', () => {
  const origin = new Date('2023-06-01T00:00:00.000Z');
  const worked = spanOf(workedElapsed, origin);
  const fiveHours = Timespan.fromHours(5, origin);
  const zero = new Timespan(origin, new Date(origin.getTime()));

  describe('side effects', () => {
    it('does not change the timespan, its dates, or the format string', () => {
      const formatString = '  %D days  ';
      const start = worked.start.toISOString();
      const end = worked.end.toISOString();
      const text = worked.toString();
      const frame = worked.toTimeframe();
      const elapsed = worked.toMilliseconds();

      expectFormat(worked, formatString, '  17 days  ');

      expect(formatString).toBe('  %D days  ');
      expect(worked.start.toISOString()).toBe(start);
      expect(worked.end.toISOString()).toBe(end);
      expect(worked.toString()).toBe(text);
      expect(worked.toTimeframe()).toEqual(frame);
      expect(worked.toMilliseconds()).toBe(elapsed);
      expect(worked.toString()).toBe('2w 3d 4h 5m 6s 123ms');
    });

    it('leaves the timespan unchanged when the format string is invalid', () => {
      const start = worked.start.toISOString();
      const end = worked.end.toISOString();
      const text = worked.toString();
      const frame = worked.toTimeframe();

      expectFormatError(worked, '%Q', /%Q/);

      expect(worked.start.toISOString()).toBe(start);
      expect(worked.end.toISOString()).toBe(end);
      expect(worked.toString()).toBe(text);
      expect(worked.toTimeframe()).toEqual(frame);
    });

    it('does not let formatting one timespan affect another', () => {
      expectFormat(worked, '%D', '17');
      expectFormat(fiveHours, '%h', '5');
      expectFormat(zero, '%h', '0');
    });

    it('returns the same text on repeated calls', () => {
      const formatString = 'Time remaining: %h:%02m:%02s';
      expect(formatTimespan(formatString, worked)).toBe(
        formatTimespan(formatString, worked),
      );
      expectFormat(worked, formatString, 'Time remaining: 4:05:06');
    });
  });

  describe('worked examples', () => {
    it.each([
      ['%D days', '17 days'],
      ['%w weeks and %d days', '2 weeks and 3 days'],
      ['%H total hours', '412 total hours'],
      ['Time remaining: %h:%02m:%02s', 'Time remaining: 4:05:06'],
      ['You have %D days remaining!', 'You have 17 days remaining!'],
      ['%s.%f seconds', '6.123 seconds'],
      ['%.1f', '1'],
      ['%L milliseconds', '1483506123 milliseconds'],
      ['%% complete', '% complete'],
      ['No substitutions here.', 'No substitutions here.'],
    ])('formats %j as %j', (formatString, expected) => {
      expectFormat(worked, formatString, expected);
    });

    it('does not pluralize or correct the caller text', () => {
      const timespan = spanOf(25 * 3_600_000);
      expect(timespan.toTimeframe()).toMatchObject({ days: 1, hours: 1 });
      expectFormat(timespan, '%d days and %h hours', '1 days and 1 hours');
    });
  });

  describe('time-unit specifiers', () => {
    it.each(Object.entries(workedTotals))(
      'formats total %%%s as %s',
      (specifier, expected) => {
        expectFormat(worked, `%${specifier}`, expected);
      },
    );

    it.each(Object.entries(workedComponents))(
      'formats component %%%s as %s',
      (specifier, expected) => {
        expectFormat(worked, `%${specifier}`, expected);
      },
    );

    it('reports every supported specifier on one string', () => {
      expectFormat(
        worked,
        '%Y %y %B %b %W %w %D %d %H %h %M %m %S %s %L %l %f',
        '0 0 0 0 2 2 17 3 412 4 24725 5 1483506 6 1483506123 123 123',
      );
    });

    it('distinguishes totals from components', () => {
      expect(formatTimespan('%D', worked)).not.toBe(
        formatTimespan('%d', worked),
      );
      expect(formatTimespan('%H', worked)).not.toBe(
        formatTimespan('%h', worked),
      );
      expect(formatTimespan('%M', worked)).not.toBe(
        formatTimespan('%m', worked),
      );
      expect(formatTimespan('%S', worked)).not.toBe(
        formatTimespan('%s', worked),
      );
      expect(formatTimespan('%L', worked)).not.toBe(
        formatTimespan('%l', worked),
      );
      expectFormat(worked, '%D/%d %H/%h %M/%m', '17/3 412/4 24725/5');
    });

    it('uses floored totals for 2 weeks, 3 days, and 4 hours', () => {
      const timespan = spanOf(2 * 604_800_000 + 3 * 86_400_000 + 4 * 3_600_000);
      expectFormat(timespan, '%D', '17');
      expectFormat(timespan, '%H', '412');
      expectFormat(timespan, '%M', '24720');
    });

    it('matches toUnit and toTimeframe for several durations', () => {
      const calendar = Timespan.fromString(
        '1y 2M 3w 4d 5h 6m 7s 8ms',
        new Date(Date.UTC(2000, 0, 1)),
      );
      for (const timespan of [worked, fiveHours, zero, calendar, spanOf(1)]) {
        expectTotalsMatchConversions(timespan);
        expectComponentsMatchTimeframe(timespan);
      }
    });

    it('prints a large millisecond total in decimal digits', () => {
      const timespan = Timespan.fromString(
        '1y 2M 3w 4d 5h 6m 7s 8ms',
        new Date(Date.UTC(2000, 0, 1)),
      );
      expect(timespan.toMilliseconds()).toBe(38_898_367_008);
      expectFormat(timespan, '%L', '38898367008');
      expectFormat(timespan, '%.2L', '38898367008');
    });

    it('treats a length-modifier lookalike as a specifier plus literal text', () => {
      expectFormat(worked, '%ll', '123l');
      expectFormat(worked, '%hh', '4h');
      expectFormat(worked, '%hhd', '4hd');
    });

    it.each([...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'])(
      'accepts or rejects specifier %s',
      (letter) => {
        const directive = `%${letter}`;
        if (supportedSpecifiers.has(letter)) {
          const expected =
            workedTotals[letter as keyof typeof workedTotals] ??
            workedComponents[letter as keyof typeof workedComponents];
          expectFormat(worked, directive, expected);
          return;
        }
        expectFormatError(worked, directive, new RegExp(`%${letter}`));
      },
    );
  });

  describe('fractional seconds', () => {
    it.each([
      ['%f', '123'],
      ['%.0f', ''],
      ['%.1f', '1'],
      ['%.2f', '12'],
      ['%.3f', '123'],
      ['%.4f', '1230'],
      ['%.6f', '123000'],
    ])('formats 123 milliseconds with %s', (formatString, expected) => {
      expectFormat(spanOf(123), formatString, expected);
    });

    it.each([
      ['%f', '007'],
      ['%.1f', '0'],
      ['%.2f', '00'],
      ['%.3f', '007'],
      ['%.6f', '007000'],
    ])('formats 7 milliseconds with %s', (formatString, expected) => {
      expectFormat(spanOf(7), formatString, expected);
    });

    it.each([
      [199, '%.1f', '1'],
      [199, '%.2f', '19'],
      [999, '%.1f', '9'],
      [999, '%.2f', '99'],
      [999, '%.3f', '999'],
      [999, '%.4f', '9990'],
      [950, '%.1f', '9'],
      [950, '%.2f', '95'],
      [5, '%f', '005'],
      [5, '%.1f', '0'],
      [5, '%.2f', '00'],
      [50, '%.1f', '0'],
      [50, '%.2f', '05'],
      [0, '%f', '000'],
      [0, '%.0f', ''],
      [0, '%.6f', '000000'],
    ])(
      'truncates %i milliseconds with %s instead of rounding',
      (milliseconds, formatString, expected) => {
        expectFormat(spanOf(milliseconds), formatString, expected);
      },
    );

    it('does not insert a decimal point', () => {
      expectFormat(spanOf(123), '%s.%f', '0.123');
      expectFormat(spanOf(123), '%f', '123');
      expect(formatTimespan('%f', spanOf(123))).not.toContain('.');
    });

    it('applies width, zero padding, and justification to the digit string', () => {
      const timespan = spanOf(7);
      expectFormat(timespan, '%5f', '  007');
      expectFormat(timespan, '%05f', '00007');
      expectFormat(timespan, '%-5f', '007  ');
      expectFormat(timespan, '%-05f', '007  ');
      expectFormat(timespan, '%8.6f', '  007000');
      expectFormat(timespan, '%08.6f', '00007000');
      expectFormat(timespan, '%+f', '+007');
      expectFormat(timespan, '% f', ' 007');
      expectFormat(timespan, '%+.0f', '+');
      expectFormat(timespan, '%5.0f', '     ');
    });
  });

  describe('flags, width, and precision', () => {
    it.each([
      ['%h', '5'],
      ['%2h', ' 5'],
      ['%5h', '    5'],
      ['%05h', '00005'],
      ['%-5h', '5    '],
      ['%+5h', '   +5'],
      ['%+05h', '+0005'],
      ['%+h', '+5'],
      ['% h', ' 5'],
      ['% 2h', ' 5'],
      ['% 5h', '    5'],
      ['%- 5h', ' 5   '],
      ['%.2h', '05'],
      ['%.4h', '0005'],
      ['%6.3h', '   005'],
      ['%06.3h', '   005'],
      ['%+6.3h', '  +005'],
      ['%+06.3h', '  +005'],
      ['%-+6.3h', '+005  '],
      ['%+-6.3h', '+005  '],
      ['%-+06.3h', '+005  '],
      ['%0-6h', '5     '],
      ['%-06h', '5     '],
      ['%-0+5h', '+5   '],
      ['%+ -6h', '+5    '],
      ['%  +6h', '    +5'],
      ['%++h', '+5'],
      ['%--6h', '5     '],
      ['%000000h', '5'],
      ['%00h', '5'],
      ['%010h', '0000000005'],
      ['%00010h', '0000000005'],
      ['%.03h', '005'],
      ['%.00h', '5'],
      ['%1.1h', '5'],
      ['%2.5h', '00005'],
      ['%10.5h', '     00005'],
      ['%+05.0h', '    +'],
      ['%05.0h', '     '],
    ])('formats 5 hours with %s', (formatString, expected) => {
      expectFormat(fiveHours, formatString, expected);
    });

    it('includes the sign in the field width', () => {
      expect(formatTimespan('%+5h', fiveHours)).toHaveLength(5);
      expect(formatTimespan('%+05h', fiveHours)).toHaveLength(5);
      expect(formatTimespan('% 5h', fiveHours)).toHaveLength(5);
      expectFormat(fiveHours, '%+5h', '   +5');
    });

    it('lets the minus flag override zero padding', () => {
      expectFormat(fiveHours, '%-010h', '5         ');
      expectFormat(fiveHours, '%0-10h', '5         ');
    });

    it('lets the plus flag override the space flag', () => {
      expectFormat(fiveHours, '%+ h', '+5');
      expectFormat(fiveHours, '% +h', '+5');
      expectFormat(fiveHours, '%+ 05h', '+0005');
    });

    it('lets integer precision override the zero flag', () => {
      expectFormat(fiveHours, '%06.3h', '   005');
      expectFormat(fiveHours, '%+08.3h', '    +005');
      expect(formatTimespan('%06.3h', fiveHours)).not.toBe('000005');
    });

    it('does not truncate integer digits that exceed precision or width', () => {
      expectFormat(worked, '%.2D', '17');
      expectFormat(worked, '%1D', '17');
      expectFormat(worked, '%.2H', '412');
      expectFormat(worked, '%05D', '00017');
    });

    it('treats repeated flags as a single flag', () => {
      expectFormat(fiveHours, '%++++h', '+5');
      expectFormat(fiveHours, '%+h', '+5');
      expectFormat(fiveHours, '%----6h', '5     ');
      expectFormat(fiveHours, '%-6h', '5     ');
      expectFormat(fiveHours, '%    h', ' 5');
      expectFormat(fiveHours, '% h', ' 5');
      expectFormat(fiveHours, '%0000h', '5');
      expectFormat(fiveHours, '%0h', '5');
    });

    it('accepts width and precision at the documented maximum', () => {
      expectFormat(
        fiveHours,
        `%${maxAcceptedField}h`,
        `${' '.repeat(maxAcceptedField - 1)}5`,
      );
      expectFormat(
        fiveHours,
        `%.${maxAcceptedField}h`,
        `${'0'.repeat(maxAcceptedField - 1)}5`,
      );
      expectFormat(
        spanOf(123),
        `%.${maxAcceptedField}f`,
        `123${'0'.repeat(maxAcceptedField - 3)}`,
      );
    });
  });

  describe('zero durations', () => {
    it.each([
      ['%D days, %h hours', '0 days, 0 hours'],
      ['%02h:%02m:%02s', '00:00:00'],
      ['%s.%f', '0.000'],
      ['%Y%y%B%b%W%w%D%d%H%h%M%m%S%s%L%l', '0000000000000000'],
      ['%f', '000'],
      ['%+h', '+0'],
      ['% h', ' 0'],
      ['%.0h', ''],
      ['%.4h', '0000'],
      ['%5.0h', '     '],
      ['%+5.0h', '    +'],
      ['%+.0h', '+'],
      ['% .0h', ' '],
      ['%05.0h', '     '],
    ])('formats a zero span with %s', (formatString, expected) => {
      expectFormat(zero, formatString, expected);
    });

    it('does not omit a zero unit beside a nonzero unit', () => {
      expectFormat(fiveHours, '%Y years %h hours', '0 years 5 hours');
      expectFormat(
        worked,
        '%m minutes and %b months',
        '5 minutes and 0 months',
      );
    });
  });

  describe('literal text and escaping', () => {
    it.each([
      ['', ''],
      ['Remaining time: %D days!', 'Remaining time: 17 days!'],
      [
        'Progress: 50%% complete. %H hours left.',
        'Progress: 50% complete. 412 hours left.',
      ],
      ['%%', '%'],
      ['%%%%', '%%'],
      ['%%%D', '%17'],
      ['%%D', '%D'],
      ['%D%%', '17%'],
      ['100%%', '100%'],
      ['%%100', '%100'],
      ['%h%m%s', '456'],
      ['  %h  ', '  4  '],
      ['%h   ', '4   '],
      ['a\tb\n%h', 'a\tb\n4'],
      ['line1\\nline2 %h', 'line1\\nline2 4'],
      ['剩余 %D 天', '剩余 17 天'],
      ['⏳%D', '⏳17'],
      ['days hours months 12', 'days hours months 12'],
      ['1.5h', '1.5h'],
      ['No substitutions here.', 'No substitutions here.'],
    ])('preserves literal text in %j', (formatString, expected) => {
      expectFormat(worked, formatString, expected);
    });

    it('preserves a long literal around one specifier', () => {
      const literal = 'x'.repeat(5_000);
      expectFormat(worked, `${literal}%D${literal}`, `${literal}17${literal}`);
    });

    it('allows the same specifier any number of times in any order', () => {
      expectFormat(worked, '%D %D %D', '17 17 17');
      expectFormat(worked, '%l then %Y then %l', '123 then 0 then 123');
      expectFormat(worked, '%s%m%h%d%w%b%y', '6543200');
    });

    it('preserves an embedded newline and does not collapse spaces', () => {
      expectFormat(worked, '%h\n%h', '4\n4');
      expectFormat(worked, '%h  %h', '4  4');
      expect(formatTimespan('  %h  ', worked)).toBe('  4  ');
    });
  });

  describe('invalid directives', () => {
    it.each([
      ['%Q', /%Q/],
      ['cost %Q dollars', /%Q/],
      ['%5Q', /%5Q/],
      ['%05', /%05/],
      ['%.', /%\./],
      ['%2.', /%2\./],
      ['%.h', /%\./],
      ['%5.h', /%5\./],
      ['%2.3', /%2\.3/],
      ['%.2', /%\.2/],
      ['%*', /%\*/],
      ['%#5h', /%#/],
      ['%5 h', /%5 /],
      ['%2-h', /%2-/],
      ['%.+2h', /%\.\+2h/],
      ['%.-2h', /%\.-2h/],
      ['%5.2.3h', /%5\.2\.3h/],
    ])('rejects %j', (formatString, message) => {
      expectFormatError(worked, formatString, message);
    });

    it('rejects a trailing percent and reports its position', () => {
      expectFormatError(worked, '%', /index 0|position 0/i);
      expectFormatError(worked, 'ab%', /index 2|position 2/i);
      expectFormatError(worked, '%%%', /index 2|position 2/i);
    });

    it('rejects a percent that begins an unknown directive in ordinary prose', () => {
      expectFormatError(worked, '100 % complete', /% complete|% c/);
      expectFormat(worked, '100%% complete', '100% complete');
    });

    it('rejects a percent followed by whitespace that is not the space flag', () => {
      expectFormatError(worked, '%\n', /%/);
      expectFormatError(worked, '%\t', /%/);
    });

    it('rejects a width or precision at or above the documented ceiling', () => {
      expectFormatError(
        fiveHours,
        `%${minimumRejectedField}h`,
        new RegExp(`%${minimumRejectedField}`),
      );
      expectFormatError(
        fiveHours,
        `%.${minimumRejectedField}f`,
        new RegExp(`%\\.${minimumRejectedField}`),
      );
      expectFormatError(
        fiveHours,
        `%0${minimumRejectedField}h`,
        new RegExp(`%0${minimumRejectedField}`),
      );
      expectFormatError(fiveHours, `%${'9'.repeat(80)}h`, /%9{80}/);
    });

    it('still rejects one bad directive when earlier directives are valid', () => {
      expectFormatError(worked, 'ok %h %Q', /%Q/);
      expect(worked.toString()).toBe('2w 3d 4h 5m 6s 123ms');
    });
  });

  describe('calendar-aware totals', () => {
    it('does not count 365 days in a leap year as one year', () => {
      const timespan = Timespan.fromDays(
        365,
        new Date('2024-01-01T00:00:00.000Z'),
      );
      expect(timespan.toYears()).toBe(0);
      expect(timespan.toDays()).toBe(365);
      expectFormat(timespan, '%Y', '0');
      expectFormat(timespan, '%D', '365');
      expectFormat(timespan, '%y', String(timespan.toTimeframe().years));
    });

    it('counts a year only when the anniversary has been reached', () => {
      const start = new Date('2022-06-15T00:00:00.000Z');
      const before = new Timespan(start, new Date('2023-06-14T00:00:00.000Z'));
      const anniversary = new Timespan(
        start,
        new Date('2023-06-15T00:00:00.000Z'),
      );
      expectFormat(before, '%Y', '0');
      expectFormat(anniversary, '%Y', '1');
      expectFormat(before, '%Y', String(before.toYears()));
      expectFormat(anniversary, '%y', String(anniversary.toTimeframe().years));
    });

    it('does not count a month from 30 elapsed days', () => {
      const start = new Date('2023-01-15T12:00:00.000Z');
      const almost = new Timespan(start, new Date('2023-02-15T11:00:00.000Z'));
      const full = new Timespan(start, new Date('2023-02-15T12:00:00.000Z'));
      expect(almost.toDays()).toBeGreaterThanOrEqual(30);
      expect(almost.toMonths()).toBe(0);
      expect(full.toMonths()).toBe(1);
      expectFormat(almost, '%B', '0');
      expectFormat(full, '%B', '1');
      expectFormat(almost, '%D', String(almost.toDays()));
      expectFormat(full, '%b', String(full.toTimeframe().months));
    });

    it('counts the clamped January 31 month as the converter does', () => {
      const timespan = Timespan.fromMonths(
        1,
        new Date('2023-01-31T00:00:00.000Z'),
      );
      expect(timespan.end.toISOString()).toBe('2023-02-28T00:00:00.000Z');
      expect(timespan.toDays()).toBe(28);
      expectFormat(timespan, '%B', String(timespan.toMonths()));
      expectFormat(timespan, '%b', String(timespan.toTimeframe().months));
      expectFormat(timespan, '%D', '28');
    });

    it('formats the leap-day and common-year February spans in days', () => {
      const leap = new Timespan(
        new Date('2000-02-28T00:00:00.000Z'),
        new Date('2000-03-01T00:00:00.000Z'),
      );
      const common = new Timespan(
        new Date('2100-02-28T00:00:00.000Z'),
        new Date('2100-03-01T00:00:00.000Z'),
      );
      expectFormat(leap, '%D', '2');
      expectFormat(common, '%D', '1');
      expectFormat(leap, '%d', String(leap.toTimeframe().days));
      expectFormat(common, '%d', String(common.toTimeframe().days));
    });

    it('matches the year and day components of 366 days across a non-leap boundary', () => {
      const start = new Date('2023-01-01T00:00:00.000Z');
      const timespan = new Timespan(
        start,
        new Date(start.getTime() + 366 * 86_400_000),
      );
      expect(timespan.toString()).toBe('1y 1d');
      expectFormat(timespan, '%y years %d days', '1 years 1 days');
      expectFormat(timespan, '%Y', String(timespan.toYears()));
      expectFormat(timespan, '%D', String(timespan.toDays()));
    });
  });
});
