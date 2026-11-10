import { MillisecondConverter } from './millisecond-converter';

const dayMs = 86_400_000;
const maxTimestamp = 8.64e15;

describe('MillisecondConverter', () => {
  let millisecondConverter: MillisecondConverter;

  beforeEach(() => {
    millisecondConverter = new MillisecondConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                             | start                                   | end                                     | milliseconds
        ${'same instant'}                                 | ${new Date(0)}                          | ${new Date(0)}                          | ${0}
        ${'same date object'}                             | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')} | ${0}
        ${'one millisecond'}                              | ${new Date(0)}                          | ${new Date(1)}                          | ${1}
        ${'one millisecond short of a second'}            | ${new Date(0)}                          | ${new Date(999)}                        | ${999}
        ${'exactly one second'}                           | ${new Date(0)}                          | ${new Date(1000)}                       | ${1000}
        ${'one millisecond past a second'}                | ${new Date(0)}                          | ${new Date(1001)}                       | ${1001}
        ${'half a millisecond floors to zero'}            | ${new Date(0)}                          | ${new Date(0.5)}                        | ${0}
        ${'one and a half milliseconds floors to one'}    | ${new Date(0)}                          | ${new Date(1.5)}                        | ${1}
        ${'just under two milliseconds'}                  | ${new Date(0)}                          | ${new Date(1.999)}                      | ${1}
        ${'exactly two milliseconds'}                     | ${new Date(0)}                          | ${new Date(2)}                          | ${2}
        ${'five hundred milliseconds'}                    | ${new Date(0)}                          | ${new Date(500)}                        | ${500}
        ${'fifteen hundred milliseconds'}                 | ${new Date(0)}                          | ${new Date(1500)}                       | ${1500}
        ${'one day in milliseconds'}                      | ${new Date(0)}                          | ${new Date(dayMs)}                      | ${dayMs}
        ${'one millisecond short of a day'}               | ${new Date(0)}                          | ${new Date(dayMs - 1)}                  | ${dayMs - 1}
        ${'one millisecond past a day'}                   | ${new Date(0)}                          | ${new Date(dayMs + 1)}                  | ${dayMs + 1}
        ${'thirty days in May'}                           | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')} | ${30 * dayMs}
        ${'thirty-one days in January'}                   | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')} | ${31 * dayMs}
        ${'twenty-eight days in a common February'}       | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${28 * dayMs}
        ${'twenty-nine days in a leap February'}          | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${29 * dayMs}
        ${'February 28 to March 1 in a leap year'}        | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${2 * dayMs}
        ${'February 28 to March 1 in a common year'}      | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${dayMs}
        ${'across a year boundary'}                       | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${dayMs}
        ${'a common year'}                                | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${365 * dayMs}
        ${'a leap year'}                                  | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')} | ${366 * dayMs}
        ${'negative timestamps in order'}                 | ${new Date(-3000)}                      | ${new Date(-1000)}                      | ${2000}
        ${'from a negative timestamp to the epoch'}       | ${new Date(-1500)}                      | ${new Date(0)}                          | ${1500}
        ${'time of day kept as an exact millisecond gap'} | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T18:00:00.000Z')} | ${dayMs}
        ${'time of day kept for a twelve-hour gap'}       | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T06:00:00.000Z')} | ${dayMs / 2}
        ${'ten thousand milliseconds'}                    | ${new Date(0)}                          | ${new Date(10_000)}                     | ${10000}
        ${'date-only ISO form'}                           | ${new Date('2023-05-01')}               | ${new Date('2023-05-06')}               | ${5 * dayMs}
      `(
        'counts $milliseconds milliseconds for $label',
        ({
          start,
          end,
          milliseconds,
        }: {
          start: Date;
          end: Date;
          milliseconds: number;
        }) => {
          expect(millisecondConverter.between(start, end)).toBe(milliseconds);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date(1000);
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
        ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => 1000 } as unknown as Date}
        ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}
        ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => millisecondConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                               | milliseconds    | start                                   | expected
        ${'zero milliseconds'}              | ${0}            | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero milliseconds'}     | ${-0}           | ${new Date(0)}                          | ${new Date(0)}
        ${'one millisecond from the epoch'} | ${1}            | ${new Date(0)}                          | ${new Date(1)}
        ${'five hundred milliseconds'}      | ${500}          | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.500Z')}
        ${'half a millisecond'}             | ${0.5}          | ${new Date(0)}                          | ${new Date(0.5)}
        ${'one and a half milliseconds'}    | ${1.5}          | ${new Date(0)}                          | ${new Date(1.5)}
        ${'one second as milliseconds'}     | ${1000}         | ${new Date(0)}                          | ${new Date(1000)}
        ${'across a common February'}       | ${28 * dayMs}   | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}
        ${'across a leap February'}         | ${29 * dayMs}   | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}
        ${'onto a leap day'}                | ${dayMs}        | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-02-29T00:00:00.000Z')}
        ${'off the end of January'}         | ${dayMs}        | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')}
        ${'across a year boundary'}         | ${dayMs}        | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a common year'}                  | ${365 * dayMs}  | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a leap year'}                    | ${366 * dayMs}  | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}
        ${'preserving the time of day'}     | ${2 * dayMs}    | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-05-03T15:30:45.123Z')}
        ${'from a negative timestamp'}      | ${3000}         | ${new Date(-3000)}                      | ${new Date(0)}
        ${'ten thousand milliseconds'}      | ${10000}        | ${new Date(0)}                          | ${new Date(10_000)}
        ${'the maximum representable span'} | ${maxTimestamp} | ${new Date(0)}                          | ${new Date(maxTimestamp)}
      `(
        'adds $label',
        ({
          milliseconds,
          start,
          expected,
        }: {
          milliseconds: number;
          start: Date;
          expected: Date;
        }) => {
          expect(millisecondConverter.add(milliseconds, start)).toEqual(
            expected,
          );
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        millisecondConverter.add(500, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                   | milliseconds                        | start
        ${'bigint amount'}      | ${bigintValue as unknown as number} | ${epoch}
        ${'null start'}         | ${1}                                | ${null as unknown as Date}
        ${'undefined start'}    | ${1}                                | ${undefined as unknown as Date}
        ${'numeric start'}      | ${1}                                | ${0 as unknown as Date}
        ${'string start'}       | ${1}                                | ${'2023-05-01' as unknown as Date}
        ${'plain object start'} | ${1}                                | ${{} as unknown as Date}
      `(
        'throws for $label',
        ({ milliseconds, start }: { milliseconds: number; start: Date }) => {
          expect(() => millisecondConverter.add(milliseconds, start)).toThrow();
        },
      );
    });
  });
});
