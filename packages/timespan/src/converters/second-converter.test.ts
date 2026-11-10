import { SecondConverter } from './second-converter';

const secondMs = 1000;
const dayMs = 86_400_000;
const maxTimestamp = 8.64e15;
const maxSeconds = maxTimestamp / secondMs;

describe('SecondConverter', () => {
  let secondConverter: SecondConverter;

  beforeEach(() => {
    secondConverter = new SecondConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                         | start                                   | end                                     | seconds
        ${'same instant'}                             | ${new Date(0)}                          | ${new Date(0)}                          | ${0}
        ${'same date object'}                         | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')} | ${0}
        ${'one millisecond'}                          | ${new Date(0)}                          | ${new Date(1)}                          | ${0}
        ${'one millisecond short of a second'}        | ${new Date(0)}                          | ${new Date(secondMs - 1)}               | ${0}
        ${'exactly one second'}                       | ${new Date(0)}                          | ${new Date(secondMs)}                   | ${1}
        ${'one millisecond past a second'}            | ${new Date(0)}                          | ${new Date(secondMs + 1)}               | ${1}
        ${'half a second'}                            | ${new Date(0)}                          | ${new Date(secondMs / 2)}               | ${0}
        ${'one and a half seconds'}                   | ${new Date(0)}                          | ${new Date(secondMs * 1.5)}             | ${1}
        ${'just under two seconds'}                   | ${new Date(0)}                          | ${new Date(secondMs * 2 - 1)}           | ${1}
        ${'exactly two seconds'}                      | ${new Date(0)}                          | ${new Date(secondMs * 2)}               | ${2}
        ${'ten seconds'}                              | ${new Date(0)}                          | ${new Date(secondMs * 10)}              | ${10}
        ${'one day in seconds'}                       | ${new Date(0)}                          | ${new Date(dayMs)}                      | ${86400}
        ${'one millisecond short of a day'}           | ${new Date(0)}                          | ${new Date(dayMs - 1)}                  | ${86399}
        ${'one millisecond past a day'}               | ${new Date(0)}                          | ${new Date(dayMs + 1)}                  | ${86400}
        ${'thirty days in May'}                       | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')} | ${30 * 86400}
        ${'thirty-one days in January'}               | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')} | ${31 * 86400}
        ${'twenty-eight days in a common February'}   | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${28 * 86400}
        ${'twenty-nine days in a leap February'}      | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${29 * 86400}
        ${'February 28 to March 1 in a leap year'}    | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${2 * 86400}
        ${'February 28 to March 1 in a common year'}  | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${86400}
        ${'across a year boundary'}                   | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${86400}
        ${'a common year'}                            | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${365 * 86400}
        ${'a leap year'}                              | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')} | ${366 * 86400}
        ${'negative timestamps in order'}             | ${new Date(-secondMs * 3)}              | ${new Date(-secondMs)}                  | ${2}
        ${'time of day ignored when short of a day'}  | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T06:00:00.000Z')} | ${12 * 3600}
        ${'time of day kept when a full day remains'} | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T18:00:00.000Z')} | ${86400}
        ${'ten thousand seconds'}                     | ${new Date(0)}                          | ${new Date(secondMs * 10_000)}          | ${10000}
        ${'date-only ISO form'}                       | ${new Date('2023-05-01')}               | ${new Date('2023-05-06')}               | ${5 * 86400}
      `(
        'counts $seconds seconds for $label',
        ({
          start,
          end,
          seconds,
        }: {
          start: Date;
          end: Date;
          seconds: number;
        }) => {
          expect(secondConverter.between(start, end)).toBe(seconds);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date(secondMs);
      const invalid = new Date(Number.NaN);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | start                                          | end
        ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}
        ${'start one second later'}          | ${later}                                       | ${epoch}
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
        ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => secondMs } as unknown as Date}
        ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}
        ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => secondConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                               | seconds        | start                                   | expected
        ${'zero seconds'}                   | ${0}           | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero seconds'}          | ${-0}          | ${new Date(0)}                          | ${new Date(0)}
        ${'one second from the epoch'}      | ${1}           | ${new Date(0)}                          | ${new Date(secondMs)}
        ${'five seconds in May'}            | ${5}           | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:05.000Z')}
        ${'half a second'}                  | ${0.5}         | ${new Date(0)}                          | ${new Date(secondMs / 2)}
        ${'one and a half seconds'}         | ${1.5}         | ${new Date(0)}                          | ${new Date(secondMs * 1.5)}
        ${'across a common February'}       | ${28 * 86400}  | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}
        ${'across a leap February'}         | ${29 * 86400}  | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}
        ${'onto a leap day'}                | ${86400}       | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-02-29T00:00:00.000Z')}
        ${'off the end of January'}         | ${86400}       | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')}
        ${'across a year boundary'}         | ${86400}       | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a common year'}                  | ${365 * 86400} | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a leap year'}                    | ${366 * 86400} | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}
        ${'preserving the time of day'}     | ${2 * 86400}   | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-05-03T15:30:45.123Z')}
        ${'from a negative timestamp'}      | ${3}           | ${new Date(-secondMs * 3)}              | ${new Date(0)}
        ${'ten thousand seconds'}           | ${10000}       | ${new Date(0)}                          | ${new Date(secondMs * 10_000)}
        ${'the maximum representable span'} | ${maxSeconds}  | ${new Date(0)}                          | ${new Date(maxTimestamp)}
      `(
        'adds $label',
        ({
          seconds,
          start,
          expected,
        }: {
          seconds: number;
          start: Date;
          expected: Date;
        }) => {
          expect(secondConverter.add(seconds, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        secondConverter.add(5, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                 | seconds                             | start
        ${'negative one second'}              | ${-1}                               | ${epoch}
        ${'negative half second'}             | ${-0.5}                             | ${epoch}
        ${'negative fraction'}                | ${-1.5}                             | ${epoch}
        ${'large negative amount'}            | ${-10_000}                          | ${epoch}
        ${'negative Infinity amount'}         | ${Number.NEGATIVE_INFINITY}         | ${epoch}
        ${'NaN amount'}                       | ${Number.NaN}                       | ${epoch}
        ${'Infinity amount'}                  | ${Number.POSITIVE_INFINITY}         | ${epoch}
        ${'string amount'}                    | ${'5' as unknown as number}         | ${epoch}
        ${'empty string amount'}              | ${'' as unknown as number}          | ${epoch}
        ${'null amount'}                      | ${null as unknown as number}        | ${epoch}
        ${'undefined amount'}                 | ${undefined as unknown as number}   | ${epoch}
        ${'boolean amount'}                   | ${true as unknown as number}        | ${epoch}
        ${'object amount'}                    | ${{} as unknown as number}          | ${epoch}
        ${'array amount'}                     | ${[1] as unknown as number}         | ${epoch}
        ${'bigint amount'}                    | ${bigintValue as unknown as number} | ${epoch}
        ${'invalid start date'}               | ${1}                                | ${new Date(Number.NaN)}
        ${'invalid start from empty string'}  | ${1}                                | ${new Date('')}
        ${'invalid start from Infinity'}      | ${1}                                | ${new Date(Number.POSITIVE_INFINITY)}
        ${'null start'}                       | ${1}                                | ${null as unknown as Date}
        ${'undefined start'}                  | ${1}                                | ${undefined as unknown as Date}
        ${'numeric start'}                    | ${1}                                | ${0 as unknown as Date}
        ${'string start'}                     | ${1}                                | ${'2023-05-01' as unknown as Date}
        ${'plain object start'}               | ${1}                                | ${{} as unknown as Date}
        ${'object with getTime'}              | ${1}                                | ${{ getTime: () => 0 } as unknown as Date}
        ${'one past the maximum span'}        | ${maxSeconds + 1}                   | ${epoch}
        ${'one second past the maximum date'} | ${1}                                | ${new Date(maxTimestamp)}
      `(
        'throws for $label',
        ({ seconds, start }: { seconds: number; start: Date }) => {
          expect(() => secondConverter.add(seconds, start)).toThrow();
        },
      );
    });
  });
});
