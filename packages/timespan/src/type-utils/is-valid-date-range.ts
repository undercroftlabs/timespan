/**
 * Checks whether the start date is less than or equal to the end date.
 * @param startDate - The proposed start date.
 * @param endDate - The proposed end date.
 * @returns True if the range is valid.
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate.getTime() <= endDate.getTime();
}
