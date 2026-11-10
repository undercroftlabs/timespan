import { WeekConverter } from './week-converter';

const dayMs = 86_400_000;
const weekMs = 7 * dayMs;
const maxTimestamp = 8.64e15;
const maxWeeks = Math.floor(maxTimestamp / weekMs);

describe('WeekConverter', () => {
  let weekConverter: WeekConverter;

  beforeEach(() => {
    weekConverter = new WeekConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                          | start                                   | end                                     | weeks
        ${'same instant'}                              | ${new Date(0)}                          | ${new Date(0)}                          | ${0}
        ${'same date object'}                          | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')} | ${0}
        ${'one millisecond'}                           | ${new Date(0)}                          | ${new Date(1)}                          | ${0}
        ${'one millisecond short of a week'}           | ${new Date(0)}                          | ${new Date(weekMs - 1)}                 | ${0}
        ${'exactly one week'}                          | ${new Date(0)}                          | ${new Date(weekMs)}                     | ${1}
        ${'one millisecond past a week'}               | ${new Date(0)}                          | ${new Date(weekMs + 1)}                 | ${1}
        ${'half a week'}                               | ${new Date(0)}                          | ${new Date(weekMs / 2)}                 | ${0}
        ${'one and a half weeks'}                      | ${new Date(0)}                          | ${new Date(weekMs * 1.5)}               | ${1}
        ${'six days'}                                  | ${new Date(0)}                          | ${new Date(dayMs * 6)}                  | ${0}
        ${'seven days'}                                | ${new Date(0)}                          | ${new Date(dayMs * 7)}                  | ${1}
        ${'eight days'}                                | ${new Date(0)}                          | ${new Date(dayMs * 8)}                  | ${1}
        ${'just under two weeks'}                      | ${new Date(0)}                          | ${new Date(weekMs * 2 - 1)}             | ${1}
        ${'exactly two weeks'}                         | ${new Date(0)}                          | ${new Date(weekMs * 2)}                 | ${2}
        ${'fourteen days in May'}                      | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-15T00:00:00.000Z')} | ${2}
        ${'thirty days in May'}                        | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')} | ${4}
        ${'twenty-eight days in a common February'}    | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${4}
        ${'twenty-nine days in a leap February'}       | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${4}
        ${'February 28 to March 1 in a leap year'}     | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${0}
        ${'February 28 to March 1 in a common year'}   | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${0}
        ${'across a year boundary'}                    | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${0}
        ${'a common year'}                             | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${52}
        ${'a leap year'}                               | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')} | ${52}
        ${'negative timestamps in order'}              | ${new Date(-weekMs * 3)}                | ${new Date(-weekMs)}                    | ${2}
        ${'time of day ignored when short of a week'}  | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-08T06:00:00.000Z')} | ${0}
        ${'time of day kept when a full week remains'} | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-08T18:00:00.000Z')} | ${1}
        ${'ten thousand weeks'}                        | ${new Date(0)}                          | ${new Date(weekMs * 10_000)}            | ${10000}
        ${'date-only ISO form'}                        | ${new Date('2023-05-01')}               | ${new Date('2023-05-15')}               | ${2}
      `(
        'counts $weeks weeks for $label',
        ({ start, end, weeks }: { start: Date; end: Date; weeks: number }) => {
          expect(weekConverter.between(start, end)).toBe(weeks);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date(weekMs);
      const invalid = new Date(Number.NaN);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | start                                          | end
        ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}
        ${'start one week later'}            | ${later}                                       | ${epoch}
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
        ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => weekMs } as unknown as Date}
        ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}
        ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => weekConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                                    | weeks       | start                                   | expected
        ${'zero weeks'}                          | ${0}        | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero weeks'}                 | ${-0}       | ${new Date(0)}                          | ${new Date(0)}
        ${'one week from the epoch'}             | ${1}        | ${new Date(0)}                          | ${new Date(weekMs)}
        ${'two weeks in May'}                    | ${2}        | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-15T00:00:00.000Z')}
        ${'half a week'}                         | ${0.5}      | ${new Date(0)}                          | ${new Date(weekMs / 2)}
        ${'one and a half weeks'}                | ${1.5}      | ${new Date(0)}                          | ${new Date(weekMs * 1.5)}
        ${'four weeks across a common February'} | ${4}        | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}
        ${'onto a leap day'}                     | ${1 / 7}    | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-02-29T00:00:00.000Z')}
        ${'across a year boundary'}              | ${1 / 7}    | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'preserving the time of day'}          | ${2}        | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-05-15T15:30:45.123Z')}
        ${'from a negative timestamp'}           | ${3}        | ${new Date(-weekMs * 3)}                | ${new Date(0)}
        ${'ten thousand weeks'}                  | ${10000}    | ${new Date(0)}                          | ${new Date(weekMs * 10_000)}
        ${'the maximum whole-week span'}         | ${maxWeeks} | ${new Date(0)}                          | ${new Date(maxWeeks * weekMs)}
      `(
        'adds $label',
        ({
          weeks,
          start,
          expected,
        }: {
          weeks: number;
          start: Date;
          expected: Date;
        }) => {
          expect(weekConverter.add(weeks, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        weekConverter.add(2, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | weeks                               | start
        ${'negative one week'}               | ${-1}                               | ${epoch}
        ${'negative half week'}              | ${-0.5}                             | ${epoch}
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
      `(
        'throws for $label',
        ({ weeks, start }: { weeks: number; start: Date }) => {
          expect(() => weekConverter.add(weeks, start)).toThrow();
        },
      );
    });
  });
});
