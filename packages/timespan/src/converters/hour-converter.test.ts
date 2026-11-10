import { HourConverter } from './hour-converter';

const hourMs = 3_600_000;
const dayMs = 86_400_000;
const hoursPerDay = 24;
const maxTimestamp = 8.64e15;
const maxHours = maxTimestamp / hourMs;

describe('HourConverter', () => {
  let hourConverter: HourConverter;

  beforeEach(() => {
    hourConverter = new HourConverter();
  });

  describe('between', () => {
    describe('accepted ranges', () => {
      test.each`
        label                                         | start                                   | end                                     | hours
        ${'same instant'}                             | ${new Date(0)}                          | ${new Date(0)}                          | ${0}
        ${'same date object'}                         | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-01T00:00:00.000Z')} | ${0}
        ${'one millisecond'}                          | ${new Date(0)}                          | ${new Date(1)}                          | ${0}
        ${'one millisecond short of an hour'}         | ${new Date(0)}                          | ${new Date(hourMs - 1)}                 | ${0}
        ${'exactly one hour'}                         | ${new Date(0)}                          | ${new Date(hourMs)}                     | ${1}
        ${'one millisecond past an hour'}             | ${new Date(0)}                          | ${new Date(hourMs + 1)}                 | ${1}
        ${'thirty minutes'}                           | ${new Date(0)}                          | ${new Date(hourMs / 2)}                 | ${0}
        ${'ninety minutes'}                           | ${new Date(0)}                          | ${new Date(hourMs * 1.5)}               | ${1}
        ${'just under two hours'}                     | ${new Date(0)}                          | ${new Date(hourMs * 2 - 1)}             | ${1}
        ${'exactly two hours'}                        | ${new Date(0)}                          | ${new Date(hourMs * 2)}                 | ${2}
        ${'eighteen hours'}                           | ${new Date('2023-05-01T12:00:00.000Z')} | ${new Date('2023-05-02T06:00:00.000Z')} | ${18}
        ${'one day in hours'}                         | ${new Date(0)}                          | ${new Date(dayMs)}                      | ${hoursPerDay}
        ${'one millisecond short of a day'}           | ${new Date(0)}                          | ${new Date(dayMs - 1)}                  | ${hoursPerDay - 1}
        ${'one millisecond past a day'}               | ${new Date(0)}                          | ${new Date(dayMs + 1)}                  | ${hoursPerDay}
        ${'thirty days in May'}                       | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')} | ${30 * hoursPerDay}
        ${'thirty-one days in January'}               | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')} | ${31 * hoursPerDay}
        ${'twenty-eight days in a common February'}   | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${28 * hoursPerDay}
        ${'twenty-nine days in a leap February'}      | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${29 * hoursPerDay}
        ${'February 28 to March 1 in a leap year'}    | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')} | ${2 * hoursPerDay}
        ${'February 28 to March 1 in a common year'}  | ${new Date('2021-02-28T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')} | ${hoursPerDay}
        ${'across a year boundary'}                   | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${hoursPerDay}
        ${'a common year'}                            | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')} | ${365 * hoursPerDay}
        ${'a leap year'}                              | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')} | ${366 * hoursPerDay}
        ${'negative timestamps in order'}             | ${new Date(-hourMs * 3)}                | ${new Date(-hourMs)}                    | ${2}
        ${'time of day ignored when short of a day'}  | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T06:00:00.000Z')} | ${12}
        ${'time of day kept when a full day remains'} | ${new Date('2023-05-01T18:00:00.000Z')} | ${new Date('2023-05-02T18:00:00.000Z')} | ${hoursPerDay}
        ${'ten thousand hours'}                       | ${new Date(0)}                          | ${new Date(hourMs * 10_000)}            | ${10000}
        ${'date-only ISO form'}                       | ${new Date('2023-05-01')}               | ${new Date('2023-05-06')}               | ${5 * hoursPerDay}
      `(
        'counts $hours hours for $label',
        ({ start, end, hours }: { start: Date; end: Date; hours: number }) => {
          expect(hourConverter.between(start, end)).toBe(hours);
        },
      );
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const later = new Date(hourMs);
      const invalid = new Date(Number.NaN);
      const bigintValue = Function('return 1n')();

      test.each`
        label                                | start                                          | end
        ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}
        ${'start one hour later'}            | ${later}                                       | ${epoch}
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
        ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => hourMs } as unknown as Date}
        ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}
        ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}
      `('throws for $label', ({ start, end }: { start: Date; end: Date }) => {
        expect(() => hourConverter.between(start, end)).toThrow();
      });
    });
  });

  describe('add', () => {
    describe('accepted amounts', () => {
      test.each`
        label                               | hours                | start                                   | expected
        ${'zero hours'}                     | ${0}                 | ${new Date(0)}                          | ${new Date(0)}
        ${'negative zero hours'}            | ${-0}                | ${new Date(0)}                          | ${new Date(0)}
        ${'one hour from the epoch'}        | ${1}                 | ${new Date(0)}                          | ${new Date(hourMs)}
        ${'three and a half hours'}         | ${3.5}               | ${new Date('2023-05-01T12:00:00.000Z')} | ${new Date('2023-05-01T15:30:00.000Z')}
        ${'half an hour'}                   | ${0.5}               | ${new Date(0)}                          | ${new Date(hourMs / 2)}
        ${'one and a half hours'}           | ${1.5}               | ${new Date(0)}                          | ${new Date(hourMs * 1.5)}
        ${'across a common February'}       | ${28 * hoursPerDay}  | ${new Date('2021-02-01T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}
        ${'across a leap February'}         | ${29 * hoursPerDay}  | ${new Date('2020-02-01T00:00:00.000Z')} | ${new Date('2020-03-01T00:00:00.000Z')}
        ${'onto a leap day'}                | ${hoursPerDay}       | ${new Date('2020-02-28T00:00:00.000Z')} | ${new Date('2020-02-29T00:00:00.000Z')}
        ${'off the end of January'}         | ${hoursPerDay}       | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-01T00:00:00.000Z')}
        ${'across a year boundary'}         | ${hoursPerDay}       | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a common year'}                  | ${365 * hoursPerDay} | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-01T00:00:00.000Z')}
        ${'a leap year'}                    | ${366 * hoursPerDay} | ${new Date('2024-01-01T00:00:00.000Z')} | ${new Date('2025-01-01T00:00:00.000Z')}
        ${'preserving the time of day'}     | ${2 * hoursPerDay}   | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-05-03T15:30:45.123Z')}
        ${'from a negative timestamp'}      | ${3}                 | ${new Date(-hourMs * 3)}                | ${new Date(0)}
        ${'ten thousand hours'}             | ${10000}             | ${new Date(0)}                          | ${new Date(hourMs * 10_000)}
        ${'the maximum representable span'} | ${maxHours}          | ${new Date(0)}                          | ${new Date(maxTimestamp)}
      `(
        'adds $label',
        ({
          hours,
          start,
          expected,
        }: {
          hours: number;
          start: Date;
          expected: Date;
        }) => {
          expect(hourConverter.add(hours, start)).toEqual(expected);
        },
      );

      it('does not change the start date', () => {
        const start = new Date('2023-05-01T00:00:00.000Z');
        const original = start.getTime();
        hourConverter.add(5, start);
        expect(start.getTime()).toBe(original);
      });
    });

    describe('rejected values', () => {
      const epoch = new Date(0);
      const bigintValue = Function('return 1n')();

      test.each`
        label                   | hours                               | start
        ${'bigint amount'}      | ${bigintValue as unknown as number} | ${epoch}
        ${'null start'}         | ${1}                                | ${null as unknown as Date}
        ${'undefined start'}    | ${1}                                | ${undefined as unknown as Date}
        ${'numeric start'}      | ${1}                                | ${0 as unknown as Date}
        ${'string start'}       | ${1}                                | ${'2023-05-01' as unknown as Date}
        ${'plain object start'} | ${1}                                | ${{} as unknown as Date}
      `(
        'throws for $label',
        ({ hours, start }: { hours: number; start: Date }) => {
          expect(() => hourConverter.add(hours, start)).toThrow();
        },
      );
    });
  });
});
