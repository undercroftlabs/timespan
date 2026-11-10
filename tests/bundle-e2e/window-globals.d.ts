export {};

type TimespanCompareBy = 'range' | 'duration';

interface TimespanInstance {
  readonly start: Date;
  readonly end: Date;
  toTimeframe: () => Record<string, number>;
  toString: () => string;
  toUnit: (unit: string) => number;
  toMilliseconds: () => number;
  toSeconds: () => number;
  toMinutes: () => number;
  toHours: () => number;
  toDays: () => number;
  toWeeks: () => number;
  toMonths: () => number;
  toYears: () => number;
  equals: (other: TimespanInstance, compareBy?: TimespanCompareBy) => boolean;
  compareTo: (other: TimespanInstance) => number;
}

interface TimespanConstructor {
  new (start: Date, end: Date): TimespanInstance;
  fromString: (input: string, startDate?: Date) => TimespanInstance;
  fromUnits: (
    amount: number,
    unit: string,
    startDate?: Date,
  ) => TimespanInstance;
  fromMilliseconds: (millis: number, startDate?: Date) => TimespanInstance;
  fromSeconds: (seconds: number, startDate?: Date) => TimespanInstance;
  fromMinutes: (minutes: number, startDate?: Date) => TimespanInstance;
  fromHours: (hours: number, startDate?: Date) => TimespanInstance;
  fromDays: (days: number, startDate?: Date) => TimespanInstance;
  fromWeeks: (weeks: number, startDate?: Date) => TimespanInstance;
  fromMonths: (months: number, startDate?: Date) => TimespanInstance;
  fromYears: (years: number, startDate?: Date) => TimespanInstance;
  equals: (
    ts1: TimespanInstance,
    ts2: TimespanInstance,
    compareBy?: TimespanCompareBy,
  ) => boolean;
  compareTo: (ts1: TimespanInstance, ts2: TimespanInstance) => number;
}

declare global {
  interface Window {
    Timespan?: TimespanConstructor;
    TimespanDefault?: TimespanConstructor;
    bundleReady?: boolean;
    pageErrors?: string[];
  }
}
