import Link from 'next/link';

const licenseUrl =
  'https://github.com/undercroftlabs/timespan/blob/main/LICENSE';

const footerLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>@undercroft/timespan 1.4.0</p>
        <nav aria-label="Site" className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a href={licenseUrl} className="hover:text-foreground">
            MIT License
          </a>
        </nav>
      </div>
    </footer>
  );
}
