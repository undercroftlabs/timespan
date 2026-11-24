import type { Timespan } from '../timespan';

/**
 * Result of {@link Timespan.tryCreate}.
 *
 * `success` selects the branch. A success result carries the constructed
 * {@link Timespan} on `value`. A failure result carries the `Error` from the
 * constructor's endpoint checks on `error`. The two shapes do not share
 * optional fields.
 */
export type TimespanCreationResult =
  | {
      /**
       * Construction succeeded.
       */
      success: true;
      /**
       * Timespan built from the supplied endpoints.
       */
      value: Timespan;
    }
  | {
      /**
       * Construction failed validation.
       */
      success: false;
      /**
       * Validation error from the constructor's endpoint checks.
       * The thrown instance is returned. It is not wrapped.
       */
      error: Error;
    };
