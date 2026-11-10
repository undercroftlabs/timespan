import { MinuteConverter } from '../src/converters/minute-converter';

describe('MinuteConverter', () => {
  let minuteConverter: MinuteConverter;

  beforeEach(() => {
    minuteConverter = new MinuteConverter();
  });

  describe('between', () => {
    it('should calculate the number of minutes between two dates', () => {
      const startDate = new Date('2023-05-01T12:00:00');
      const endDate = new Date('2023-05-01T12:30:00');
      const result = minuteConverter.between(startDate, endDate);
      expect(result).toBe(30);
    });
  });

  describe('add', () => {
    it('should add the specified number of minutes to a date', () => {
      const startDate = new Date('2023-05-01T12:00:00');
      const result = minuteConverter.add(45, startDate);
      expect(result).toEqual(new Date('2023-05-01T12:45:00'));
    });
  });
});
