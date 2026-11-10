/**
 * Asserts that `startDate` and `endDate` are valid dates and that the start
 * is less than or equal to the end. Equal instants are accepted.
 * @param startDate - Proposed start. Non-dates and invalid dates are rejected.
 * @param endDate - Proposed end. Non-dates and invalid dates are rejected.
 * @throws {Error} `Invalid date range: expected the start date to be less than or equal to the end date.`
 * @example
 * assertValidDateRange(new Date(0), new Date(1));
 */
export function assertValidDateRange(
  startDate: unknown,
  endDate: unknown,
): void {
  if (
    !(startDate instanceof Date) ||
    !(endDate instanceof Date) ||
    !(startDate.getTime() <= endDate.getTime())
  ) {
    throw new Error(
      'Invalid date range: expected the start date to be less than or equal to the end date.',
    );
  }
}
