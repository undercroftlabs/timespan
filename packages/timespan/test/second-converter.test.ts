import { SecondConverter } from '../src/converters/second-converter';

describe('SecondConverter', () => {
  let secondConverter: SecondConverter;

  beforeEach(() => {
    secondConverter = new SecondConverter();
  });

  describe('between', () => {
    it('should calculate the number of seconds between two dates', () => {
      const startDate = new Date('2023-05-01T00:00:00');
      const endDate = new Date('2023-05-01T00:00:10');
      const result = secondConverter.between(startDate, endDate);
      expect(result).toBe(10);
    });
  });

  describe('add', () => {
    it('should add the specified number of seconds to a date', () => {
      const startDate = new Date('2023-05-01T00:00:00');
      const result = secondConverter.add(10, startDate);
      expect(result).toEqual(new Date('2023-05-01T00:00:10'));
    });
  });
});
