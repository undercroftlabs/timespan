import type { TimespanJson } from '../types/timespan-json';

/**
 * Checks the serialized Timespan JSON shape.
 * `$type` must be `Timespan`, and `start` and `end` must be strings. The
 * strings are not parsed as dates, and the start is not compared with the
 * end, so a true result does not guarantee that reconstruction will succeed.
 *
 * @param value - The value to inspect.
 * @returns True when the value has the Timespan JSON shape.
 */
export function isTimespanJson(value: unknown): value is TimespanJson {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    '$type' in value &&
    value.$type === 'Timespan' &&
    'start' in value &&
    typeof value.start === 'string' &&
    'end' in value &&
    typeof value.end === 'string'
  );
}
