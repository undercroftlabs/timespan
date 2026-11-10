import { YearConverter } from './year-converter';

const maxTimestamp = 8.64e15;

describe('YearConverter', () => {
  let yearConverter: YearConverter;

  beforeEach(() => {
    yearConverter = new YearConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                         | start                                   | end                                                             | years
        ${'same instant'}                             | ${new Date(0)}                          | ${new Date(0)}                                                  | ${0}
        ${'same date object'}                         | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')}                         | ${0}
        ${'one millisecond'}                          | ${new Date(0)}                          | ${new Date(1)}                                                  | ${0}
        ${'one day across New Year'}                  | ${new Date('2022-12-31T00:00:00.000Z')} | ${new Date('2023-01-01T00:00:00.000Z')}                         | ${0}
        ${'one day short of the anniversary'}         | ${new Date('2022-06-15T00:00:00.000Z')} | ${new Date('2023-06-14T00:00:00.000Z')}                         | ${0}
        ${'exactly the anniversary'}                  | ${new Date('2022-06-15T00:00:00.000Z')} | ${new Date('2023-06-15T00:00:00.000Z')}                         | ${1}
        ${'one millisecond short of the anniversary'} | ${new Date('2022-06-15T00:00:00.000Z')} | ${new Date(new Date('2023-06-15T00:00:00.000Z').getTime() - 1)} | ${0}
        ${'one millisecond past the anniversary'}     | ${new Date('2022-06-15T00:00:00.000Z')} | ${new Date('2023-06-15T00:00:00.001Z')}                         | ${1}
        ${'whole years'}                              | ${new Date('2020-01-01T00:00:00.000Z')} | ${new Date('2023-01-01T00:00:00.000Z')}                         | ${3}
        ${'leap day to leap day four years later'}    | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2024-02-29T00:00:00.000Z')}                         | ${4}
        ${'February 28 across a non-leap span'}       | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2024-02-28T00:00:00.000Z')}                         | ${3}
        ${'a range that covers a leap year'}          | ${new Date('2020-01-01T00:00:00.000Z')} | ${new Date('2021-12-31T00:00:00.000Z')}                         | ${1}
        ${'a common year'}                            | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}                         | ${1}
        ${'a leap year'}                              | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}                         | ${1}
        ${'February 28 to March 1 in a leap year'}    | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}                         | ${0}
        ${'February 28 to March 1 in a common year'}  | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}                         | ${0}
        ${'negative timestamps in order'}             | ${new Date('1969-01-01T00:00:00.000Z')} | ${new Date('1970-01-01T00:00:00.000Z')}                         | ${1}
        ${'date-only ISO form'}                       | ${new Date('2020-01-01')}               | ${new Date('2023-01-01')}                                       | ${3}
      `(
        'counts $years years for $label',
        ({ start, end, years }: { start: Date; end: Date; years: number }) => {
          expect(yearConverter.between(start, end)).toBe(years);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date('2024-01-01T00:00:00.000Z');
      const invalid = new Date(Number.NaN);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | start                                          | end
        ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}
        ${'start one year later'}            | ${later}                                       | ${new Date('2023-01-01T00:00:00.000Z')}
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
        expect(() => yearConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                                      | years | start                                   | expected
        ${'zero years'}                            | ${0}  | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero years'}                   | ${-0} | ${new Date(0)}                          | ${new Date(0)}
        ${'three years from January first'}        | ${3}  | ${new Date('2020-01-01T00:00:00.000Z')} | ${new Date('2023-01-01T00:00:00.000Z')}
        ${'onto the next leap day'}                | ${4}  | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2024-02-29T00:00:00.000Z')}
        ${'clamps February 29 into a common year'} | ${1}  | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2021-02-28T00:00:00.000Z')}
        ${'preserving the time of day'}            | ${1}  | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2024-05-01T15:30:45.123Z')}
        ${'from a negative timestamp'}             | ${1}  | ${new Date('1969-01-01T00:00:00.000Z')} | ${new Date('1970-01-01T00:00:00.000Z')}
        ${'across a year boundary'}                | ${1}  | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-12-31T00:00:00.000Z')}
      `(
        'adds $label',
        ({
          years,
          start,
          expected,
        }: {
          years: number;
          start: Date;
          expected: Date;
        }) => {
          expect(yearConverter.add(years, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2020-02-29T00:00:00.000Z');
        const original = start.getTime();
        yearConverter.add(1, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | years                               | start
        ${'negative one year'}               | ${-1}                               | ${epoch}
        ${'negative half year'}              | ${-0.5}                             | ${epoch}
        ${'negative fraction'}               | ${-1.5}                             | ${epoch}
        ${'large negative amount'}           | ${-10_000}                          | ${epoch}
        ${'negative Infinity amount'}        | ${Number.NEGATIVE_INFINITY}         | ${epoch}
        ${'NaN amount'}                      | ${Number.NaN}                       | ${epoch}
        ${'Infinity amount'}                 | ${Number.POSITIVE_INFINITY}         | ${epoch}
        ${'string amount'}                   | ${'5' as unknown as number}         | ${epoch}
        ${'empty string amount'}             | ${'' as unknown as number}          | ${epoch}
        ${'null amount'}                     | ${null as unknown as number}        | ${epoch}
        ${'undefined amount'}                | ${undefined as unknown as number}   | ${epoch}
        ${'boolean amount'}                  | ${true as unknown as number}        | ${epoch}
        ${'object amount'}                   | ${{} as unknown as number}          | ${epoch}
        ${'array amount'}                    | ${[1] as unknown as number}         | ${epoch}
        ${'bigint amount'}                   | ${bigintValue as unknown as number} | ${epoch}
        ${'invalid start date'}              | ${1}                                | ${new Date(Number.NaN)}
        ${'invalid start from empty string'} | ${1}                                | ${new Date('')}
        ${'invalid start from Infinity'}     | ${1}                                | ${new Date(Number.POSITIVE_INFINITY)}
        ${'null start'}                      | ${1}                                | ${null as unknown as Date}
        ${'undefined start'}                 | ${1}                                | ${undefined as unknown as Date}
        ${'numeric start'}                   | ${1}                                | ${0 as unknown as Date}
        ${'string start'}                    | ${1}                                | ${'2023-05-01' as unknown as Date}
        ${'plain object start'}              | ${1}                                | ${{} as unknown as Date}
        ${'object with getTime'}             | ${1}                                | ${{ getTime: () => 0 } as unknown as Date}
        ${'a span past the maximum date'}    | ${300_000}                          | ${epoch}
        ${'one year past the maximum date'}  | ${1}                                | ${new Date(maxTimestamp)}
      `(
        'throws for $label',
        ({ years, start }: { years: number; start: Date }) => {
          expect(() => yearConverter.add(years, start)).toThrow();
        },
      );
    });
  });
});
