import { assertValidDateRange } from './assert-valid-date-range';

const invalidDateRange =
  'Invalid date range: expected the start date to be less than or equal to the end date.';

describe('assertValidDateRange', () => {
  describe('accepted ranges', () => {
    const epoch = new Date(0);
    const later = new Date(1);
    const day = new Date(86_400_000);
    const past = new Date(-86_400_000);
    const leapStart = new Date('2020-02-28T00:00:00.000Z');
    const leapEnd = new Date('2020-02-29T00:00:00.000Z');
    const min = new Date(-8.64e15);
    const max = new Date(8.64e15);
    const localStart = new Date(2024, 0, 1, 0, 0, 0, 0);
    const localEnd = new Date(2024, 0, 1, 0, 0, 0, 1);
    const sameInstantCopy = new Date(epoch.getTime());

    test.each`
      label                                  | start                                  | end
      ${'equal epoch instants'}              | ${epoch}                               | ${sameInstantCopy}
      ${'same date object'}                  | ${epoch}                               | ${epoch}
      ${'start one millisecond earlier'}     | ${epoch}                               | ${later}
      ${'start one day earlier'}             | ${epoch}                               | ${day}
      ${'negative timestamps in order'}      | ${past}                                | ${epoch}
      ${'leap day follows the 28th'}         | ${leapStart}                           | ${leapEnd}
      ${'minimum to maximum'}                | ${min}                                 | ${max}
      ${'local times one millisecond apart'} | ${localStart}                          | ${localEnd}
      ${'cloned start equals cloned end'}    | ${new Date(1_700_000_000_000)}         | ${new Date(1_700_000_000_000)}
      ${'parsed null equals epoch'}          | ${new Date(null as unknown as string)} | ${new Date(0)}
    `('accepts $label', ({ start, end }: { start: Date; end: Date }) => {
      expect(assertValidDateRange(start, end)).toBeUndefined();
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();
    const epoch = new Date(0);
    const later = new Date(1);
    const invalid = new Date(Number.NaN);
    const anotherInvalid = new Date('not-a-date');

    test.each`
      label                                | start                                   | end
      ${'start one millisecond later'}     | ${later}                                | ${epoch}
      ${'start one day later'}             | ${new Date(86_400_000)}                 | ${epoch}
      ${'reversed negative timestamps'}    | ${epoch}                                | ${new Date(-1)}
      ${'reversed leap day'}               | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2020-02-28T00:00:00.000Z')}
      ${'maximum before minimum'}          | ${new Date(8.64e15)}                    | ${new Date(-8.64e15)}
      ${'both invalid dates'}              | ${invalid}                              | ${anotherInvalid}
      ${'invalid start'}                   | ${invalid}                              | ${epoch}
      ${'invalid end'}                     | ${epoch}                                | ${invalid}
      ${'invalid start from empty string'} | ${new Date('')}                         | ${epoch}
      ${'invalid end from Infinity'}       | ${epoch}                                | ${new Date(Number.POSITIVE_INFINITY)}
      ${'null start'}                      | ${null}                                 | ${epoch}
      ${'null end'}                        | ${epoch}                                | ${null}
      ${'both null'}                       | ${null}                                 | ${null}
      ${'undefined start'}                 | ${undefined}                            | ${epoch}
      ${'undefined end'}                   | ${epoch}                                | ${undefined}
      ${'both undefined'}                  | ${undefined}                            | ${undefined}
      ${'numeric timestamps'}              | ${0}                                    | ${1}
      ${'reversed numeric timestamps'}     | ${1}                                    | ${0}
      ${'ISO strings in order'}            | ${'2020-01-01'}                         | ${'2020-01-02'}
      ${'ISO strings reversed'}            | ${'2020-01-02'}                         | ${'2020-01-01'}
      ${'empty strings'}                   | ${''}                                   | ${''}
      ${'NaN timestamps'}                  | ${Number.NaN}                           | ${Number.NaN}
      ${'Infinity timestamps'}             | ${Number.NEGATIVE_INFINITY}             | ${Number.POSITIVE_INFINITY}
      ${'bigint timestamps'}               | ${bigintValue}                          | ${bigintValue}
      ${'booleans'}                        | ${false}                                | ${true}
      ${'plain objects'}                   | ${{}}                                   | ${{}}
      ${'objects with getTime'}            | ${{ getTime: () => 0 }}                 | ${{ getTime: () => 1 }}
      ${'arrays'}                          | ${[]}                                   | ${[]}
      ${'date string objects'}             | ${new String('2020-01-01')}             | ${new String('2020-01-02')}
      ${'symbols'}                         | ${Symbol('start')}                      | ${Symbol('end')}
      ${'functions'}                       | ${() => epoch}                          | ${() => later}
      ${'valid start and missing end'}     | ${epoch}                                | ${undefined}
      ${'one past maximum as end'}         | ${epoch}                                | ${new Date(8.64e15 + 1)}
    `(
      'throws "Invalid date range: expected the start date to be less than or equal to the end date." for $label',
      ({ start, end }: { start: unknown; end: unknown }) => {
        expect(() => assertValidDateRange(start, end)).toThrow(
          new Error(invalidDateRange),
        );
      },
    );
  });

  it('still accepts an ordered range after rejecting a reversed one', () => {
    expect(() => assertValidDateRange(new Date(1), new Date(0))).toThrow(
      new Error(invalidDateRange),
    );
    expect(assertValidDateRange(new Date(0), new Date(1))).toBeUndefined();
    expect(assertValidDateRange(new Date(0), new Date(0))).toBeUndefined();
  });
});
