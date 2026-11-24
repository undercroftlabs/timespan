import Link from 'next/link';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { TableOfContents } from '@/components/docs/table-of-contents';
import { MarkdownBody } from '@/components/markdown-body';
import { adjacentDocPages, getDocProducts, type DocPage } from '@/lib/docs';

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
        <MarkdownBody html={page.html} />
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
