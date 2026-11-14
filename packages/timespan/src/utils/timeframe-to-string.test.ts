import { TimeFrame } from '../types/timeframe';
import { timeFrameToString } from './timeframe-to-string';

const invalidAmount = (unit: string): string =>
  `Invalid number of ${unit}: expected zero or a positive number.`;

describe('timeFrameToString', () => {
  describe('accepted frames', () => {
    test.each`
      label                                 | frame                                                                                             | text
      ${'an empty frame'}                   | ${{}}                                                                                             | ${''}
      ${'all zero amounts'}                 | ${{ years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }}  | ${''}
      ${'negative zero years'}              | ${{ years: -0, days: 1 }}                                                                         | ${'1d'}
      ${'one year'}                         | ${{ years: 1 }}                                                                                   | ${'1y'}
      ${'one month'}                        | ${{ months: 1 }}                                                                                  | ${'1M'}
      ${'one week'}                         | ${{ weeks: 1 }}                                                                                   | ${'1w'}
      ${'one day'}                          | ${{ days: 1 }}                                                                                    | ${'1d'}
      ${'one hour'}                         | ${{ hours: 1 }}                                                                                   | ${'1h'}
      ${'one minute'}                       | ${{ minutes: 1 }}                                                                                 | ${'1m'}
      ${'one second'}                       | ${{ seconds: 1 }}                                                                                 | ${'1s'}
      ${'one millisecond'}                  | ${{ milliseconds: 1 }}                                                                            | ${'1ms'}
      ${'a fractional hour'}                | ${{ hours: 1.5 }}                                                                                 | ${'1.5h'}
      ${'ten thousand milliseconds'}        | ${{ milliseconds: 10_000 }}                                                                       | ${'10000ms'}
      ${'zeros between units'}              | ${{ years: 1, months: 0, weeks: 0, days: 1 }}                                                     | ${'1y 1d'}
      ${'the documented January 2022 span'} | ${{ years: 1, months: 1, weeks: 2, days: 6, hours: 4, minutes: 28, seconds: 0, milliseconds: 0 }} | ${'1y 1M 2w 6d 4h 28m'}
      ${'every unit'}                       | ${{ years: 1, months: 2, weeks: 3, days: 4, hours: 5, minutes: 6, seconds: 7, milliseconds: 8 }}  | ${'1y 2M 3w 4d 5h 6m 7s 8ms'}
      ${'an unrecognized extra property'}   | ${{ years: 1, foo: 9, days: 1 }}                                                                  | ${'1y 1d'}
    `(
      'formats $label',
      ({ frame, text }: { frame: TimeFrame; text: string }) => {
        expect(timeFrameToString(frame)).toBe(text);
      },
    );

    it('formats units from largest to smallest when the keys were inserted in reverse', () => {
      const frame = {} as TimeFrame;
      frame.milliseconds = 8;
      frame.seconds = 7;
      frame.minutes = 6;
      frame.hours = 5;
      frame.days = 4;
      frame.weeks = 3;
      frame.months = 2;
      frame.years = 1;
      expect(timeFrameToString(frame)).toBe('1y 2M 3w 4d 5h 6m 7s 8ms');
    });

    it('uses the canonical years field when an alias is also present', () => {
      const frame = { years: 1, y: 2 } as TimeFrame;
      expect(timeFrameToString(frame)).toBe('1y');
    });

    it('ignores a unit that is only present as an alias', () => {
      const frame = { y: 1 } as TimeFrame;
      expect(timeFrameToString(frame)).toBe('');
    });

    it('does not change the frame', () => {
      const frame: TimeFrame = {
        years: 1,
        months: 0,
        weeks: 0,
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      };
      timeFrameToString(frame);
      expect(frame).toEqual({
        years: 1,
        months: 0,
        weeks: 0,
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();

    test.each`
      label                    | frame                                          | message
      ${'a negative year'}     | ${{ years: -1 }}                               | ${invalidAmount('years')}
      ${'a negative fraction'} | ${{ hours: -0.5 }}                             | ${invalidAmount('hours')}
      ${'NaN months'}          | ${{ months: Number.NaN }}                      | ${invalidAmount('months')}
      ${'Infinity weeks'}      | ${{ weeks: Number.POSITIVE_INFINITY }}         | ${invalidAmount('weeks')}
      ${'negative Infinity'}   | ${{ days: Number.NEGATIVE_INFINITY }}          | ${invalidAmount('days')}
      ${'a numeric string'}    | ${{ minutes: '3' as unknown as number }}       | ${invalidAmount('minutes')}
      ${'a boolean'}           | ${{ seconds: true as unknown as number }}      | ${invalidAmount('seconds')}
      ${'null milliseconds'}   | ${{ milliseconds: null as unknown as number }} | ${invalidAmount('milliseconds')}
      ${'undefined hours'}     | ${{ hours: undefined }}                        | ${invalidAmount('hours')}
      ${'a bigint amount'}     | ${{ years: bigintValue as unknown as number }} | ${invalidAmount('years')}
    `(
      'throws for $label',
      ({ frame, message }: { frame: TimeFrame; message: string }) => {
        expect(() => timeFrameToString(frame)).toThrow(new Error(message));
      },
    );
  });
});
