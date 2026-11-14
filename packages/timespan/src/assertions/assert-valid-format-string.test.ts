import Constants from '../constants';
import { assertValidFormatString } from './assert-valid-format-string';

const maxLength = Constants.MaxInputStringLength;
const invalidLength = `Invalid input string: expected at most ${maxLength} characters.`;
const invalidFormat = 'Invalid format string: expected a valid format string.';

/**
 * Width and precision from 0 through this value must be accepted.
 */
const maxAcceptedField = 64;

/**
 * Width or precision at or above this value must be rejected.
 */
const minimumRejectedField = 1_000_000;

const supportedSpecifiers = 'YBWDHMSLybwdhmslf';

const unsupportedLetters = [
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
].filter((letter) => !supportedSpecifiers.includes(letter));

describe('assertValidFormatString', () => {
  describe('accepted strings', () => {
    test.each([...supportedSpecifiers])(
      'accepts bare specifier %%%s',
      (specifier) => {
        expect(assertValidFormatString(`%${specifier}`)).toBeUndefined();
      },
    );

    test.each`
      label                                        | value
      ${'empty string'}                            | ${''}
      ${'literal text'}                            | ${'No substitutions here.'}
      ${'literal that resembles a unit'}           | ${'days hours months 12'}
      ${'literal decimal'}                         | ${'1.5h'}
      ${'sentence with one specifier'}             | ${'%D days'}
      ${'sentence with two specifiers'}            | ${'%w weeks and %d days'}
      ${'clock with zero padding'}                 | ${'Time remaining: %h:%02m:%02s'}
      ${'exclamation in literal text'}             | ${'You have %D days remaining!'}
      ${'caller-supplied decimal point'}           | ${'%s.%f seconds'}
      ${'escaped percent'}                         | ${'%%'}
      ${'two escaped percents'}                    | ${'%%%%'}
      ${'escaped percent then a specifier'}        | ${'%%%D'}
      ${'specifier then an escaped percent'}       | ${'%D%%'}
      ${'escaped percent then a literal letter'}   | ${'%%D'}
      ${'escaped percent in a sentence'}           | ${'Progress: 50%% complete. %H hours left.'}
      ${'leading and trailing spaces'}             | ${'  %D days  '}
      ${'embedded newline'}                        | ${'%h\n%h'}
      ${'tab in literal text'}                     | ${'a\tb\n%h'}
      ${'backslash-n stays literal'}               | ${'line1\\nline2 %h'}
      ${'cjk literal text'}                        | ${'剩余 %D 天'}
      ${'emoji literal text'}                      | ${'⏳%D'}
      ${'repeated specifier'}                      | ${'%D %D %D'}
      ${'specifiers in any order'}                 | ${'%s%m%h%d%w%b%y'}
      ${'every supported specifier'}               | ${'%Y %y %B %b %W %w %D %d %H %h %M %m %S %s %L %l %f'}
      ${'length-modifier lookalike'}               | ${'%ll'}
      ${'hour length-modifier lookalike'}          | ${'%hh'}
      ${'lookalike then another specifier'}        | ${'%hhd'}
      ${'zero flag'}                               | ${'%0h'}
      ${'repeated zero flags'}                     | ${'%000000h'}
      ${'zero flag and width'}                     | ${'%010h'}
      ${'zero flags before a width'}               | ${'%00010h'}
      ${'left justify'}                            | ${'%-5h'}
      ${'plus flag'}                               | ${'%+h'}
      ${'space flag'}                              | ${'% h'}
      ${'repeated plus flags'}                     | ${'%++++h'}
      ${'repeated minus flags'}                    | ${'%----6h'}
      ${'repeated space flags'}                    | ${'%    h'}
      ${'plus overrides space'}                    | ${'%+ h'}
      ${'space then plus'}                         | ${'% +h'}
      ${'minus overrides zero'}                    | ${'%-010h'}
      ${'zero then minus'}                         | ${'%0-10h'}
      ${'flags in mixed order'}                    | ${'%+ -6h'}
      ${'space plus and width'}                    | ${'%  +6h'}
      ${'precision'}                               | ${'%.2h'}
      ${'precision with leading zeros'}            | ${'%.03h'}
      ${'explicit zero precision'}                 | ${'%.0h'}
      ${'precision of zero with leading zeros'}    | ${'%.00h'}
      ${'width and precision'}                     | ${'%6.3h'}
      ${'zero flag ignored once precision is set'} | ${'%06.3h'}
      ${'flags width and precision'}               | ${'%-+06.3h'}
      ${'plus minus width and precision'}          | ${'%+-6.3h'}
      ${'fractional seconds'}                      | ${'%f'}
      ${'fractional precision zero'}               | ${'%.0f'}
      ${'fractional precision one'}                | ${'%.1f'}
      ${'fractional precision six'}                | ${'%.6f'}
      ${'signed empty fractional precision'}       | ${'%+.0f'}
      ${'width on empty fractional precision'}     | ${'%5.0f'}
      ${'width at the accepted maximum'}           | ${`%${maxAcceptedField}h`}
      ${'precision at the accepted maximum'}       | ${`%.${maxAcceptedField}h`}
      ${'fractional precision at the maximum'}     | ${`%.${maxAcceptedField}f`}
      ${'zero-padded width at the maximum'}        | ${`%0${maxAcceptedField}h`}
      ${'field between the two documented limits'} | ${'%999999h'}
      ${'precision between the two limits'}        | ${'%.999999f'}
      ${'both fields just below the ceiling'}      | ${'%999999.999999h'}
      ${'exactly the maximum length'}              | ${`${'a'.repeat(maxLength - 2)}%D`}
      ${'whitespace at the maximum length'}        | ${' '.repeat(maxLength)}
      ${'one emoji'}                               | ${`%D${String.fromCodePoint(0x1f44d)}`}
    `('accepts $label', ({ value }: { value: string }) => {
      expect(value.length).toBeLessThanOrEqual(maxLength);
      expect(assertValidFormatString(value)).toBeUndefined();
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();

    test.each`
      label                                   | value
      ${'one past the maximum'}               | ${'a'.repeat(maxLength + 1)}
      ${'far past the maximum'}               | ${'a'.repeat(maxLength * 2)}
      ${'valid directive past the maximum'}   | ${`%D${'a'.repeat(maxLength)}`}
      ${'invalid directive past the maximum'} | ${`%Q${'a'.repeat(maxLength)}`}
      ${'emoji sequence past the limit'}      | ${String.fromCodePoint(0x1f44d).repeat(38)}
      ${'null'}                               | ${null}
      ${'undefined'}                          | ${undefined}
      ${'zero'}                               | ${0}
      ${'negative zero'}                      | ${-0}
      ${'positive number'}                    | ${1}
      ${'negative number'}                    | ${-1}
      ${'decimal number'}                     | ${1.5}
      ${'NaN'}                                | ${Number.NaN}
      ${'Infinity'}                           | ${Number.POSITIVE_INFINITY}
      ${'bigint'}                             | ${bigintValue}
      ${'true'}                               | ${true}
      ${'false'}                              | ${false}
      ${'plain object'}                       | ${{}}
      ${'object with a short length'}         | ${{ length: 1 }}
      ${'array'}                              | ${[]}
      ${'array of a format string'}           | ${['%D']}
      ${'String object'}                      | ${new String('%D')}
      ${'date'}                               | ${new Date(0)}
      ${'symbol'}                             | ${Symbol('%D')}
      ${'function'}                           | ${() => '%D'}
    `(
      'throws "Invalid input string: expected at most 75 characters." for $label',
      ({ value }: { value: unknown }) => {
        expect(() => assertValidFormatString(value)).toThrow(
          new Error(invalidLength),
        );
      },
    );
  });

  describe('rejected format strings', () => {
    test.each([...unsupportedLetters])(
      'throws for unknown specifier %%%s',
      (letter) => {
        expect(() => assertValidFormatString(`%${letter}`)).toThrow(
          new Error(invalidFormat),
        );
      },
    );

    test.each`
      label                                         | value
      ${'unknown specifier'}                        | ${'%Q'}
      ${'unknown specifier in a sentence'}          | ${'cost %Q dollars'}
      ${'unknown specifier after a valid one'}      | ${'ok %h %Q'}
      ${'width on an unknown specifier'}            | ${'%5Q'}
      ${'digits without a specifier'}               | ${'%05'}
      ${'bare precision dot'}                       | ${'%.'}
      ${'width and a bare precision dot'}           | ${'%2.'}
      ${'precision dot without digits'}             | ${'%.h'}
      ${'width and a precision dot without digits'} | ${'%5.h'}
      ${'precision without a specifier'}            | ${'%2.3'}
      ${'bare precision without a specifier'}       | ${'%.2'}
      ${'star'}                                     | ${'%*'}
      ${'hash flag'}                                | ${'%#5h'}
      ${'thousands flag'}                           | ${"%'d"}
      ${'space after the width'}                    | ${'%5 h'}
      ${'minus after the width'}                    | ${'%2-h'}
      ${'plus inside precision'}                    | ${'%.+2h'}
      ${'minus inside precision'}                   | ${'%.-2h'}
      ${'second precision'}                         | ${'%5.2.3h'}
      ${'second precision dot'}                     | ${'%.2.3h'}
      ${'trailing percent'}                         | ${'%'}
      ${'trailing percent after text'}              | ${'ab%'}
      ${'trailing percent after an escape'}         | ${'%%%'}
      ${'percent in ordinary prose'}                | ${'100 % complete'}
      ${'percent then a newline'}                   | ${'%\n'}
      ${'percent then a tab'}                       | ${'%\t'}
      ${'percent then a carriage return'}           | ${'%\r'}
      ${'percent then a non-breaking space'}        | ${'%\u00A0h'}
      ${'width at the rejection ceiling'}           | ${`%${minimumRejectedField}h`}
      ${'precision at the rejection ceiling'}       | ${`%.${minimumRejectedField}f`}
      ${'zero flag and a rejected width'}           | ${`%0${minimumRejectedField}h`}
      ${'digit run past the ceiling'}               | ${`%${'9'.repeat(20)}h`}
      ${'precision digit run past the ceiling'}     | ${`%.${'9'.repeat(20)}f`}
      ${'fullwidth digit is not a width'}           | ${'%\uFF11h'}
      ${'percent then an emoji'}                    | ${`%${String.fromCodePoint(0x1f44d)}`}
    `(
      'throws "Invalid format string: expected a valid format string." for $label',
      ({ value }: { value: string }) => {
        expect(value.length).toBeLessThanOrEqual(maxLength);
        expect(() => assertValidFormatString(value)).toThrow(
          new Error(invalidFormat),
        );
      },
    );
  });

  it('still accepts a valid format string after rejecting an invalid one', () => {
    expect(() => assertValidFormatString('%Q')).toThrow(
      new Error(invalidFormat),
    );
    expect(() => assertValidFormatString('a'.repeat(maxLength + 1))).toThrow(
      new Error(invalidLength),
    );
    expect(assertValidFormatString('%D days')).toBeUndefined();
    expect(
      assertValidFormatString('Time remaining: %h:%02m:%02s'),
    ).toBeUndefined();
  });
});
