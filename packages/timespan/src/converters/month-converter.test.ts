import { MonthConverter } from './month-converter';

const maxTimestamp = 8.64e15;

describe('MonthConverter', () => {
  let monthConverter: MonthConverter;

  beforeEach(() => {
    monthConverter = new MonthConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                          | start                                   | end                                                             | months
        ${'same instant'}                              | ${new Date(0)}                          | ${new Date(0)}                                                  | ${0}
        ${'same date object'}                          | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')}                         | ${0}
        ${'one millisecond'}                           | ${new Date(0)}                          | ${new Date(1)}                                                  | ${0}
        ${'one millisecond short of a calendar month'} | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date(new Date('2023-06-01T00:00:00.000Z').getTime() - 1)} | ${0}
        ${'exactly one calendar month'}                | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-06-01T00:00:00.000Z')}                         | ${1}
        ${'one millisecond past a calendar month'}     | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-06-01T00:00:00.001Z')}                         | ${1}
        ${'May to July on the first'}                  | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-07-01T00:00:00.000Z')}                         | ${2}
        ${'May first to July fifteenth'}               | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-07-15T00:00:00.000Z')}                         | ${2}
        ${'January 15 to February 1'}                  | ${new Date('2022-01-15T00:00:00.000Z')} | ${new Date('2022-02-01T00:00:00.000Z')}                         | ${0}
        ${'one hour short of the anniversary'}         | ${new Date('2023-01-15T12:00:00.000Z')} | ${new Date('2023-02-15T11:00:00.000Z')}                         | ${0}
        ${'exactly the anniversary'}                   | ${new Date('2023-01-15T12:00:00.000Z')} | ${new Date('2023-02-15T12:00:00.000Z')}                         | ${1}
        ${'across a common February'}                  | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}                         | ${1}
        ${'across a leap February'}                    | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}                         | ${1}
        ${'February 28 to March 1 in a leap year'}     | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}                         | ${0}
        ${'February 28 to March 1 in a common year'}   | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}                         | ${0}
        ${'across a year boundary'}                    | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}                         | ${0}
        ${'a common year'}                             | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}                         | ${12}
        ${'a leap year'}                               | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}                         | ${12}
        ${'negative timestamps in order'}              | ${new Date('1969-01-01T00:00:00.000Z')} | ${new Date('1970-01-01T00:00:00.000Z')}                         | ${12}
        ${'date-only ISO form'}                        | ${new Date('2023-05-01')}               | ${new Date('2023-07-01')}                                       | ${2}
      `(
        'counts $months months for $label',
        ({
          start,
          end,
          months,
        }: {
          start: Date;
          end: Date;
          months: number;
        }) => {
          expect(monthConverter.between(start, end)).toBe(months);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date('2023-06-01T00:00:00.000Z');
      const invalid = new Date(Number.NaN);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | start                                          | end
        ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}
        ${'start one month later'}           | ${later}                                       | ${new Date('2023-05-01T00:00:00.000Z')}
        ${'reversed May range'}              | ${new Date('2023-05-31T00:00:00.000Z')}        | ${new Date('2023-05-01T00:00:00.000Z')}
        ${'reversed leap day'}               | ${new Date('2020-03-01T00:00:00.000Z')}        | ${new Date('2020-02-28T00:00:00.000Z')}
        ${'both invalid dates'}              | ${invalid}                                     | ${new Date('not-a-date')}
        ${'invalid start'}                   | ${invalid}                                     | ${epoch}
        ${'invalid end'}                     | ${epoch}                                       | ${invalid}
        ${'invalid start from empty string'} | ${new Date('')}                                | ${epoch}
        ${'invalid end from Infinity'}       | ${epoch}                                       | ${new Date(Number.POSITIVE_INFINITY)}
        ${'null start'}                      | ${null as unknown as Date}                     | ${epoch}
        ${'null end'}                        | ${epoch}                                       | ${null as unknown as Date}
        ${'both null'}                       | ${null as unknown as Date}                     | ${null as unknown as Date}
        ${'undefined start'}                 | ${undefined as unknown as Date}                | ${epoch}
        ${'undefined end'}                   | ${epoch}                                       | ${undefined as unknown as Date}
        ${'numeric timestamps'}              | ${0 as unknown as Date}                        | ${later as unknown as Date}
        ${'ISO strings in order'}            | ${'2023-05-01' as unknown as Date}             | ${'2023-05-31' as unknown as Date}
        ${'empty strings'}                   | ${'' as unknown as Date}                       | ${'' as unknown as Date}
        ${'NaN timestamps'}                  | ${Number.NaN as unknown as Date}               | ${Number.NaN as unknown as Date}
        ${'Infinity timestamps'}             | ${Number.NEGATIVE_INFINITY as unknown as Date} | ${Number.POSITIVE_INFINITY as unknown as Date}
        ${'bigint timestamps'}               | ${bigintValue as unknown as Date}              | ${bigintValue as unknown as Date}
        ${'booleans'}                        | ${false as unknown as Date}                    | ${true as unknown as Date}
        ${'plain objects'}                   | ${{} as unknown as Date}                       | ${{} as unknown as Date}
        ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => 1 } as unknown as Date}
        ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}
        ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => monthConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                               | months | start                                   | expected
        ${'zero months'}                    | ${0}   | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero months'}           | ${-0}  | ${new Date(0)}                          | ${new Date(0)}
        ${'one month from May first'}       | ${1}   | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-06-01T00:00:00.000Z')}
        ${'three months'}                   | ${3}   | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-08-01T00:00:00.000Z')}
        ${'across a year boundary'}         | ${4}   | ${new Date('2023-11-01T00:00:00.000Z')} | ${new Date('2024-03-01T00:00:00.000Z')}
        ${'half a month truncates to none'} | ${0.5} | ${new Date('2023-06-15T12:00:00.000Z')} | ${new Date('2023-06-15T12:00:00.000Z')}
        ${'clamps into a common February'}  | ${1}   | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-28T00:00:00.000Z')}
        ${'clamps into a leap February'}    | ${1}   | ${new Date('2024-01-31T00:00:00.000Z')} | ${new Date('2024-02-29T00:00:00.000Z')}
        ${'clamps into a thirty-day month'} | ${1}   | ${new Date('2023-03-31T00:00:00.000Z')} | ${new Date('2023-04-30T00:00:00.000Z')}
        ${'two months from January 31'}     | ${2}   | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-03-31T00:00:00.000Z')}
        ${'preserving the time of day'}     | ${1}   | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-06-01T15:30:45.123Z')}
        ${'from a negative timestamp'}      | ${1}   | ${new Date('1969-12-01T00:00:00.000Z')} | ${new Date('1970-01-01T00:00:00.000Z')}
      `(
        'adds $label',
        ({
          months,
          start,
          expected,
        }: {
          months: number;
          start: Date;
          expected: Date;
        }) => {
          expect(monthConverter.add(months, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        monthConverter.add(3, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                   | months                              | start
        ${'bigint amount'}      | ${bigintValue as unknown as number} | ${epoch}
        ${'null start'}         | ${1}                                | ${null as unknown as Date}
        ${'undefined start'}    | ${1}                                | ${undefined as unknown as Date}
        ${'numeric start'}      | ${1}                                | ${0 as unknown as Date}
        ${'string start'}       | ${1}                                | ${'2023-05-01' as unknown as Date}
        ${'plain object start'} | ${1}                                | ${{} as unknown as Date}
      `(
        'throws for $label',
        ({ months, start }: { months: number; start: Date }) => {
          expect(() => monthConverter.add(months, start)).toThrow();
        },
      );
    });
  });
});
