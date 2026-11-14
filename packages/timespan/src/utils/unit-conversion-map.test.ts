import { TimeUnit } from '../types/time-unit';
import { getConverter, getTimeUnits } from './unit-conversion-map';

const invalidTimeUnit = 'Invalid time unit: expected a recognized time unit.';

const registeredUnits: TimeUnit[] = [
  'years',
  'year',
  'yrs',
  'yr',
  'y',
  'months',
  'month',
  'mos',
  'mo',
  'M',
  'w',
  'wk',
  'wks',
  'week',
  'weeks',
  'day',
  'days',
  'dys',
  'dy',
  'd',
  'hours',
  'hour',
  'hrs',
  'hr',
  'h',
  'minutes',
  'minute',
  'mins',
  'min',
  'm',
  'seconds',
  'second',
  'secs',
  'sec',
  's',
  'milliseconds',
  'millisecond',
  'msec',
  'mss',
  'ms',
];

describe('unit conversion map', () => {
  describe('getTimeUnits', () => {
    it('lists every alias once, in registration order', () => {
      expect(getTimeUnits()).toEqual(registeredUnits);
      expect(new Set(getTimeUnits()).size).toBe(registeredUnits.length);
    });

    it('returns the same aliases on a later call', () => {
      expect(getTimeUnits()).toEqual(getTimeUnits());
    });

    it('returns a list that does not share the registry', () => {
      const before = [...getTimeUnits()];
      const units = getTimeUnits();
      const dayIndex = units.indexOf('day');

      units.push('fortnight' as TimeUnit);
      units.splice(dayIndex, 1);
      units.reverse();

      try {
        expect(getTimeUnits()).toEqual(before);
        expect(getConverter('day').plural).toBe('days');
        expect(() => getConverter('fortnight' as TimeUnit)).toThrow(
          new Error(invalidTimeUnit),
        );
      } finally {
        const live = getTimeUnits();
        live.splice(0, live.length, ...before);
      }
    });
  });

  describe('getConverter', () => {
    describe('accepted units', () => {
      test.each`
        label              | unit              | plural            | abbreviation | start                         | end                           | count
        ${'year word'}     | ${'year'}         | ${'years'}        | ${'y'}       | ${'2022-06-15T00:00:00.000Z'} | ${'2023-06-15T00:00:00.000Z'} | ${1}
        ${'years word'}    | ${'years'}        | ${'years'}        | ${'y'}       | ${'2022-06-15T00:00:00.000Z'} | ${'2023-06-15T00:00:00.000Z'} | ${1}
        ${'year abbr'}     | ${'yr'}           | ${'years'}        | ${'y'}       | ${'2022-06-15T00:00:00.000Z'} | ${'2024-06-15T00:00:00.000Z'} | ${2}
        ${'years abbr'}    | ${'yrs'}          | ${'years'}        | ${'y'}       | ${'2022-06-15T00:00:00.000Z'} | ${'2023-06-15T00:00:00.000Z'} | ${1}
        ${'year letter'}   | ${'y'}            | ${'years'}        | ${'y'}       | ${'2022-06-15T00:00:00.000Z'} | ${'2023-06-15T00:00:00.000Z'} | ${1}
        ${'month word'}    | ${'month'}        | ${'months'}       | ${'M'}       | ${'2023-01-15T12:00:00.000Z'} | ${'2023-02-15T12:00:00.000Z'} | ${1}
        ${'months word'}   | ${'months'}       | ${'months'}       | ${'M'}       | ${'2023-01-15T12:00:00.000Z'} | ${'2023-03-15T12:00:00.000Z'} | ${2}
        ${'month abbr'}    | ${'mo'}           | ${'months'}       | ${'M'}       | ${'2023-01-31T00:00:00.000Z'} | ${'2023-02-28T00:00:00.000Z'} | ${1}
        ${'months abbr'}   | ${'mos'}          | ${'months'}       | ${'M'}       | ${'2023-01-15T12:00:00.000Z'} | ${'2023-02-15T12:00:00.000Z'} | ${1}
        ${'month letter'}  | ${'M'}            | ${'months'}       | ${'M'}       | ${'2023-01-15T00:00:00.000Z'} | ${'2023-01-15T00:01:00.000Z'} | ${0}
        ${'week word'}     | ${'week'}         | ${'weeks'}        | ${'w'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-08T00:00:00.000Z'} | ${1}
        ${'weeks word'}    | ${'weeks'}        | ${'weeks'}        | ${'w'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-15T00:00:00.000Z'} | ${2}
        ${'week abbr'}     | ${'wk'}           | ${'weeks'}        | ${'w'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-08T00:00:00.000Z'} | ${1}
        ${'weeks abbr'}    | ${'wks'}          | ${'weeks'}        | ${'w'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-08T00:00:00.000Z'} | ${1}
        ${'week letter'}   | ${'w'}            | ${'weeks'}        | ${'w'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-08T00:00:00.000Z'} | ${1}
        ${'day word'}      | ${'day'}          | ${'days'}         | ${'d'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-02T00:00:00.000Z'} | ${1}
        ${'days word'}     | ${'days'}         | ${'days'}         | ${'d'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-09T00:00:00.000Z'} | ${8}
        ${'day abbr'}      | ${'dy'}           | ${'days'}         | ${'d'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-02T00:00:00.000Z'} | ${1}
        ${'days abbr'}     | ${'dys'}          | ${'days'}         | ${'d'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-02T00:00:00.000Z'} | ${1}
        ${'day letter'}    | ${'d'}            | ${'days'}         | ${'d'}       | ${'1969-12-31T00:00:00.000Z'} | ${'1970-01-01T00:00:00.000Z'} | ${1}
        ${'hour word'}     | ${'hour'}         | ${'hours'}        | ${'h'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T01:00:00.000Z'} | ${1}
        ${'hours word'}    | ${'hours'}        | ${'hours'}        | ${'h'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T03:00:00.000Z'} | ${3}
        ${'hour abbr'}     | ${'hr'}           | ${'hours'}        | ${'h'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T01:00:00.000Z'} | ${1}
        ${'hours abbr'}    | ${'hrs'}          | ${'hours'}        | ${'h'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T01:00:00.000Z'} | ${1}
        ${'hour letter'}   | ${'h'}            | ${'hours'}        | ${'h'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T01:00:00.000Z'} | ${1}
        ${'minute word'}   | ${'minute'}       | ${'minutes'}      | ${'m'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:01:00.000Z'} | ${1}
        ${'minutes word'}  | ${'minutes'}      | ${'minutes'}      | ${'m'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:02:00.000Z'} | ${2}
        ${'minute abbr'}   | ${'min'}          | ${'minutes'}      | ${'m'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:01:00.000Z'} | ${1}
        ${'minutes abbr'}  | ${'mins'}         | ${'minutes'}      | ${'m'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:01:00.000Z'} | ${1}
        ${'minute letter'} | ${'m'}            | ${'minutes'}      | ${'m'}       | ${'2023-01-15T00:00:00.000Z'} | ${'2023-01-15T00:01:00.000Z'} | ${1}
        ${'second word'}   | ${'second'}       | ${'seconds'}      | ${'s'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:01.000Z'} | ${1}
        ${'seconds word'}  | ${'seconds'}      | ${'seconds'}      | ${'s'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:05.000Z'} | ${5}
        ${'second abbr'}   | ${'sec'}          | ${'seconds'}      | ${'s'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:01.000Z'} | ${1}
        ${'seconds abbr'}  | ${'secs'}         | ${'seconds'}      | ${'s'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:01.000Z'} | ${1}
        ${'second letter'} | ${'s'}            | ${'seconds'}      | ${'s'}       | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:01.000Z'} | ${1}
        ${'ms word'}       | ${'millisecond'}  | ${'milliseconds'} | ${'ms'}      | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:00.001Z'} | ${1}
        ${'mss word'}      | ${'milliseconds'} | ${'milliseconds'} | ${'ms'}      | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:00.008Z'} | ${8}
        ${'msec'}          | ${'msec'}         | ${'milliseconds'} | ${'ms'}      | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:00.001Z'} | ${1}
        ${'mss'}           | ${'mss'}          | ${'milliseconds'} | ${'ms'}      | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:00.001Z'} | ${1}
        ${'ms'}            | ${'ms'}           | ${'milliseconds'} | ${'ms'}      | ${'1970-01-01T00:00:00.000Z'} | ${'1970-01-01T00:00:00.001Z'} | ${1}
      `(
        'resolves $label to its converter',
        ({
          unit,
          plural,
          abbreviation,
          start,
          end,
          count,
        }: {
          unit: TimeUnit;
          plural: string;
          abbreviation: string;
          start: string;
          end: string;
          count: number;
        }) => {
          const converter = getConverter(unit);

          expect(converter.plural).toBe(plural);
          expect(converter.abbreviation).toBe(abbreviation);
          expect(converter.aliases).toContain(unit);
          expect(converter.between(new Date(start), new Date(end))).toBe(count);
          expect(getTimeUnits()).toContain(unit);
        },
      );
    });

    describe('aliases of one unit', () => {
      test.each`
        label            | aliases
        ${'year'}        | ${['years', 'year', 'yrs', 'yr', 'y']}
        ${'month'}       | ${['months', 'month', 'mos', 'mo', 'M']}
        ${'week'}        | ${['w', 'wk', 'wks', 'week', 'weeks']}
        ${'day'}         | ${['day', 'days', 'dys', 'dy', 'd']}
        ${'hour'}        | ${['hours', 'hour', 'hrs', 'hr', 'h']}
        ${'minute'}      | ${['minutes', 'minute', 'mins', 'min', 'm']}
        ${'second'}      | ${['seconds', 'second', 'secs', 'sec', 's']}
        ${'millisecond'} | ${['milliseconds', 'millisecond', 'msec', 'mss', 'ms']}
      `(
        'share one $label converter',
        ({ aliases }: { aliases: TimeUnit[] }) => {
          const [first, ...rest] = aliases;
          const converter = getConverter(first);

          for (const alias of rest) {
            expect(getConverter(alias)).toBe(converter);
          }
        },
      );

      it('keeps month and minute apart', () => {
        expect(getConverter('M')).not.toBe(getConverter('m'));
        expect(getConverter('M').abbreviation).toBe('M');
        expect(getConverter('m').abbreviation).toBe('m');
      });

      it('keeps millisecond apart from month and minute', () => {
        expect(getConverter('ms')).not.toBe(getConverter('M'));
        expect(getConverter('ms')).not.toBe(getConverter('m'));
      });
    });

    describe('rejected values', () => {
      const bigintValue = Function('return 1n')();

      test.each`
        label                              | value
        ${'empty string'}                  | ${''}
        ${'space'}                         | ${' '}
        ${'tab'}                           | ${'\t'}
        ${'null'}                          | ${null}
        ${'undefined'}                     | ${undefined}
        ${'zero'}                          | ${0}
        ${'positive number'}               | ${1}
        ${'NaN'}                           | ${Number.NaN}
        ${'Infinity'}                      | ${Number.POSITIVE_INFINITY}
        ${'bigint'}                        | ${bigintValue}
        ${'true'}                          | ${true}
        ${'false'}                         | ${false}
        ${'plain object'}                  | ${{}}
        ${'array'}                         | ${[]}
        ${'array containing a unit'}       | ${['d']}
        ${'String object'}                 | ${new String('day')}
        ${'symbol'}                        | ${Symbol('day')}
        ${'function'}                      | ${() => 'day'}
        ${'uppercase year letter'}         | ${'Y'}
        ${'uppercase year word'}           | ${'Year'}
        ${'uppercase years word'}          | ${'Years'}
        ${'uppercase years shout'}         | ${'YEARS'}
        ${'uppercase month word'}          | ${'Month'}
        ${'uppercase months word'}         | ${'MONTHS'}
        ${'uppercase week letter'}         | ${'W'}
        ${'uppercase day letter'}          | ${'D'}
        ${'uppercase hour letter'}         | ${'H'}
        ${'uppercase minute abbreviation'} | ${'MIN'}
        ${'uppercase second letter'}       | ${'S'}
        ${'uppercase millisecond short'}   | ${'MS'}
        ${'uppercase millisecond mss'}     | ${'MSS'}
        ${'leading space'}                 | ${' day'}
        ${'trailing space'}                | ${'day '}
        ${'internal space'}                | ${'d ay'}
        ${'leading newline'}               | ${'\nday'}
        ${'unit with a period'}            | ${'sec.'}
        ${'plural with a period'}          | ${'seconds.'}
        ${'abbreviation with a period'}    | ${'hr.'}
        ${'unknown unit'}                  | ${'x'}
        ${'unknown word'}                  | ${'unknownUnit'}
        ${'fortnight'}                     | ${'fortnight'}
        ${'quarter'}                       | ${'quarter'}
        ${'millis'}                        | ${'millis'}
        ${'millisecondes'}                 | ${'millisecondes'}
        ${'combined amount and unit'}      | ${'2d'}
        ${'unit then amount'}              | ${'d2'}
        ${'plural timeframe key typo'}     | ${'dayss'}
        ${'singular typo'}                 | ${'hou'}
        ${'minute misspelling'}            | ${'minut'}
        ${'second misspelling'}            | ${'secon'}
        ${'week misspelling'}              | ${'wek'}
        ${'month misspelling'}             | ${'mont'}
        ${'year misspelling'}              | ${'yeer'}
        ${'cyrillic lookalike day'}        | ${'\u0434'}
        ${'fullwidth d'}                   | ${'\uFF44'}
        ${'emoji'}                         | ${String.fromCodePoint(0x1f44d)}
        ${'null character'}                | ${'d\0'}
        ${'Hello'}                         | ${'Hello'}
        ${'badUnit'}                       | ${'badUnit'}
        ${'prototype key'}                 | ${'toString'}
        ${'constructor'}                   | ${'constructor'}
      `(
        'throws "Invalid time unit: expected a recognized time unit." for $label',
        ({ value }: { value: unknown }) => {
          expect(() => getConverter(value as TimeUnit)).toThrow(
            new Error(invalidTimeUnit),
          );
        },
      );
    });

    it('still resolves a known unit after rejecting an unknown one', () => {
      expect(() => getConverter('x' as TimeUnit)).toThrow(
        new Error(invalidTimeUnit),
      );
      expect(getConverter('day').abbreviation).toBe('d');
      expect(getConverter('ms').abbreviation).toBe('ms');
    });
  });
});
