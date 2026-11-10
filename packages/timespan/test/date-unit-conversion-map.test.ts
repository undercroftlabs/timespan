import { getConverter } from '../src/unit-conversion-map';
import { TimeUnit } from '../src/types';

describe('DateUnitConversionMap', () => {
  describe('calculateUnitBetween', () => {
    it('should calculate the number of units between two dates', () => {
      const unit = 'badUnit' as unknown as TimeUnit;
      expect(() => getConverter(unit)).toThrow('Invalid date unit: badUnit');
    });
  });
});
