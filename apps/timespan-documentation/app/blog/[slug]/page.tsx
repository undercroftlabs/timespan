import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Comments } from '@/components/blog/comments';
import { OnThisPage } from '@/components/blog/on-this-page';
import { ShareLinks } from '@/components/blog/share-links';
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
        <div
          className="mt-10 leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:scroll-mt-20 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:scroll-mt-20 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-4 [&_p]:mt-4 [&_pre]:mt-4 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-zinc-950 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-zinc-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
          style={codeColors}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
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
