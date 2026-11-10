import { DayConverter } from './day-converter';

const dayMs = 86_400_000;

describe('DayConverter', () => {
  let dayConverter: DayConverter;

  beforeEach(() => {
    dayConverter = new DayConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                         | start                                   | end                                     | days
        ${'same instant'}                             | ${new Date(0)}                          | ${new Date(0)}                          | ${0}
        ${'same date object'}                         | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')} | ${0}
        ${'one millisecond'}                          | ${new Date(0)}                          | ${new Date(1)}                          | ${0}
        ${'one millisecond short of a day'}           | ${new Date(0)}                          | ${new Date(dayMs - 1)}                  | ${0}
        ${'exactly one day'}                          | ${new Date(0)}                          | ${new Date(dayMs)}                      | ${1}
        ${'one millisecond past a day'}               | ${new Date(0)}                          | ${new Date(dayMs + 1)}                  | ${1}
        ${'twelve hours'}                             | ${new Date(0)}                          | ${new Date(dayMs / 2)}                  | ${0}
        ${'thirty-six hours'}                         | ${new Date(0)}                          | ${new Date(dayMs * 1.5)}                | ${1}
        ${'twenty-three hours'}                       | ${new Date(0)}                          | ${new Date(23 * 60 * 60 * 1000)}        | ${0}
        ${'twenty-five hours'}                        | ${new Date(0)}                          | ${new Date(25 * 60 * 60 * 1000)}        | ${1}
        ${'just under two days'}                      | ${new Date(0)}                          | ${new Date(dayMs * 2 - 1)}              | ${1}
        ${'exactly two days'}                         | ${new Date(0)}                          | ${new Date(dayMs * 2)}                  | ${2}
        ${'seven days'}                               | ${new Date(0)}                          | ${new Date(dayMs * 7)}                  | ${7}
        ${'thirty days in May'}                       | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')} | ${30}
        ${'thirty-one days in January'}               | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')} | ${31}
        ${'twenty-eight days in a common February'}   | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${28}
        ${'twenty-nine days in a leap February'}      | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${29}
        ${'February 28 to March 1 in a leap year'}    | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${2}
        ${'February 28 to March 1 in a common year'}  | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${1}
        ${'across a year boundary'}                   | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${1}
        ${'a common year'}                            | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${365}
        ${'a leap year'}                              | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')} | ${366}
        ${'negative timestamps in order'}             | ${new Date(-dayMs * 3)}                 | ${new Date(-dayMs)}                     | ${2}
        ${'time of day ignored when short of a day'}  | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T06:00:00.000Z')} | ${0}
        ${'time of day kept when a full day remains'} | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T18:00:00.000Z')} | ${1}
        ${'ten thousand days'}                        | ${new Date(0)}                          | ${new Date(dayMs * 10_000)}             | ${10000}
        ${'date-only ISO form'}                       | ${new Date('2023-05-01')}               | ${new Date('2023-05-06')}               | ${5}
      `(
        'counts $days days for $label',
        ({ start, end, days }: { start: Date; end: Date; days: number }) => {
          expect(dayConverter.between(start, end)).toBe(days);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date(dayMs);
      const bigintValue = Function('return 1n')();

      test.each`
        label                     | start                                          | end
        ${'null start'}           | ${null as unknown as Date}                     | ${epoch}
        ${'null end'}             | ${epoch}                                       | ${null as unknown as Date}
        ${'both null'}            | ${null as unknown as Date}                     | ${null as unknown as Date}
        ${'undefined start'}      | ${undefined as unknown as Date}                | ${epoch}
        ${'undefined end'}        | ${epoch}                                       | ${undefined as unknown as Date}
        ${'numeric timestamps'}   | ${0 as unknown as Date}                        | ${later as unknown as Date}
        ${'ISO strings in order'} | ${'2023-05-01' as unknown as Date}             | ${'2023-05-31' as unknown as Date}
        ${'empty strings'}        | ${'' as unknown as Date}                       | ${'' as unknown as Date}
        ${'NaN timestamps'}       | ${Number.NaN as unknown as Date}               | ${Number.NaN as unknown as Date}
        ${'Infinity timestamps'}  | ${Number.NEGATIVE_INFINITY as unknown as Date} | ${Number.POSITIVE_INFINITY as unknown as Date}
        ${'bigint timestamps'}    | ${bigintValue as unknown as Date}              | ${bigintValue as unknown as Date}
        ${'booleans'}             | ${false as unknown as Date}                    | ${true as unknown as Date}
        ${'plain objects'}        | ${{} as unknown as Date}                       | ${{} as unknown as Date}
        ${'arrays'}               | ${[] as unknown as Date}                       | ${[] as unknown as Date}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => dayConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                               | days     | start                                   | expected
        ${'zero days'}                      | ${0}     | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero days'}             | ${-0}    | ${new Date(0)}                          | ${new Date(0)}
        ${'one day from the epoch'}         | ${1}     | ${new Date(0)}                          | ${new Date(dayMs)}
        ${'five days in May'}               | ${5}     | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-06T00:00:00.000Z')}
        ${'half a day'}                     | ${0.5}   | ${new Date(0)}                          | ${new Date(dayMs / 2)}
        ${'one and a half days'}            | ${1.5}   | ${new Date(0)}                          | ${new Date(dayMs * 1.5)}
        ${'thirty days'}                    | ${30}    | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')}
        ${'across a common February'}       | ${28}    | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}
        ${'across a leap February'}         | ${29}    | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}
        ${'onto a leap day'}                | ${1}     | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-02-29T00:00:00.000Z')}
        ${'off the end of January'}         | ${1}     | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')}
        ${'across a year boundary'}         | ${1}     | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a common year'}                  | ${365}   | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a leap year'}                    | ${366}   | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}
        ${'preserving the time of day'}     | ${2}     | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-05-03T15:30:45.123Z')}
        ${'from a negative timestamp'}      | ${3}     | ${new Date(-dayMs * 3)}                 | ${new Date(0)}
        ${'ten thousand days'}              | ${10000} | ${new Date(0)}                          | ${new Date(dayMs * 10_000)}
        ${'the maximum representable span'} | ${1e8}   | ${new Date(0)}                          | ${new Date(8.64e15)}
      `(
        'adds $label',
        ({
          days,
          start,
          expected,
        }: {
          days: number;
          start: Date;
          expected: Date;
        }) => {
          expect(dayConverter.add(days, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        dayConverter.add(5, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                   | days                                | start
        ${'bigint amount'}      | ${bigintValue as unknown as number} | ${epoch}
        ${'null start'}         | ${1}                                | ${null as unknown as Date}
        ${'undefined start'}    | ${1}                                | ${undefined as unknown as Date}
        ${'numeric start'}      | ${1}                                | ${0 as unknown as Date}
        ${'string start'}       | ${1}                                | ${'2023-05-01' as unknown as Date}
        ${'plain object start'} | ${1}                                | ${{} as unknown as Date}
      `(
        'throws for $label',
        ({ days, start }: { days: number; start: Date }) => {
          expect(() => dayConverter.add(days, start)).toThrow();
        },
      );
    });
  });
});
