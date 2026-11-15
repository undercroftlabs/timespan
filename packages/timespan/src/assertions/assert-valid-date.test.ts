import { assertValidDate } from './assert-valid-date';

const invalidDate = 'Invalid date: expected a valid Date.';

describe('assertValidDate', () => {
  describe('accepted dates', () => {
    const ValidDate = class extends Date {};

    test.each`
      label                        | value
      ${'epoch'}                   | ${new Date(0)}
      ${'negative timestamp'}      | ${new Date(-1)}
      ${'one millisecond'}         | ${new Date(1)}
      ${'one day in milliseconds'} | ${new Date(86_400_000)}
      ${'unix seconds as millis'}  | ${new Date(1_700_000_000_000)}
      ${'minimum representable'}   | ${new Date(-8.64e15)}
      ${'maximum representable'}   | ${new Date(8.64e15)}
      ${'local date constructor'}  | ${new Date(2020, 0, 1, 0, 0, 0, 0)}
      ${'leap day local'}          | ${new Date(2020, 1, 29, 12, 30, 45, 500)}
      ${'end of month local'}      | ${new Date(2021, 0, 31, 23, 59, 59, 999)}
      ${'ISO instant'}             | ${new Date('2020-01-01T00:00:00.000Z')}
      ${'date-only ISO form'}      | ${new Date('2020-01-01')}
      ${'leap day ISO'}            | ${new Date('2024-02-29T23:59:59.999Z')}
      ${'parsed from null'}        | ${new Date(null as unknown as string)}
      ${'current time'}            | ${new Date()}
      ${'cloned epoch'}            | ${new Date(new Date(0).getTime())}
      ${'invalid Date from false'} | ${new Date(false as unknown as string)}
      ${'invalid Date from true'}  | ${new Date(true as unknown as string)}
      ${'Date subclass'}           | ${new ValidDate(0)}
      ${'Date subclass leap day'}  | ${new ValidDate('2020-02-29T00:00:00.000Z')}
    `('accepts $label', ({ value }: { value: Date }) => {
      expect(assertValidDate(value)).toBeUndefined();
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();

    test.each`
      label                               | value
      ${'null'}                           | ${null}
      ${'undefined'}                      | ${undefined}
      ${'zero'}                           | ${0}
      ${'negative zero'}                  | ${-0}
      ${'positive number'}                | ${1}
      ${'negative number'}                | ${-1}
      ${'decimal number'}                 | ${1.5}
      ${'NaN'}                            | ${Number.NaN}
      ${'Infinity'}                       | ${Number.POSITIVE_INFINITY}
      ${'negative Infinity'}              | ${Number.NEGATIVE_INFINITY}
      ${'bigint'}                         | ${bigintValue}
      ${'true'}                           | ${true}
      ${'false'}                          | ${false}
      ${'empty string'}                   | ${''}
      ${'ISO date string'}                | ${'2020-01-01'}
      ${'ISO instant string'}             | ${'2020-01-01T00:00:00.000Z'}
      ${'unparseable string'}             | ${'not-a-date'}
      ${'numeric timestamp string'}       | ${'0'}
      ${'plain object'}                   | ${{}}
      ${'object with getTime'}            | ${{ getTime: () => 0 }}
      ${'array'}                          | ${[]}
      ${'date parts array'}               | ${[2020, 0, 1]}
      ${'String object'}                  | ${new String('2020-01-01')}
      ${'symbol'}                         | ${Symbol('date')}
      ${'function'}                       | ${() => new Date(0)}
      ${'invalid Date from NaN'}          | ${new Date(Number.NaN)}
      ${'invalid Date from undefined'}    | ${new Date(undefined as unknown as string)}
      ${'invalid Date from empty string'} | ${new Date('')}
      ${'invalid Date from bad text'}     | ${new Date('not-a-date')}
      ${'invalid Date from Infinity'}     | ${new Date(Number.POSITIVE_INFINITY)}
      ${'one past the maximum'}           | ${new Date(8.64e15 + 1)}
      ${'one past the minimum'}           | ${new Date(-8.64e15 - 1)}
      ${'Date from an empty array'}       | ${new Date([] as unknown as string)}
    `(
      'throws "Invalid date: expected a valid Date." for $label',
      ({ value }: { value: unknown }) => {
        expect(() => assertValidDate(value)).toThrow(new Error(invalidDate));
      },
    );
  });

  it('still accepts a valid date after rejecting an invalid one', () => {
    expect(() => assertValidDate(new Date(Number.NaN))).toThrow(
      new Error(invalidDate),
    );
    expect(assertValidDate(new Date(0))).toBeUndefined();
    expect(assertValidDate(new Date(0))).toBeUndefined();
  });
});
