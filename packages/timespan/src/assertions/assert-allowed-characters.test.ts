import { assertAllowedCharacters } from './assert-allowed-characters';

describe('assertAllowedCharacters', () => {
  describe('accepted strings', () => {
    test.each`
      label                                      | value
      ${'lowercase range start'}                 | ${'a'}
      ${'lowercase range end'}                   | ${'z'}
      ${'uppercase range start'}                 | ${'A'}
      ${'uppercase range end'}                   | ${'Z'}
      ${'digit range start'}                     | ${'0'}
      ${'digit range end'}                       | ${'9'}
      ${'mixed case word'}                       | ${'Timespan'}
      ${'all digits'}                            | ${'0123456789'}
      ${'letters and digits'}                    | ${'Hello123'}
      ${'single space'}                          | ${' '}
      ${'words separated by spaces'}             | ${'Test String'}
      ${'leading and trailing spaces'}           | ${'  1 day  '}
      ${'tab'}                                   | ${'\t'}
      ${'line feed'}                             | ${'\n'}
      ${'carriage return'}                       | ${'\r'}
      ${'form feed'}                             | ${'\f'}
      ${'vertical tab'}                          | ${'\v'}
      ${'non-breaking space'}                    | ${'\u00A0'}
      ${'ogham space mark'}                      | ${'\u1680'}
      ${'en quad'}                               | ${'\u2000'}
      ${'hair space'}                            | ${'\u200A'}
      ${'line separator'}                        | ${'\u2028'}
      ${'paragraph separator'}                   | ${'\u2029'}
      ${'narrow no-break space'}                 | ${'\u202F'}
      ${'medium mathematical space'}             | ${'\u205F'}
      ${'ideographic space'}                     | ${'\u3000'}
      ${'byte order mark'}                       | ${'\uFEFF'}
      ${'letters, digits, and every whitespace'} | ${'Aa0 \t\n\r\f\v\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF'}
      ${'duration-like text'}                    | ${'1y 2M 3w 4d 5h 6m 7s 8ms'}
      ${'long alphanumeric string'}              | ${`${'a1'.repeat(5000)}`}
    `('accepts $label', ({ value }: { value: string }) => {
      expect(assertAllowedCharacters(value)).toBeUndefined();
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();

    test.each`
      label                                       | value
      ${'empty string'}                           | ${''}
      ${'null'}                                   | ${null}
      ${'undefined'}                              | ${undefined}
      ${'zero'}                                   | ${0}
      ${'negative zero'}                          | ${-0}
      ${'positive number'}                        | ${1}
      ${'negative number'}                        | ${-1}
      ${'decimal number'}                         | ${1.5}
      ${'NaN'}                                    | ${Number.NaN}
      ${'Infinity'}                               | ${Number.POSITIVE_INFINITY}
      ${'bigint'}                                 | ${bigintValue}
      ${'true'}                                   | ${true}
      ${'false'}                                  | ${false}
      ${'plain object'}                           | ${{}}
      ${'array'}                                  | ${[]}
      ${'array of allowed characters'}            | ${['a', 'b']}
      ${'String object'}                          | ${new String('abc')}
      ${'date'}                                   | ${new Date(0)}
      ${'symbol'}                                 | ${Symbol('day')}
      ${'function'}                               | ${() => 'day'}
      ${'character before digits'}                | ${'/'}
      ${'character after digits'}                 | ${':'}
      ${'character before uppercase'}             | ${'@'}
      ${'character after uppercase'}              | ${'['}
      ${'character before lowercase'}             | ${'`'}
      ${'character after lowercase'}              | ${'{'}
      ${'exclamation mark'}                       | ${'!'}
      ${'at sign'}                                | ${'@'}
      ${'hash'}                                   | ${'#'}
      ${'dollar sign'}                            | ${'$'}
      ${'percent'}                                | ${'%'}
      ${'caret'}                                  | ${'^'}
      ${'ampersand'}                              | ${'&'}
      ${'asterisk'}                               | ${'*'}
      ${'open parenthesis'}                       | ${'('}
      ${'close parenthesis'}                      | ${')'}
      ${'tilde'}                                  | ${'~'}
      ${'plus'}                                   | ${'+'}
      ${'hyphen'}                                 | ${'-'}
      ${'equals'}                                 | ${'='}
      ${'underscore'}                             | ${'_'}
      ${'open bracket'}                           | ${'['}
      ${'close bracket'}                          | ${']'}
      ${'open brace'}                             | ${'{'}
      ${'close brace'}                            | ${'}'}
      ${'pipe'}                                   | ${'|'}
      ${'backslash'}                              | ${'\\'}
      ${'semicolon'}                              | ${';'}
      ${'colon'}                                  | ${':'}
      ${'single quote'}                           | ${"'"}
      ${'double quote'}                           | ${'"'}
      ${'comma'}                                  | ${','}
      ${'period'}                                 | ${'.'}
      ${'less than'}                              | ${'<'}
      ${'greater than'}                           | ${'>'}
      ${'question mark'}                          | ${'?'}
      ${'slash'}                                  | ${'/'}
      ${'invalid character at the start'}         | ${'!hello'}
      ${'invalid character in the middle'}        | ${'hel!lo'}
      ${'invalid character at the end'}           | ${'hello!'}
      ${'hyphenated duration'}                    | ${'1-day'}
      ${'decimal duration'}                       | ${'1.5 hours'}
      ${'comma-separated text'}                   | ${'1 day, 2 hours'}
      ${'accented letter'}                        | ${'café'}
      ${'cyrillic lookalike'}                     | ${'\u0430'}
      ${'fullwidth digit'}                        | ${'\uFF11'}
      ${'cjk text'}                               | ${'日本語'}
      ${'emoji'}                                  | ${`a${String.fromCodePoint(0x1f44d)}`}
      ${'null character inside text'}             | ${'a\0b'}
      ${'zero-width space'}                       | ${'\u200B'}
      ${'zero-width non-joiner'}                  | ${'\u200C'}
      ${'next line'}                              | ${'\u0085'}
      ${'mongolian vowel separator'}              | ${'\u180E'}
      ${'whitespace around an invalid character'} | ${' \t!\n'}
      ${'long string with one invalid character'} | ${`${'a'.repeat(5000)}!`}
    `(
      'throws "Invalid input string: expected letters, digits, and whitespace only." for $label',
      ({ value }: { value: unknown }) => {
        expect(() => assertAllowedCharacters(value)).toThrow(
          new Error('Invalid input string: expected letters, digits, and whitespace only.'),
        );
      },
    );
  });

  it('still accepts a valid string after rejecting an invalid one', () => {
    expect(() => assertAllowedCharacters('1-day')).toThrow(
      new Error('Invalid input string: expected letters, digits, and whitespace only.'),
    );
    expect(assertAllowedCharacters('1 day')).toBeUndefined();
    expect(assertAllowedCharacters('1 day')).toBeUndefined();
  });
});
