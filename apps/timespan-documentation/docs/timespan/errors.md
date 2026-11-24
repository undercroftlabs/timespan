---
title: Errors
description: Invalid dates, duration strings, and format strings throw.
product: Timespan
group: Reference
order: 13
---

Public methods throw `Error` unless the table says otherwise. Messages are exact.

## Dates

| Condition                                   | Message                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Value is not a `Date`, or its time is `NaN` | `Invalid date: expected a valid Date.`                                                  |
| Start is after the end                      | `Invalid date range: expected the start date to be less than or equal to the end date.` |

Equal endpoints are valid. Date strings and numeric timestamps are not accepted in place of a `Date`.

```typescript
import { Timespan } from '@undercroft/timespan';

// Error: Invalid date: expected a valid Date.
new Timespan(new Date('not a date'), new Date('2024-01-01T00:00:00.000Z'));

// Error: Invalid date range: expected the start date to be less than or equal to the end date.
new Timespan(
  new Date('2024-02-01T00:00:00.000Z'),
  new Date('2024-01-01T00:00:00.000Z'),
);
```

The representable instant range is `-8.64e15` through `8.64e15` milliseconds. An addition past either bound throws `Invalid number of <unit>: expected a result within the representable date range.`

## Duration strings

`fromString` checks length, then characters, then the unit grammar. See [Parsing durations](/docs/timespan/parsing#input-rules).

| Condition                                                          | Message                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Not a string, or longer than 75 characters                         | `Invalid input string: expected at most 75 characters.`                |
| Empty, or any character other than letters, digits, and whitespace | `Invalid input string: expected letters, digits, and whitespace only.` |
| Digits with no unit, or whitespace only                            | `Invalid unit`                                                         |
| Bare unit, or an amount longer than 10 digits                      | `Invalid input string`                                                 |
| Unknown unit                                                       | `Invalid time unit: expected a recognized time unit.`                  |
| Same unit twice, including two aliases of one unit                 | `Duplicate date unit: <token>.`                                        |

```typescript
import { Timespan } from '@undercroft/timespan';

// Error: Invalid input string: expected letters, digits, and whitespace only.
Timespan.fromString('1.5h');
```

Fractions of a fixed-length unit are accepted by the factories, such as `Timespan.fromHours(1.5)`.

## Amounts

| Call                                          | Condition                                   | Message                                                         |
| --------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| Unit factories and `fromUnits`                | `amount < 0`                                | `Invalid unit input <amount>.`                                  |
| Unit factories, `fromUnits`, and `fromObject` | `NaN`, `Infinity`, or a non-number field    | `Invalid number of <unit>: expected zero or a positive number.` |
| `fromObject`                                  | `amount < 0`                                | `Invalid number of <unit>: expected zero or a positive number.` |
| `fromObject`                                  | Value is `null`, an array, or not an object | `TypeError: Invalid timeframe: expected an object.`             |

A negative factory amount and a negative `fromObject` field throw different messages.

## Format strings

| Condition                                                                           | Message                                                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Not a string                                                                        | `Invalid format string: expected a string.`              |
| Unknown specifier, incomplete directive, or width or precision of 1,000,000 or more | `Invalid format string: expected a valid format string.` |

```typescript
import { Timespan } from '@undercroft/timespan';

const timespan = Timespan.fromHours(1);

// Error: Invalid format string: expected a valid format string.
timespan.format('%Q');
```

## JSON

| Call                           | Condition                                            | Message                             |
| ------------------------------ | ---------------------------------------------------- | ----------------------------------- |
| `parse`                        | Text is not JSON                                     | `SyntaxError` from `JSON.parse`     |
| `fromJSON`, `parse`, `reviver` | Missing `$type: 'Timespan'` or non-string endpoints  | `TypeError: Invalid Timespan JSON.` |
| `fromJSON`, `parse`, `reviver` | Endpoint string is not a date, or start is after end | The date messages above             |

`isTimespanJSON` does not throw. It can return true for strings that `fromJSON` will reject.

## Related

[Date ranges](/docs/timespan/date-ranges) · [Parsing durations](/docs/timespan/parsing) · [Format string](/docs/timespan/format-string) · [Saving and restoring](/docs/timespan/serialization)
