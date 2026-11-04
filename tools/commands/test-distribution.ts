import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { Command } from '../types/command';
import { buildHeader } from '../core/header-builder';
import { requireDistExport } from '../require-dist-export';

type TimespanCtor = typeof import('../../src/timespan').Timespan;

/**
 * Load an ESM module without letting ts-node rewrite `import()` to `require()`.
 * @param specifier File URL or path to import.
 * @returns The imported module namespace.
 */
const importEsm = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<Record<string, unknown>>;

interface CanonicalResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  dateString: string;
}

export class TestDistribution implements Command {
  public readonly command = 'test:distribution';
  public readonly description = 'Validate The Built Package';

  public async handler(): Promise<number> {
    try {
      console.log(buildHeader('Running tests for the built package...', false));
      await this.runTests();
      console.log(buildHeader('All tests passed successfully.', false));
      return 0;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log(buildHeader(`Tests Failed ${message}`, true));
      return 1;
    }
  }

  private async runTests(): Promise<void> {
    this.assertDeclarationFiles();
    this.assertCjsDistribution();
    await this.assertEsmDistribution();
    await this.assertPackedConsumer();
  }

  private distPath(fileName: string): string {
    return path.resolve(__dirname, '../../dist', fileName);
  }

  private assertFileExists(fileName: string): void {
    const filePath = this.distPath(fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Expected distribution file missing: ${fileName}`);
    }
  }

  private assertDeclarationFiles(): void {
    this.assertFileExists('index.d.ts');
    this.assertFileExists('index.d.mts');
    const declaration = fs.readFileSync(this.distPath('index.d.ts'), 'utf8');
    if (!declaration.includes('declare class Timespan')) {
      throw new Error(
        'TypeScript declarations do not export class Timespan for consumers.',
      );
    }
    if (!declaration.includes('export { Timespan, Timespan as default }')) {
      throw new Error(
        'TypeScript declarations do not re-export Timespan as named and default.',
      );
    }
  }

  private assertCjsDistribution(): void {
    this.assertFileExists('index.js');
    const Timespan = requireDistExport<TimespanCtor>('Timespan');
    this.assertCanonicalTimespan(Timespan);
  }

  private async assertEsmDistribution(): Promise<void> {
    this.assertFileExists('index.mjs');
    const esmPath = this.distPath('index.mjs');
    const imported = (await importEsm(pathToFileURL(esmPath).href)) as {
      Timespan: TimespanCtor;
      default: TimespanCtor;
    };
    if (typeof imported.Timespan !== 'function') {
      throw new Error('ESM distribution does not export Timespan.');
    }
    if (imported.default !== imported.Timespan) {
      throw new Error(
        'ESM default export does not match named Timespan export.',
      );
    }
    this.assertCanonicalTimespan(imported.Timespan);
  }

  private assertCanonicalTimespan(Timespan: TimespanCtor): CanonicalResult {
    const baseDate = new Date(Date.UTC(2000, 0, 1));
    const timespan = Timespan.fromString(
      '1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss',
      baseDate,
    );

    const result: CanonicalResult = {
      years: timespan.toYears(),
      months: timespan.toMonths(),
      weeks: timespan.toWeeks(),
      days: timespan.toDays(),
      hours: timespan.toHours(),
      minutes: timespan.toMinutes(),
      seconds: timespan.toSeconds(),
      milliseconds: timespan.toMilliseconds(),
      dateString: timespan.toString(),
    };

    this.expectEqual(result.years, 1, 'years');
    this.expectEqual(result.months, 14, 'months');
    this.expectEqual(result.weeks, 64, 'weeks');
    this.expectEqual(result.days, 450, 'days');
    this.expectEqual(result.hours, 10805, 'hours');
    this.expectEqual(result.minutes, 648306, 'minutes');
    this.expectEqual(result.seconds, 38898367, 'seconds');
    this.expectEqual(result.milliseconds, 38898367008, 'milliseconds');
    this.expectEqual(result.dateString, '1y 2M 3w 4d 5h 6m 7s 8ms', 'toString');
    return result;
  }

  private expectEqual<T>(actual: T, expected: T, label: string): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${label} ${String(expected)}, got ${String(actual)}`,
      );
    }
  }

  private async assertPackedConsumer(): Promise<void> {
    const repoRoot = path.resolve(__dirname, '../..');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'timespan-pack-'));
    let tarballPath: string | undefined;

    try {
      const packJson = execFileSync('npm', ['pack', '--json'], {
        cwd: repoRoot,
        encoding: 'utf8',
      });
      const packed = JSON.parse(packJson) as Array<{ filename: string }>;
      if (!packed[0]?.filename) {
        throw new Error('npm pack did not report a tarball filename.');
      }

      tarballPath = path.join(repoRoot, packed[0].filename);
      const expectedLayout = [
        'package.json',
        'dist/index.js',
        'dist/index.mjs',
        'dist/index.umd.js',
        'dist/index.d.ts',
        'dist/index.d.mts',
      ];

      execFileSync('npm', ['init', '--yes'], { cwd: tmpDir, stdio: 'pipe' });
      execFileSync('npm', ['install', tarballPath], {
        cwd: tmpDir,
        stdio: 'pipe',
      });

      const installedRoot = path.join(
        tmpDir,
        'node_modules',
        '@undercroft',
        'timespan',
      );
      for (const relativePath of expectedLayout) {
        const absolutePath = path.join(installedRoot, relativePath);
        if (!fs.existsSync(absolutePath)) {
          throw new Error(
            `Packed package is missing ${relativePath} after npm install.`,
          );
        }
      }

      const cjsModule = require(installedRoot) as {
        Timespan: TimespanCtor;
        default?: TimespanCtor;
      };
      if (typeof cjsModule.Timespan !== 'function') {
        throw new Error('Packed CJS package does not export Timespan.');
      }
      this.assertCanonicalTimespan(cjsModule.Timespan);

      const packedEsm = (await importEsm(
        pathToFileURL(path.join(installedRoot, 'dist/index.mjs')).href,
      )) as { Timespan: TimespanCtor };
      this.assertCanonicalTimespan(packedEsm.Timespan);

      this.assertConsumerTypeScriptImports(tmpDir, repoRoot);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      if (tarballPath && fs.existsSync(tarballPath)) {
        fs.unlinkSync(tarballPath);
      }
    }
  }

  private assertConsumerTypeScriptImports(
    consumerDir: string,
    repoRoot: string,
  ): void {
    const consumerFile = path.join(consumerDir, 'consumer.ts');
    const tsconfigFile = path.join(consumerDir, 'tsconfig.json');
    fs.writeFileSync(
      consumerFile,
      [
        "import TimespanDefault, { Timespan } from '@undercroft/timespan';",
        '',
        'const start = new Date("2023-01-01T00:00:00.000Z");',
        'const parsed: Timespan = Timespan.fromString("3d 5h 30m", start);',
        'const constructed: Timespan = new TimespanDefault(',
        '  start,',
        '  new Date("2023-01-15T00:00:00.000Z"),',
        ');',
        'export const hours: number = parsed.toHours();',
        'export const days: number = constructed.toDays();',
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      tsconfigFile,
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2019',
            module: 'commonjs',
            moduleResolution: 'node',
            esModuleInterop: true,
            strict: true,
            skipLibCheck: false,
            noEmit: true,
            types: [],
            ignoreDeprecations: '6.0',
          },
          files: ['consumer.ts'],
        },
        null,
        2,
      ),
    );

    const tscPath = path.join(
      repoRoot,
      'node_modules',
      'typescript',
      'bin',
      'tsc',
    );
    try {
      execFileSync(process.execPath, [tscPath, '--project', tsconfigFile], {
        cwd: consumerDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      const details =
        error && typeof error === 'object' && 'stderr' in error
          ? String(
              (error as { stdout?: string; stderr?: string }).stdout || '',
            ) + String((error as { stderr?: string }).stderr || '')
          : '';
      throw new Error(
        `Consumer TypeScript import check failed.${details ? `\n${details}` : ''}`,
      );
    }
  }
}
