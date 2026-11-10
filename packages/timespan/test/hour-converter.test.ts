import { HourConverter } from '../src/converters/hour-converter';

describe('HourConverter', () => {
  let hourConverter: HourConverter;

  beforeEach(() => {
    hourConverter = new HourConverter();
  });

  describe('between', () => {
    it('should calculate the number of hours between two dates', () => {
      const startDate = new Date('2023-05-01T12:00:00');
      const endDate = new Date('2023-05-02T06:30:00');
      const result = hourConverter.between(startDate, endDate);
      expect(result).toBe(18);
    });
  });

  describe('add', () => {
    it('should add the specified number of hours to a date', () => {
      const startDate = new Date('2023-05-01T12:00:00');
      const result = hourConverter.add(3.5, startDate);
      expect(result).toEqual(new Date('2023-05-01T15:30:00'));
    });
  });
});
