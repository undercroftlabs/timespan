import { WeekConverter } from '../src/converters/week-converter';

describe('WeekConverter', () => {
  let weekConverter: WeekConverter;

  beforeEach(() => {
    weekConverter = new WeekConverter();
  });

  describe('between', () => {
    it('should calculate the number of weeks between two dates', () => {
      const startDate = new Date('2023-05-01T00:00:00');
      const endDate = new Date('2023-05-15T00:00:00');
      const result = weekConverter.between(startDate, endDate);
      expect(result).toBe(2);
    });
  });

  describe('add', () => {
    it('should add the specified number of weeks to a date', () => {
      const startDate = new Date('2023-05-01T00:00:00');
      const result = weekConverter.add(2, startDate);
      expect(result).toEqual(new Date('2023-05-15T00:00:00'));
    });
  });
});
