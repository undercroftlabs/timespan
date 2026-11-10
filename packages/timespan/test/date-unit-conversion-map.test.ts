import { getConverter } from '../src/unit-conversion-map';

describe('DateUnitConversionMap', () => {

  describe('calculateUnitBetween', () => {
    it('should calculate the number of units between two dates', () => {
      const unit = 'badUnit' as any;
      expect(() => getConverter(unit)).toThrow(
        'Invalid date unit: badUnit',
      );
    });
  });
});
