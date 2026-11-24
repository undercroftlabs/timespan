import type { Metadata } from 'next';

const licenseUrl =
  'https://github.com/undercroftlabs/timespan/blob/main/LICENSE';

export const metadata: Metadata = {
  title: 'Terms · Timespan',
  description: 'Terms for using the Timespan documentation and library.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
      <div className="mt-8 space-y-4 leading-7 text-muted-foreground">
        <p>
          The Timespan packages are released under the{' '}
          <a href={licenseUrl} className="underline underline-offset-4">
            MIT License
          </a>
          . That license covers the software, including use, modification, and
          distribution.
        </p>
        <p>
          The documentation describes the public API. It is provided as-is,
          without a warranty that a page is complete or that an example will fit
          a particular application.
        </p>
        <p>
          Questions and corrections belong in the GitHub repository at
          undercroftlabs/timespan.
        </p>
      </div>
    </main>
  );
}
