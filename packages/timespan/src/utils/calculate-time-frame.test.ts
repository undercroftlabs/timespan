import { calculateTimeFrame } from './calculate-time-frame';

const maxTimestamp = 8.64e15;
const invalidDate = 'Invalid date: expected a valid Date.';
const invalidDateRange =
  'Invalid date range: expected the start date to be less than or equal to the end date.';

describe('calculateTimeFrame', () => {
  describe('accepted ranges', () => {
    test.each`
      label                                                 | start                                   | end                                                             | years     | months | weeks | days | hours | minutes | seconds | milliseconds
      ${'same instant'}                                     | ${new Date(0)}                          | ${new Date(0)}                                                  | ${0}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one millisecond'}                                  | ${new Date(0)}                          | ${new Date(1)}                                                  | ${0}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${1}
      ${'one second'}                                       | ${new Date(0)}                          | ${new Date(1000)}                                               | ${0}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${1}    | ${0}
      ${'one minute'}                                       | ${new Date(0)}                          | ${new Date(60_000)}                                             | ${0}      | ${0}   | ${0}  | ${0} | ${0}  | ${1}    | ${0}    | ${0}
      ${'one hour'}                                         | ${new Date(0)}                          | ${new Date(3_600_000)}                                          | ${0}      | ${0}   | ${0}  | ${0} | ${1}  | ${0}    | ${0}    | ${0}
      ${'one day'}                                          | ${new Date(0)}                          | ${new Date(86_400_000)}                                         | ${0}      | ${0}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one week'}                                         | ${new Date(0)}                          | ${new Date(604_800_000)}                                        | ${0}      | ${0}   | ${1}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'eight days'}                                       | ${new Date(0)}                          | ${new Date(691_200_000)}                                        | ${0}      | ${0}   | ${1}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one day across New Year'}                          | ${new Date('2022-12-31T00:00:00.000Z')} | ${new Date('2023-01-01T00:00:00.000Z')}                         | ${0}      | ${0}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one day from a negative timestamp'}                | ${new Date('1969-12-31T00:00:00.000Z')} | ${new Date('1970-01-01T00:00:00.000Z')}                         | ${0}      | ${0}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one hour short of a calendar month'}               | ${new Date('2023-01-15T12:00:00.000Z')} | ${new Date('2023-02-15T11:00:00.000Z')}                         | ${0}      | ${0}   | ${4}  | ${2} | ${23} | ${0}    | ${0}    | ${0}
      ${'exactly one calendar month'}                       | ${new Date('2023-01-15T12:00:00.000Z')} | ${new Date('2023-02-15T12:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one millisecond short of a calendar month'}        | ${new Date('2023-05-01T00:00:00.000Z')} | ${new Date(new Date('2023-06-01T00:00:00.000Z').getTime() - 1)} | ${0}      | ${0}   | ${4}  | ${2} | ${23} | ${59}   | ${59}   | ${999}
      ${'preserving the time of day across a month'}        | ${new Date('2023-05-01T15:30:45.123Z')} | ${new Date('2023-06-01T15:30:45.123Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one day short of the anniversary'}                 | ${new Date('2022-06-15T00:00:00.000Z')} | ${new Date('2023-06-14T00:00:00.000Z')}                         | ${0}      | ${11}  | ${4}  | ${2} | ${0}  | ${0}    | ${0}    | ${0}
      ${'exactly one year'}                                 | ${new Date('2022-06-15T00:00:00.000Z')} | ${new Date('2023-06-15T00:00:00.000Z')}                         | ${1}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'the documented January 2022 span'}                 | ${new Date('2022-01-01T06:24:00.000Z')} | ${new Date('2023-02-21T10:52:00.000Z')}                         | ${1}      | ${1}   | ${2}  | ${6} | ${4}  | ${28}   | ${0}    | ${0}
      ${'366 days from a non-leap New Year'}                | ${new Date('2023-01-01T00:00:00.000Z')} | ${new Date('2024-01-02T00:00:00.000Z')}                         | ${1}      | ${0}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'every unit in the canonical string'}               | ${new Date('2000-01-01T00:00:00.000Z')} | ${new Date('2001-03-26T05:06:07.008Z')}                         | ${1}      | ${2}   | ${3}  | ${4} | ${5}  | ${6}    | ${7}    | ${8}
      ${'January 31 through March 31'}                      | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-03-31T00:00:00.000Z')}                         | ${0}      | ${2}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'January 31 through May 31'}                        | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-05-31T00:00:00.000Z')}                         | ${0}      | ${4}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'December 31 through January 31'}                   | ${new Date('2023-12-31T00:00:00.000Z')} | ${new Date('2024-01-31T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'leap day four years later'}                        | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2024-02-29T00:00:00.000Z')}                         | ${4}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one millisecond short of a clamped month'}         | ${new Date('2023-01-31T15:30:45.123Z')} | ${new Date('2023-02-28T15:30:45.122Z')}                         | ${0}      | ${0}   | ${3}  | ${6} | ${23} | ${59}   | ${59}   | ${999}
      ${'one millisecond short of a clamped year'}          | ${new Date('2020-02-29T15:30:45.123Z')} | ${new Date('2021-02-28T15:30:45.122Z')}                         | ${0}      | ${11}  | ${4}  | ${1} | ${23} | ${59}   | ${59}   | ${999}
      ${'15 June 2020 through the maximum instant'}         | ${new Date(Date.UTC(2020, 5, 15))}      | ${new Date(maxTimestamp)}                                       | ${273740} | ${2}   | ${4}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'13 September 2020 through the maximum instant'}    | ${new Date(Date.UTC(2020, 8, 13))}      | ${new Date(maxTimestamp)}                                       | ${273740} | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'31 August 275760 through the maximum instant'}     | ${new Date(Date.UTC(275760, 7, 31))}    | ${new Date(maxTimestamp)}                                       | ${0}      | ${0}   | ${1}  | ${6} | ${0}  | ${0}    | ${0}    | ${0}
      ${'14 September 275759 through the maximum instant'}  | ${new Date(Date.UTC(275759, 8, 14))}    | ${new Date(maxTimestamp)}                                       | ${0}      | ${11}  | ${4}  | ${2} | ${0}  | ${0}    | ${0}    | ${0}
      ${'clamps into a common February'}                    | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-02-28T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one day after a common February clamp'}            | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-03-01T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'clamps into a leap February'}                      | ${new Date('2024-01-31T00:00:00.000Z')} | ${new Date('2024-02-29T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one day after a leap February clamp'}              | ${new Date('2024-01-31T00:00:00.000Z')} | ${new Date('2024-03-01T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'clamps into a thirty-day month'}                   | ${new Date('2023-03-31T00:00:00.000Z')} | ${new Date('2023-04-30T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'May 31 through June 30'}                           | ${new Date('2023-05-31T00:00:00.000Z')} | ${new Date('2023-06-30T00:00:00.000Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'preserving the time of day across a clamp'}        | ${new Date('2023-01-31T15:30:45.123Z')} | ${new Date('2023-02-28T15:30:45.123Z')}                         | ${0}      | ${1}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'clamps February 29 into a common year'}            | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2021-02-28T00:00:00.000Z')}                         | ${1}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one day after a clamped year'}                     | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2021-03-01T00:00:00.000Z')}                         | ${1}      | ${0}   | ${0}  | ${1} | ${0}  | ${0}    | ${0}    | ${0}
      ${'one millisecond after a clamped year'}             | ${new Date('2020-02-29T00:00:00.000Z')} | ${new Date('2021-02-28T00:00:00.001Z')}                         | ${1}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${1}
      ${'preserving the time of day across a clamped year'} | ${new Date('2020-02-29T15:30:45.123Z')} | ${new Date('2021-02-28T15:30:45.123Z')}                         | ${1}      | ${0}   | ${0}  | ${0} | ${0}  | ${0}    | ${0}    | ${0}
      ${'remainder after a common February clamp'}          | ${new Date('2023-01-31T00:00:00.000Z')} | ${new Date('2023-03-02T04:05:06.007Z')}                         | ${0}      | ${1}   | ${0}  | ${2} | ${4}  | ${5}    | ${6}    | ${7}
    `(
      'counts $label',
      ({
        start,
        end,
        years,
        months,
        weeks,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      }: {
        start: Date;
        end: Date;
        years: number;
        months: number;
        weeks: number;
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
      }) => {
        expect(calculateTimeFrame(start, end)).toEqual({
          years,
          months,
          weeks,
          days,
          hours,
          minutes,
          seconds,
          milliseconds,
        });
      },
    );

    it('does not change the start or end date', () => {
      const start = new Date('2023-01-31T00:00:00.000Z');
      const end = new Date('2023-02-28T00:00:00.000Z');
      const originalStart = start.getTime();
      const originalEnd = end.getTime();
      calculateTimeFrame(start, end);
      expect(start.getTime()).toBe(originalStart);
      expect(end.getTime()).toBe(originalEnd);
    });
  });

  describe('rejected values', () => {
    const epoch = new Date(0);
    const later = new Date('2024-01-01T00:00:00.000Z');
    const invalid = new Date(Number.NaN);
    const bigintValue = Function('return 1n')();

    test.each`
      label                                | start                                          | end                                            | message
      ${'start one millisecond later'}     | ${new Date(1)}                                 | ${epoch}                                       | ${invalidDateRange}
      ${'start one year later'}            | ${later}                                       | ${new Date('2023-01-01T00:00:00.000Z')}        | ${invalidDateRange}
      ${'reversed May range'}              | ${new Date('2023-05-31T00:00:00.000Z')}        | ${new Date('2023-05-01T00:00:00.000Z')}        | ${invalidDateRange}
      ${'reversed leap day'}               | ${new Date('2020-03-01T00:00:00.000Z')}        | ${new Date('2020-02-28T00:00:00.000Z')}        | ${invalidDateRange}
      ${'both invalid dates'}              | ${invalid}                                     | ${new Date('not-a-date')}                      | ${invalidDate}
      ${'invalid start'}                   | ${invalid}                                     | ${epoch}                                       | ${invalidDate}
      ${'invalid end'}                     | ${epoch}                                       | ${invalid}                                     | ${invalidDate}
      ${'invalid start from empty string'} | ${new Date('')}                                | ${epoch}                                       | ${invalidDate}
      ${'invalid end from Infinity'}       | ${epoch}                                       | ${new Date(Number.POSITIVE_INFINITY)}          | ${invalidDate}
      ${'null start'}                      | ${null as unknown as Date}                     | ${epoch}                                       | ${invalidDate}
      ${'null end'}                        | ${epoch}                                       | ${null as unknown as Date}                     | ${invalidDate}
      ${'both null'}                       | ${null as unknown as Date}                     | ${null as unknown as Date}                     | ${invalidDate}
      ${'undefined start'}                 | ${undefined as unknown as Date}                | ${epoch}                                       | ${invalidDate}
      ${'undefined end'}                   | ${epoch}                                       | ${undefined as unknown as Date}                | ${invalidDate}
      ${'numeric timestamps'}              | ${0 as unknown as Date}                        | ${later}                                       | ${invalidDate}
      ${'ISO strings in order'}            | ${'2023-05-01' as unknown as Date}             | ${'2023-05-31' as unknown as Date}             | ${invalidDate}
      ${'empty strings'}                   | ${'' as unknown as Date}                       | ${'' as unknown as Date}                       | ${invalidDate}
      ${'NaN timestamps'}                  | ${Number.NaN as unknown as Date}               | ${Number.NaN as unknown as Date}               | ${invalidDate}
      ${'Infinity timestamps'}             | ${Number.NEGATIVE_INFINITY as unknown as Date} | ${Number.POSITIVE_INFINITY as unknown as Date} | ${invalidDate}
      ${'bigint timestamps'}               | ${bigintValue as unknown as Date}              | ${bigintValue as unknown as Date}              | ${invalidDate}
      ${'booleans'}                        | ${false as unknown as Date}                    | ${true as unknown as Date}                     | ${invalidDate}
      ${'plain objects'}                   | ${{} as unknown as Date}                       | ${{} as unknown as Date}                       | ${invalidDate}
      ${'objects with getTime'}            | ${{ getTime: () => 0 } as unknown as Date}     | ${{ getTime: () => 1 } as unknown as Date}     | ${invalidDate}
      ${'arrays'}                          | ${[] as unknown as Date}                       | ${[] as unknown as Date}                       | ${invalidDate}
      ${'one past the maximum as end'}     | ${epoch}                                       | ${new Date(maxTimestamp + 1)}                  | ${invalidDate}
    `(
      'throws for $label',
      ({
        start,
        end,
        message,
      }: {
        start: Date;
        end: Date;
        message: string;
      }) => {
        expect(() => calculateTimeFrame(start, end)).toThrow(
          new Error(message),
        );
      },
    );
  });
});
