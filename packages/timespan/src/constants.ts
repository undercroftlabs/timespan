export default {
  /**
   * /^[a-zA-Z0-9\s]+$/
   *
   * This regex pattern ensures that the entire input string consists of
   * one or more uppercase or lowercase letters, digits, or whitespace
   * characters. It does not allow any other characters in the string.
   *
   * This Regex, combined with some other strategies should
   * help reduce the vulnerability. It is still recommended to clean any input
   * you are using, especially if it originates from an uncontrolled source
   * such as a user typing input into an input field on the internet.
   *
   * - ^:
   * This anchor asserts the start of the string. It specifies that the
   * matching pattern should start at the beginning of the string.
   *
   * - [a-zA-Z0-9\s]+: This character set specifies the allowed characters
   * in the string. It matches one or more occurrences (+) of any uppercase
   * or lowercase letter ([a-zA-Z]), digit (0-9), or whitespace character (\s).
   *
   * - $: This anchor asserts the end of the string. It specifies that the
   * matching pattern should end at the end of the string.
   *
   * "Hello123": This input matches the pattern because it consists of
   * only letters and digits.
   *
   * "Test String": This input matches the pattern because it consists of
   * only letters and whitespace characters.
   *
   * "123-456": This input does not match the pattern because it contains
   * a hyphen character, which is not allowed.
   *
   * "@#$": This input does not match the pattern because it contains special
   * characters that are not part of the allowed character set.
   */
  AllowedCharactersRegexPattern: /^[a-zA-Z0-9\s]+$/,
  CenturyDivisor: 100,
  DaysPerWeek: 7,
  DaysPerYear: 365,
  HoursPerDay: 24,

  /**
   * /(\d{0,10})([^\s\d]+)/g
   *
   * This regex pattern /(\d{0,10})([^\s\d]+)/g aims to match and
   * a sequence of digits (0-9) of up to 10 characters, captured in the first group.
   * A series of one or more non-whitespace, non-digit characters, captured in
   * the second group.
   *
   * No regex is perfect. It is recommended that you clean any input
   * you are using, especially if it originates from an uncontrolled source
   * such as a user typing input into an input field on the internet.
   *
   * - (\d{0,10}):
   * This part captures a sequence of digits (0-9) that can occur between
   * 0 and 10 times. The parentheses ( ) indicate a capturing group, which
   * means the matched digits will be stored and accessible separately.
   *
   * - ([^\s\d]+): This part captures one or more characters that are not
   * whitespace and not digits. The square brackets [ ] define a character
   * class, and the ^ at the beginning of the class negates it. So [^\s\d]
   * matches any character that is not a whitespace character or a digit.
   * The + quantifier specifies that one or more characters should be matched.
   *
   * - g:
   * The g flag stands for "global" and indicates that the regex should
   * search for all matches in the input string, rather than stopping after
   * the first match.
   *
   * A few examples of acceptable inputs are:
   *
   * 1y 2M 3w 4d 5h 6m 7s 8ms
   *
   * 1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss
   *
   * 2years 1month 3weeks 4days
   */
  InputRegexPattern: /(\d{0,10})([^\s\d]+)/g,
  /**
   * This is the index of the unit in the inputString
   * regex match.
   */
  InputRegexUnitIndex: 2,
  /**
   * This is the index of the value in the inputString
   * regex match.
   */
  InputRegexValueIndex: 1,
  LeapYearDivisor: 4,
  /**
   * This sets the max allowable input string length to help reduce Regex
   * Denial of Service attacks. This combined with some other strategies should
   * help reduce the vulnerability. It is still recommended to clean any input
   * you are using, especially if it originates from an uncontrolled source
   * such as a user typing input into an input field on the internet.
   */
  MaxInputStringLength: 75,
  MillisecondsPerSecond: 1000,
  MinutesPerHour: 60,
  MonthsPerYear: 12,
  QuadricentennialDivisor: 400,
  SecondsPerMinute: 60,
};
