import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { DocNavProduct } from '@/lib/doc-nav';
import { renderMarkdown, type MarkdownSection } from '@/lib/markdown';
import { safeDocHref } from '@/lib/safe-url';

export type DocPage = {
  title: string;
  href: string;
  description: string;
  product: string;
  group: string;
  order: number;
  html: string;
  sections: MarkdownSection[];
};

const docsDirectory = path.join(process.cwd(), 'docs');

function requireField(value: unknown, file: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file} is missing frontmatter ${field}`);
  }

  return value.trim();
}

function requireOrder(value: unknown, file: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${file} frontmatter order must be a number`);
  }

  return value;
}

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return markdownFiles(file);
    }

    return entry.isFile() && entry.name.endsWith('.md') ? [file] : [];
  });
}

function pageHref(file: string): string {
  const relative = path.relative(docsDirectory, file).split(path.sep).join('/');
  const withoutExtension = relative.replace(/\.md$/, '');
  const slug = withoutExtension.endsWith('/index')
    ? withoutExtension.slice(0, -'/index'.length)
    : withoutExtension;
  const filename = path.relative(docsDirectory, file);

  return safeDocHref(`/docs/${slug}`, filename);
}

function readDoc(file: string): DocPage {
  const filename = path.relative(docsDirectory, file);
  const href = pageHref(file);
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const { html, sections } = renderMarkdown(content);

  return {
    title: requireField(data.title, filename, 'title'),
    href,
    description: requireField(data.description, filename, 'description'),
    product: requireField(data.product, filename, 'product'),
    group: requireField(data.group, filename, 'group'),
    order: requireOrder(data.order, filename),
    html,
    sections,
  };
}

function loadPages(): DocPage[] {
  const files = markdownFiles(docsDirectory);
  const seen = new Map<string, string>();
  const pages: DocPage[] = [];

  for (const file of files) {
    const page = readDoc(file);
    const filename = path.relative(docsDirectory, file);
    const previous = seen.get(page.href);

    if (previous) {
      throw new Error(
        `Documentation pages "${previous}" and "${filename}" use the same URL ${page.href}.`,
      );
    }

    seen.set(page.href, filename);
    pages.push(page);
  }

  return pages;
}

function productHref(href: string): string {
  const [, docs, product] = href.split('/');

  if (docs !== 'docs' || !product) {
    throw new Error(`Documentation URL ${href} is outside /docs`);
  }

  return safeDocHref(`/docs/${product}`, href);
}

function orderedPages(pages: DocPage[]): DocPage[] {
  const productRank = new Map<string, number>();

  for (const page of pages) {
    const rank = productRank.get(page.product);
    productRank.set(
      page.product,
      rank === undefined ? page.order : Math.min(rank, page.order),
    );
  }

  return [...pages].sort((left, right) => {
    const productDelta =
      (productRank.get(left.product) ?? 0) -
      (productRank.get(right.product) ?? 0);

    if (productDelta !== 0) {
      return productDelta;
    }

    return left.order - right.order || left.href.localeCompare(right.href);
  });
}

export function getDocPages(): DocPage[] {
  return orderedPages(loadPages());
}

export function getDocProducts(): DocNavProduct[] {
  const pages = getDocPages();
  const products: DocNavProduct[] = [];

  for (const page of pages) {
    const href = productHref(page.href);
    let product = products.find((item) => item.href === href);

    if (!product) {
      product = { title: page.product, href, groups: [] };
      products.push(product);
    }

    if (product.title !== page.product) {
      throw new Error(
        `${page.href} product "${page.product}" does not match ${product.title}`,
      );
    }

    let group = product.groups.find((item) => item.title === page.group);

    if (!group) {
      group = { title: page.group, pages: [] };
      product.groups.push(group);
    }

    group.pages.push({ title: page.title, href: page.href });
  }

  for (const product of products) {
    if (
      !product.groups.some((group) =>
        group.pages.some((page) => page.href === product.href),
      )
    ) {
      throw new Error(
        `${product.title} is missing an index page at ${product.href}`,
      );
    }
  }

  return products;
}

export function findDocPage(href: string): DocPage | undefined {
  return getDocPages().find((page) => page.href === href);
}

export function adjacentDocPages(href: string): {
  previous?: DocPage;
  next?: DocPage;
} {
  const pages = getDocPages();
  const index = pages.findIndex((page) => page.href === href);

  return {
    previous: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined,
  };
}
