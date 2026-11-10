import { expect, Page } from '@playwright/test';

/**
 * Public API checks that run in the browser against a loaded Timespan constructor.
 * Values match the documented README examples and the existing distribution smoke test.
 * @param page Playwright page with Timespan already loaded onto `window`.
 */
export async function expectPublicApiContract(page: Page): Promise<void> {
  const result = await page.evaluate(() => {
    const Timespan = window.Timespan;
    if (typeof Timespan !== 'function') {
      throw new Error('Timespan constructor is not available on window.');
    }

    const start = new Date('2023-01-01T00:00:00.000Z');
    const end = new Date('2023-01-15T00:00:00.000Z');
    const constructed = new Timespan(start, end);
    const parsed = Timespan.fromString('3d 5h 30m', start);
    const fromHours = Timespan.fromHours(24, start);
    const fromDays = Timespan.fromDays(1, start);
    const canonical = Timespan.fromString(
      '1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss',
      new Date(Date.UTC(2000, 0, 1)),
    );

    let invalidUnitMessage = '';
    try {
      Timespan.fromString('5');
    } catch (error) {
      invalidUnitMessage =
        error instanceof Error ? error.message : String(error);
    }

    let invalidRangeMessage = '';
    try {
      new Timespan(
        new Date('2023-06-01T00:00:00.000Z'),
        new Date('2023-05-31T00:00:00.000Z'),
      );
    } catch (error) {
      invalidRangeMessage =
        error instanceof Error ? error.message : String(error);
    }

    let invalidDateMessage = '';
    try {
      new Timespan(new Date('not a date'), end);
    } catch (error) {
      invalidDateMessage =
        error instanceof Error ? error.message : String(error);
    }

    return {
      isConstructor: typeof Timespan === 'function',
      hasFromString: typeof Timespan.fromString === 'function',
      startIso: constructed.start.toISOString(),
      endIso: constructed.end.toISOString(),
      days: constructed.toDays(),
      hours: constructed.toHours(),
      weeks: constructed.toWeeks(),
      milliseconds: constructed.toMilliseconds(),
      timeframe: constructed.toTimeframe(),
      parsedString: parsed.toString(),
      parsedHours: parsed.toHours(),
      fromHoursDays: fromHours.toDays(),
      equalDuration: fromHours.equals(fromDays),
      compareTo: Timespan.compareTo(fromHours, Timespan.fromHours(12, start)),
      canonical: {
        years: canonical.toYears(),
        months: canonical.toMonths(),
        weeks: canonical.toWeeks(),
        days: canonical.toDays(),
        hours: canonical.toHours(),
        minutes: canonical.toMinutes(),
        seconds: canonical.toSeconds(),
        milliseconds: canonical.toMilliseconds(),
        dateString: canonical.toString(),
      },
      invalidUnitMessage,
      invalidRangeMessage,
      invalidDateMessage,
    };
  });

  expect(result.isConstructor).toBe(true);
  expect(result.hasFromString).toBe(true);
  expect(result.startIso).toBe('2023-01-01T00:00:00.000Z');
  expect(result.endIso).toBe('2023-01-15T00:00:00.000Z');
  expect(result.days).toBe(14);
  expect(result.hours).toBe(336);
  expect(result.weeks).toBe(2);
  expect(result.milliseconds).toBe(1_209_600_000);
  expect(result.timeframe).toMatchObject({
    years: 0,
    months: 0,
    weeks: 2,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  expect(result.parsedString).toBe('3d 5h 30m');
  expect(result.parsedHours).toBe(77);
  expect(result.fromHoursDays).toBe(1);
  expect(result.equalDuration).toBe(true);
  expect(result.compareTo).toBe(1);
  expect(result.canonical).toEqual({
    years: 1,
    months: 14,
    weeks: 64,
    days: 450,
    hours: 10805,
    minutes: 648306,
    seconds: 38898367,
    milliseconds: 38898367008,
    dateString: '1y 2M 3w 4d 5h 6m 7s 8ms',
  });
  expect(result.invalidUnitMessage).toBe('Invalid unit');
  expect(result.invalidRangeMessage).toBe(
    'Start date cannot be greater than end date.',
  );
  expect(result.invalidDateMessage).toBe('Invalid date input.');
}

/**
 * Assert that the fixture captured no unexpected script errors.
 * @param page Playwright page.
 */
export async function expectNoPageErrors(page: Page): Promise<void> {
  const errors = await page.evaluate(() => window.pageErrors || []);
  expect(errors).toEqual([]);
}

/**
 * Wait until the fixture has finished loading the distribution bundle.
 * @param page Playwright page.
 */
export async function waitForBundle(page: Page): Promise<void> {
  await page.waitForFunction(() => window.bundleReady === true);
}
