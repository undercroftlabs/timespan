import { assertValidTimeUnit } from './assert-valid-time-unit';

const invalidTimeUnit = 'Invalid time unit: expected a recognized time unit.';

describe('assertValidTimeUnit', () => {
  describe('accepted units', () => {
    test.each`
      label                     | value
      ${'year letter'}          | ${'y'}
      ${'year abbreviation'}    | ${'yr'}
      ${'years abbreviation'}   | ${'yrs'}
      ${'year word'}            | ${'year'}
      ${'years word'}           | ${'years'}
      ${'month letter'}         | ${'M'}
      ${'month abbreviation'}   | ${'mo'}
      ${'months abbreviation'}  | ${'mos'}
      ${'month word'}           | ${'month'}
      ${'months word'}          | ${'months'}
      ${'week letter'}          | ${'w'}
      ${'week abbreviation'}    | ${'wk'}
      ${'weeks abbreviation'}   | ${'wks'}
      ${'week word'}            | ${'week'}
      ${'weeks word'}           | ${'weeks'}
      ${'day letter'}           | ${'d'}
      ${'day abbreviation'}     | ${'dy'}
      ${'days abbreviation'}    | ${'dys'}
      ${'day word'}             | ${'day'}
      ${'days word'}            | ${'days'}
      ${'hour letter'}          | ${'h'}
      ${'hour abbreviation'}    | ${'hr'}
      ${'hours abbreviation'}   | ${'hrs'}
      ${'hour word'}            | ${'hour'}
      ${'hours word'}           | ${'hours'}
      ${'minute letter'}        | ${'m'}
      ${'minute abbreviation'}  | ${'min'}
      ${'minutes abbreviation'} | ${'mins'}
      ${'minute word'}          | ${'minute'}
      ${'minutes word'}         | ${'minutes'}
      ${'second letter'}        | ${'s'}
      ${'second abbreviation'}  | ${'sec'}
      ${'seconds abbreviation'} | ${'secs'}
      ${'second word'}          | ${'second'}
      ${'seconds word'}         | ${'seconds'}
      ${'millisecond short'}    | ${'ms'}
      ${'millisecond mss'}      | ${'mss'}
      ${'millisecond msec'}     | ${'msec'}
      ${'millisecond word'}     | ${'millisecond'}
      ${'milliseconds word'}    | ${'milliseconds'}
    `('accepts $label', ({ value }: { value: string }) => {
      expect(assertValidTimeUnit(value)).toBeUndefined();
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
    `(
      'throws "Invalid time unit: expected a recognized time unit." for $label',
      ({ value }: { value: unknown }) => {
        expect(() => assertValidTimeUnit(value)).toThrow(
          new Error(invalidTimeUnit),
        );
      },
    );
  });

  it('still accepts a known unit after rejecting an unknown one', () => {
    expect(() => assertValidTimeUnit('x')).toThrow(new Error(invalidTimeUnit));
    expect(assertValidTimeUnit('day')).toBeUndefined();
    expect(assertValidTimeUnit('ms')).toBeUndefined();
  });
});
