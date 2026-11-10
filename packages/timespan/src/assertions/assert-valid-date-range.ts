import { isValidDateRange } from '../type-utils/is-valid-date-range';

/**
 * Asserts that the start date is not after the end date.
 * @param startDate - The proposed start date.
 * @param endDate - The proposed end date.
 * @throws Error if the date range is invalid.
 */
export function assertValidDateRange(startDate: Date, endDate: Date): void {
  if (!isValidDateRange(startDate, endDate)) {
    throw new Error('Start date cannot be greater than end date.');
  }
}
