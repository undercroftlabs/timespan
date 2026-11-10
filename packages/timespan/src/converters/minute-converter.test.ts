import { MinuteConverter } from './minute-converter';

const minuteMs = 60_000;
const dayMs = 86_400_000;
const minutesPerDay = 1_440;
const maxTimestamp = 8.64e15;
const maxMinutes = maxTimestamp / minuteMs;

describe('MinuteConverter', () => {
  let minuteConverter: MinuteConverter;

  beforeEach(() => {
    minuteConverter = new MinuteConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                         | start                                   | end                                     | minutes
        ${'same instant'}                             | ${new Date(0)}                          | ${new Date(0)}                          | ${0}
        ${'same date object'}                         | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')} | ${0}
        ${'one millisecond'}                          | ${new Date(0)}                          | ${new Date(1)}                          | ${0}
        ${'one millisecond short of a minute'}        | ${new Date(0)}                          | ${new Date(minuteMs - 1)}               | ${0}
        ${'exactly one minute'}                       | ${new Date(0)}                          | ${new Date(minuteMs)}                   | ${1}
        ${'one millisecond past a minute'}            | ${new Date(0)}                          | ${new Date(minuteMs + 1)}               | ${1}
        ${'thirty seconds'}                           | ${new Date(0)}                          | ${new Date(minuteMs / 2)}               | ${0}
        ${'ninety seconds'}                           | ${new Date(0)}                          | ${new Date(minuteMs * 1.5)}             | ${1}
        ${'just under two minutes'}                   | ${new Date(0)}                          | ${new Date(minuteMs * 2 - 1)}           | ${1}
        ${'exactly two minutes'}                      | ${new Date(0)}                          | ${new Date(minuteMs * 2)}               | ${2}
        ${'thirty minutes'}                           | ${new Date(0)}                          | ${new Date(minuteMs * 30)}              | ${30}
        ${'one day in minutes'}                       | ${new Date(0)}                          | ${new Date(dayMs)}                      | ${minutesPerDay}
        ${'one millisecond short of a day'}           | ${new Date(0)}                          | ${new Date(dayMs - 1)}                  | ${minutesPerDay - 1}
        ${'one millisecond past a day'}               | ${new Date(0)}                          | ${new Date(dayMs + 1)}                  | ${minutesPerDay}
        ${'thirty days in May'}                       | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')} | ${30 * minutesPerDay}
        ${'thirty-one days in January'}               | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')} | ${31 * minutesPerDay}
        ${'twenty-eight days in a common February'}   | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${28 * minutesPerDay}
        ${'twenty-nine days in a leap February'}      | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${29 * minutesPerDay}
        ${'February 28 to March 1 in a leap year'}    | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${2 * minutesPerDay}
        ${'February 28 to March 1 in a common year'}  | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${minutesPerDay}
        ${'across a year boundary'}                   | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${minutesPerDay}
        ${'a common year'}                            | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${365 * minutesPerDay}
        ${'a leap year'}                              | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')} | ${366 * minutesPerDay}
        ${'negative timestamps in order'}             | ${new Date(-minuteMs * 3)}              | ${new Date(-minuteMs)}                  | ${2}
        ${'time of day ignored when short of a day'}  | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T06:00:00.000Z')} | ${12 * 60}
        ${'time of day kept when a full day remains'} | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T18:00:00.000Z')} | ${minutesPerDay}
        ${'ten thousand minutes'}                     | ${new Date(0)}                          | ${new Date(minuteMs * 10_000)}          | ${10000}
        ${'date-only ISO form'}                       | ${new Date('2023-05-01')}               | ${new Date('2023-05-06')}               | ${5 * minutesPerDay}
      `(
        'counts $minutes minutes for $label',
        ({
          start,
          end,
          minutes,
        }: {
          start: Date;
          end: Date;
          minutes: number;
        }) => {
          expect(minuteConverter.between(start, end)).toBe(minutes);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date(minuteMs);
      const invalid = new Date(Number.NaN);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | start                                          | end
        ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}
        ${'start one minute later'}          | ${later}                                       | ${epoch}
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
        ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => minuteMs } as unknown as Date}
        ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}
        ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => minuteConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                               | minutes                | start                                   | expected
        ${'zero minutes'}                   | ${0}                   | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero minutes'}          | ${-0}                  | ${new Date(0)}                          | ${new Date(0)}
        ${'one minute from the epoch'}      | ${1}                   | ${new Date(0)}                          | ${new Date(minuteMs)}
        ${'five minutes in May'}            | ${5}                   | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:05:00.000Z')}
        ${'half a minute'}                  | ${0.5}                 | ${new Date(0)}                          | ${new Date(minuteMs / 2)}
        ${'one and a half minutes'}         | ${1.5}                 | ${new Date(0)}                          | ${new Date(minuteMs * 1.5)}
        ${'a quarter minute'}               | ${0.25}                | ${new Date(0)}                          | ${new Date(minuteMs / 4)}
        ${'across a common February'}       | ${28 * minutesPerDay}  | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}
        ${'across a leap February'}         | ${29 * minutesPerDay}  | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}
        ${'onto a leap day'}                | ${minutesPerDay}       | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-02-29T00:00:00.000Z')}
        ${'off the end of January'}         | ${minutesPerDay}       | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')}
        ${'across a year boundary'}         | ${minutesPerDay}       | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a common year'}                  | ${365 * minutesPerDay} | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a leap year'}                    | ${366 * minutesPerDay} | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}
        ${'preserving the time of day'}     | ${2 * minutesPerDay}   | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-05-03T15:30:45.123Z')}
        ${'from a negative timestamp'}      | ${3}                   | ${new Date(-minuteMs * 3)}              | ${new Date(0)}
        ${'ten thousand minutes'}           | ${10000}               | ${new Date(0)}                          | ${new Date(minuteMs * 10_000)}
        ${'the maximum representable span'} | ${maxMinutes}          | ${new Date(0)}                          | ${new Date(maxTimestamp)}
      `(
        'adds $label',
        ({
          minutes,
          start,
          expected,
        }: {
          minutes: number;
          start: Date;
          expected: Date;
        }) => {
          expect(minuteConverter.add(minutes, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        minuteConverter.add(5, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | minutes                             | start
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
        ({ minutes, start }: { minutes: number; start: Date }) => {
          expect(() => minuteConverter.add(minutes, start)).toThrow();
        },
      );
    });
  });
});
