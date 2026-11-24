import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy · Timespan',
  description: 'What the Timespan documentation site stores on your device.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
      <div className="mt-8 space-y-4 leading-7 text-muted-foreground">
        <p>
          This site documents @undercroft/timespan. It does not ask you to
          create an account, and it does not run its own analytics.
        </p>
        <p>
          The theme control stores your choice in localStorage under the key
          theme. That value stays in your browser. Clearing site data removes
          it.
        </p>
        <p>
          The pages load a Font Awesome kit from kit.fontawesome.com so the
          brand icons can render. Leaving the site for GitHub, npm, or the
          license file is covered by those sites.
        </p>
      </div>
    </main>
  );
}
