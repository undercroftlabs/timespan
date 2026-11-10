import Constants from '../constants';
import { assertMaxInputLength } from './assert-max-input-length';

const maxLength = Constants.MaxInputStringLength;

describe('assertMaxInputLength', () => {
  describe('accepted strings', () => {
    test.each`
      label                                | value
      ${'empty string'}                    | ${''}
      ${'single character'}                | ${'a'}
      ${'ordinary duration'}               | ${'1 day'}
      ${'exactly the maximum length'}      | ${'a'.repeat(maxLength)}
      ${'whitespace at the maximum'}       | ${' '.repeat(maxLength)}
      ${'punctuation at the maximum'}      | ${'!'.repeat(maxLength)}
      ${'one emoji'}                       | ${String.fromCodePoint(0x1f44d)}
      ${'emoji sequence within the limit'} | ${String.fromCodePoint(0x1f44d).repeat(37)}
    `('accepts $label', ({ value }: { value: string }) => {
      expect(value.length).toBeLessThanOrEqual(maxLength);
      expect(assertMaxInputLength(value)).toBeUndefined();
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();

    test.each`
      label                              | value
      ${'one past the maximum'}          | ${'a'.repeat(maxLength + 1)}
      ${'far past the maximum'}          | ${'a'.repeat(maxLength * 2)}
      ${'emoji sequence past the limit'} | ${String.fromCodePoint(0x1f44d).repeat(38)}
      ${'null'}                          | ${null}
      ${'undefined'}                     | ${undefined}
      ${'zero'}                          | ${0}
      ${'positive number'}               | ${1}
      ${'NaN'}                           | ${Number.NaN}
      ${'bigint'}                        | ${bigintValue}
      ${'true'}                          | ${true}
      ${'false'}                         | ${false}
      ${'plain object'}                  | ${{}}
      ${'object with a short length'}    | ${{ length: 1 }}
      ${'array'}                         | ${[]}
      ${'array shorter than the limit'}  | ${['a', 'b']}
      ${'String object'}                 | ${new String('a'.repeat(maxLength))}
      ${'symbol'}                        | ${Symbol('day')}
      ${'function'}                      | ${() => 'day'}
    `('throws for $label', ({ value }: { value: unknown }) => {
      expect(() => assertMaxInputLength(value)).toThrow(
        new Error(
          `Invalid input string: expected at most ${maxLength} characters.`,
        ),
      );
    });
  });

  it('still accepts a short string after rejecting a long one', () => {
    expect(() => assertMaxInputLength('a'.repeat(maxLength + 1))).toThrow(
      new Error(
        `Invalid input string: expected at most ${maxLength} characters.`,
      ),
    );
    expect(assertMaxInputLength('1 day')).toBeUndefined();
  });
});
