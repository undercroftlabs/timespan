import { Command } from '../types/command';
import { buildHeader } from '../core/header-builder';
import { requireDistExport } from '../require-dist-export';

export class TestDistribution implements Command {
  public readonly command = 'test:distribution';
  public readonly description = 'Validate The Built Package';

  public async handler(): Promise<number> {
    try {
      console.log(buildHeader('Running tests for the built package...', false));
      this.runTests();
      console.log(buildHeader('All tests passed successfully.', false));
      return 0;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log(buildHeader(`Tests Failed ${message}`, true));
      return 1;
    }
  }

  private runTests() {
    // We must import from the built package. This is important to make
    // sure we are testing the distribution package.
    const Timespan =
      requireDistExport<typeof import('../../src/timespan').Timespan>(
        'Timespan',
      );
    const baseDate = new Date(Date.UTC(2000, 0, 1));
    const timespan = Timespan.fromString(
      '1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss',
      baseDate,
    );

    const years = timespan.toYears();
    const months = timespan.toMonths();
    const weeks = timespan.toWeeks();
    const days = timespan.toDays();
    const hours = timespan.toHours();
    const minutes = timespan.toMinutes();
    const seconds = timespan.toSeconds();
    const milliseconds = timespan.toMilliseconds();
    const dateString = timespan.toString();

    if (years !== 1) {
      throw new Error(`Expected 1 year, got ${years}`);
    }

    if (months !== 14) {
      throw new Error(`Expected 14 months, got ${months}`);
    }

    if (weeks !== 64) {
      throw new Error(`Expected 64 weeks, got ${weeks}`);
    }

    if (days !== 450) {
      throw new Error(`Expected 450 days, got ${days}`);
    }

    if (hours !== 10805) {
      throw new Error(`Expected 10805 hours, got ${hours}`);
    }

    if (minutes !== 648306) {
      throw new Error(`Expected 648306 minutes, got ${minutes}`);
    }

    if (seconds !== 38898367) {
      throw new Error(`Expected 38898367 seconds, got ${seconds}`);
    }

    if (milliseconds !== 38898367008) {
      throw new Error(`Expected 38898367008 milliseconds, got ${milliseconds}`);
    }

    if (dateString !== '1y 2M 3w 4d 5h 6m 7s 8ms') {
      throw new Error(`Expected '1y 2M 3w 4d 5h 6m 7s 8ms', got ${dateString}`);
    }
  }
}
