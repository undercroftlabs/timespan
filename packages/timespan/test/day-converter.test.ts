import { DayConverter } from '../src/converters/day-converter';

describe('DayConverter', () => {
  let dayConverter: DayConverter;

  beforeEach(() => {
    dayConverter = new DayConverter();
  });

  describe('between', () => {
    it('should calculate the number of days between two dates', () => {
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-31');
      const result = dayConverter.between(startDate, endDate);
      expect(result).toBe(30);
    });
  });

  describe('add', () => {
    it('should add the specified number of days to a date', () => {
      const startDate = new Date('2023-05-01');
      const result = dayConverter.add(5, startDate);
      expect(result).toEqual(new Date('2023-05-06'));
    });
  });
});
