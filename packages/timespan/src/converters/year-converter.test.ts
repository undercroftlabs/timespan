import { YearConverter } from './year-converter';

describe('YearConverter', () => {
  let yearConverter: YearConverter;

  beforeEach(() => {
    yearConverter = new YearConverter();
  });

  describe('between', () => {
    it.each`
      label                                              | start                    | end                      | years
      ${'whole years'}                                   | ${'2020-01-01T00:00:00'} | ${'2023-01-01T00:00:00'} | ${3}
      ${'a range that falls within a leap year'}         | ${'2020-02-29T00:00:00'} | ${'2024-02-29T00:00:00'} | ${4}
      ${'a range that does not fall within a leap year'} | ${'2021-02-28T00:00:00'} | ${'2024-02-28T00:00:00'} | ${3}
      ${'a range that covers a leap year'}               | ${'2020-01-01'}          | ${'2021-12-31'}          | ${1}
    `(
      'counts $label',
      ({
        start,
        end,
        years,
      }: {
        start: string;
        end: string;
        years: number;
      }) => {
        expect(yearConverter.between(new Date(start), new Date(end))).toBe(
          years,
        );
      },
    );
  });

  describe('add', () => {
    it('should add the specified number of years to a date', () => {
      const startDate = new Date('2020-01-01T00:00:00Z');
      const result = yearConverter.add(3, startDate);

      expect(result.getUTCFullYear()).toBe(2023);
      expect(result.getUTCMonth()).toBe(0); // January (0-indexed)
      expect(result.getUTCDate()).toBe(1);
    });

    it('should handle leap years correctly', () => {
      const startDate = new Date('2020-02-29T00:00:00');
      const result = yearConverter.add(4, startDate);
      expect(result).toEqual(new Date('2024-02-29T00:00:00'));
    });

    it('should handle February 29th when adding years to a date', () => {
      const startDate = new Date('2020-02-29T00:00:00');
      const targetYear = 2021; // A non-leap year
      const result = yearConverter.add(1, startDate);

      // Check if the result is February 28th of the target year
      expect(result.getUTCFullYear()).toBe(targetYear);
      expect(result.getUTCMonth()).toBe(1); // February is month 1 (zero-based index)
      expect(result.getUTCDate()).toBe(28);
    });
  });
});
