import { MillisecondConverter } from '../src/converters/millisecond-converter';

describe('MillisecondConverter', () => {
  let millisecondConverter: MillisecondConverter;

  beforeEach(() => {
    millisecondConverter = new MillisecondConverter();
  });

  describe('between', () => {
    it('should calculate the difference in milliseconds between two dates', () => {
      const startDate = new Date('2023-05-01T12:00:00');
      const endDate = new Date('2023-05-01T12:00:01.500');
      const result = millisecondConverter.between(startDate, endDate);
      expect(result).toBe(1500);
    });
  });

  describe('add', () => {
    it('should add the specified number of milliseconds to a date', () => {
      const startDate = new Date('2023-05-01T12:00:00');
      const result = millisecondConverter.add(500, startDate);
      expect(result).toEqual(new Date('2023-05-01T12:00:00.500'));
    });
  });
});
