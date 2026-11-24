import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocArticle } from '@/components/docs/doc-article';
import { findDocPage, getDocPages } from '@/lib/docs';

type DocsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export function generateStaticParams() {
  return getDocPages().map((page) => ({
    slug: page.href.split('/').filter(Boolean).slice(1),
  }));
}

function hrefFromSlug(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) {
    return '/docs';
  }

  return `/docs/${slug.join('/')}`;
}

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findDocPage(hrefFromSlug(slug));

  if (!page) {
    return { title: 'Docs · Timespan' };
  }

  return {
    title: `${page.title} · Timespan`,
    description: page.description,
    alternates: { canonical: page.href },
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = findDocPage(hrefFromSlug(slug));

  if (!page) {
    notFound();
  }

  return <DocArticle page={page} />;
}
