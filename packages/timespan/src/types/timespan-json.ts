/**
 * Public JSON shape of a timespan.
 * `Timespan.toJSON` returns this object, and `Timespan.fromJSON` reads it.
 * `$type` is the discriminator. `start` and `end` are strings. `toJSON` writes
 * ISO strings. A value of this type is only the serialized shape: the strings
 * are not required to be dates, and `start` is not required to be at or before
 * `end`, until `fromJSON` reconstructs the timespan.
 */
export type TimespanJson = {
  /**
   * Discriminator for a serialized timespan.
   */
  $type: 'Timespan';
  /**
   * Start instant. `toJSON` writes an ISO string.
   */
  start: string;
  /**
   * End instant. `toJSON` writes an ISO string.
   */
  end: string;
};
