import type { CSSProperties } from 'react';
import Link from 'next/link';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { TableOfContents } from '@/components/docs/table-of-contents';
import { adjacentDocPages, getDocProducts, type DocPage } from '@/lib/docs';

const codeColors = {
  '--sh-class': '#d2a8ff',
  '--sh-identifier': '#e6edf3',
  '--sh-sign': '#8b949e',
  '--sh-property': '#79c0ff',
  '--sh-entity': '#7ee787',
  '--sh-jsxliterals': '#79c0ff',
  '--sh-string': '#a5d6ff',
  '--sh-keyword': '#ff7b72',
  '--sh-comment': '#8b949e',
} as CSSProperties;

export function DocArticle({ page }: { page: DocPage }) {
  const products = getDocProducts();
  const { previous, next } = adjacentDocPages(page.href);

  return (
    <div className="flex min-w-0 flex-1 gap-10">
      <article className="min-w-0 flex-1 py-8 lg:pl-8">
        <details className="mb-8 rounded-lg border p-3 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium">
            Sections
          </summary>
          <DocsSidebar products={products} className="pt-4" />
        </details>
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            {page.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {page.description}
          </p>
        </header>
        <div className="mt-8 xl:hidden">
          <TableOfContents sections={page.sections} />
        </div>
        <div
          className="leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:scroll-mt-20 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:scroll-mt-20 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-4 [&_p]:mt-4 [&_pre]:mt-4 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-zinc-950 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-zinc-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
          style={codeColors}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
        <nav
          aria-label="Pagination"
          className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={encodeURI(previous.href)}
              className="rounded-lg border px-4 py-3 hover:bg-muted"
            >
              <span className="block text-xs text-muted-foreground">
                Previous
              </span>
              <span className="text-sm font-medium">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={encodeURI(next.href)}
              className="rounded-lg border px-4 py-3 text-right hover:bg-muted sm:col-start-2"
            >
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="text-sm font-medium">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-48 shrink-0 overflow-y-auto py-8 xl:block">
        <TableOfContents sections={page.sections} />
      </aside>
    </div>
  );
}
