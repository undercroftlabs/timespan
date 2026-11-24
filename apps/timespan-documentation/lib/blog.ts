import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown, type MarkdownSection } from '@/lib/markdown';

export type BlogSection = MarkdownSection;

export type BlogPost = {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string;
  description: string;
  author: string;
  authorUrl: string | null;
  keywords: string[];
  tags: string[];
  canonical: string;
  image: string | null;
  imageAlt: string | null;
  robots: string | null;
  section: string | null;
  modified: string | null;
  seoTitle: string | null;
  html: string;
  sections: BlogSection[];
};

const blogDirectory = path.join(process.cwd(), 'blog');

function requireField(value: unknown, file: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file} is missing frontmatter ${field}`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const text = value.trim();
  return text === '' ? null : text;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item !== '');
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
  }

  return [];
}

function frontmatterDate(value: unknown, file: string): string | null {
  if (value == null || value === '') {
    return null;
  }

  const date =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : String(value).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${file} frontmatter date must be YYYY-MM-DD`);
  }

  return date;
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

function readPost(file: string): BlogPost {
  const filename = path.relative(blogDirectory, file);
  const slug = path.basename(file, '.md');
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const { html, sections } = renderMarkdown(content);
  const title = requireField(data.title, filename, 'title');
  const excerpt = requireField(data.excerpt, filename, 'excerpt');
  const keywords = stringList(data.keywords);
  const tags = stringList(data.tags);

  return {
    slug,
    title,
    date: frontmatterDate(data.date, filename),
    excerpt,
    description: optionalString(data.description) ?? excerpt,
    author: requireField(data.author, filename, 'author'),
    authorUrl: optionalString(data.authorUrl),
    keywords,
    tags: tags.length > 0 ? tags : keywords,
    canonical: optionalString(data.canonical) ?? `/blog/${slug}`,
    image: optionalString(data.image),
    imageAlt: optionalString(data.imageAlt),
    robots: optionalString(data.robots),
    section: optionalString(data.section),
    modified: frontmatterDate(data.modified, filename),
    seoTitle: optionalString(data.seoTitle),
    html,
    sections,
  };
}

export function getBlogPosts(): BlogPost[] {
  const files = markdownFiles(blogDirectory);
  const seen = new Map<string, string>();

  for (const file of files) {
    const slug = path.basename(file, '.md');
    const filename = path.relative(blogDirectory, file);
    const previous = seen.get(slug);

    if (previous) {
      throw new Error(
        `Blog posts "${previous}" and "${filename}" use the same filename. Folders are only for organizing files, so each markdown filename has to stay unique.`,
      );
    }

    seen.set(slug, filename);
  }

  return files.map(readPost).sort((left, right) => {
    if (left.date === right.date) {
      return left.slug.localeCompare(right.slug);
    }

    if (left.date === null) {
      return -1;
    }

    if (right.date === null) {
      return 1;
    }

    return right.date.localeCompare(left.date);
  });
}

export function findBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function formatBlogDate(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  const month = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    timeZone: 'UTC',
  }).format(value);

  return `${value.getUTCDate()} ${month} ${value.getUTCFullYear()}`;
}

export function blogPostsByYear(): { year: string; posts: BlogPost[] }[] {
  const groups: { year: string; posts: BlogPost[] }[] = [];

  for (const post of getBlogPosts()) {
    const year = post.date?.slice(0, 4) ?? 'Unreleased';
    const group = groups.find((item) => item.year === year);

    if (group) {
      group.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
  }

  return groups;
}
