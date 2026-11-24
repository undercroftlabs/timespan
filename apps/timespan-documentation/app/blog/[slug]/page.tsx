import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Comments } from '@/components/blog/comments';
import { OnThisPage } from '@/components/blog/on-this-page';
import { ShareLinks } from '@/components/blog/share-links';
import { MarkdownBody } from '@/components/markdown-body';
import {
  findBlogPost,
  formatBlogDate,
  getBlogPosts,
  type BlogPost,
} from '@/lib/blog';
import { jsonLdScript } from '@/lib/safe-url';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

function publishedTime(date: string | null): string | undefined {
  return date ? `${date}T00:00:00.000Z` : undefined;
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const title = post.seoTitle ?? `${post.title} · Timespan`;
  const images = post.image
    ? [{ url: post.image, alt: post.imageAlt ?? post.title }]
    : undefined;

  return {
    title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author, url: post.authorUrl ?? undefined }],
    alternates: { canonical: post.canonical },
    robots: post.robots ?? undefined,
    openGraph: {
      type: 'article',
      title,
      description: post.description,
      url: post.canonical,
      publishedTime: publishedTime(post.date),
      modifiedTime: publishedTime(post.modified),
      authors: post.authorUrl ? [post.authorUrl] : [post.author],
      section: post.section ?? undefined,
      tags: post.tags,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

function blogPostingJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
      url: post.authorUrl ?? undefined,
    },
    datePublished: publishedTime(post.date),
    dateModified: publishedTime(post.modified ?? post.date),
    keywords: post.keywords.join(', '),
    articleSection: post.section ?? undefined,
    image: post.image ?? undefined,
    mainEntityOfPage: post.canonical,
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = findBlogPost(slug);

  if (!post) {
    return { title: 'Blog · Timespan' };
  }

  return blogPostMetadata(post);
}

function authorInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = findBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(blogPostingJsonLd(post)),
        }}
      />
      <article className="min-w-0 max-w-3xl flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <i className="fa-solid fa-caret-left text-xs" aria-hidden="true" />
            Blog
          </Link>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-6 flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="inline-flex size-6 items-center justify-center rounded-full border bg-muted text-[10px] font-medium"
          >
            {authorInitials(post.author)}
          </span>
          {post.author}
          <time dateTime={post.date ?? undefined}>
            — {post.date ? formatBlogDate(post.date) : 'Unreleased'}
          </time>
        </p>
        <div className="mt-4">
          <ShareLinks title={post.title} canonical={post.canonical} />
        </div>
        <div className="mt-10 xl:hidden">
          <OnThisPage sections={post.sections} />
        </div>
        <MarkdownBody html={post.html} className="mt-10" />
        <div className="mt-10">
          <ShareLinks title={post.title} canonical={post.canonical} />
        </div>
        <Comments key={post.slug} term={post.title} />
      </article>
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-2 xl:block">
        <OnThisPage sections={post.sections} />
      </aside>
    </div>
  );
}
