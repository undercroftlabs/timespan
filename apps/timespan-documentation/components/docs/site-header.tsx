'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocNavProduct } from '@/lib/doc-nav';
import { ThemeToggle } from '@/components/docs/theme-toggle';
import { BrandIcon } from '@/components/brand-icon';

const githubUrl = 'https://github.com/undercroftlabs/timespan';

export function SiteHeader({ products }: { products: DocNavProduct[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className={cn(
            'text-sm font-semibold text-muted-foreground hover:text-foreground',
            pathname === '/' && 'text-foreground',
          )}
        >
          Home
        </Link>
        <nav aria-label="Packages" className="flex items-center gap-1">
          {products.map((product) => {
            const active =
              pathname === product.href ||
              pathname.startsWith(`${product.href}/`);

            return (
              <Link
                key={encodeURI(product.href)}
                href={encodeURI(product.href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground',
                  active && 'font-medium text-foreground',
                )}
              >
                {product.title}
              </Link>
            );
          })}
          <Link
            href="/blog"
            aria-current={
              pathname === '/blog' || pathname.startsWith('/blog/')
                ? 'page'
                : undefined
            }
            className={cn(
              'rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground',
              (pathname === '/blog' || pathname.startsWith('/blog/')) &&
                'font-medium text-foreground',
            )}
          >
            Blog
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-8 items-center gap-2 rounded-md border bg-muted/60 px-3 text-sm text-muted-foreground sm:inline-flex"
            aria-label="Search"
          >
            <Search className="size-3.5" />
            <span>Search...</span>
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <BrandIcon name="github" className="text-base" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
