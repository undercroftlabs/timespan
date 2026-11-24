import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPostsByYear, formatBlogDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog · Timespan',
  description: 'Release notes and updates for Timespan.',
};

export default function BlogPage() {
  const groups = blogPostsByYear();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-5xl font-semibold tracking-tight">Blog</h1>
      <div className="mt-16 space-y-16">
        {groups.map((group) => (
          <section key={group.year} aria-labelledby={`year-${group.year}`}>
            <h2
              id={`year-${group.year}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {group.year}
            </h2>
            <div className="mt-6 divide-y border-t">
              {group.posts.map((post) => (
                <article key={post.slug} className="py-8">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.date ? formatBlogDate(post.date) : 'Unreleased'}
                  </p>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
