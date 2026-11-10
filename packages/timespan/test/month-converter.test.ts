import { MonthConverter } from '../src/converters/month-converter';

describe('MonthConverter', () => {
  let monthConverter: MonthConverter;

  beforeEach(() => {
    monthConverter = new MonthConverter();
  });

  describe('between', () => {
    it('should calculate the number of months between two dates', () => {
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-07-01');
      const result = monthConverter.between(startDate, endDate);
      expect(result).toBe(2);
    });

    it('should handle end day less than start day', () => {
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-07-15');
      const result = monthConverter.between(startDate, endDate);
      expect(result).toBe(2);
    });

    it('adjusts months if endDay is less than startDay', () => {
      const startDate = new Date('2022-01-15T00:00:00.000Z');
      const endDate = new Date('2022-02-01T00:00:00.000Z');
      const months = monthConverter.between(startDate, endDate);
      expect(months).toBe(0);
    });
  });

  describe('add', () => {
    it('should add the specified number of months to a date', () => {
      const startDate = new Date('2023-05-01T00:00:00');
      const result = monthConverter.add(3, startDate);
      const expectedDate = new Date('2023-08-01T00:00:00');
      expect(result.toISOString()).toEqual(expectedDate.toISOString());
    });

    it('should handle year transition when adding months', () => {
      const startDate = new Date('2023-11-01T00:00:00.000Z');
      const result = monthConverter.add(4, startDate);
      const expectedDate = new Date('2024-03-01T00:00:00.000Z');
      expect(result).toEqual(expectedDate);
    });
  });
});
