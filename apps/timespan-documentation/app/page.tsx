import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeSample } from '@/components/home/code-sample';
import { SupportedRuntimes } from '@/components/home/supported-runtimes';

export const metadata: Metadata = {
  title: 'Timespan',
  description:
    'Calculate and format time spans in JavaScript, TypeScript, the browser, and React.',
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Time spans for JavaScript
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Timespan measures the interval between two dates, parses duration
            strings, and formats the result. It ships with no dependencies for
            Node.js, the browser, and React.
          </p>
          <div className="mt-8">
            <Link
              href="/docs/timespan"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Getting Started
            </Link>
          </div>
        </section>
        <section>
          <CodeSample />
          <SupportedRuntimes />
        </section>
      </main>
    </div>
  );
}
