const docHrefPattern = /^\/docs\/[A-Za-z0-9][A-Za-z0-9/_-]*$/;
const blogSlugPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const blogHrefPattern = /^\/blog\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function safeDocHref(href: string, source: string): string {
  if (/["'&<>]/.test(href)) {
    throw new Error(`${source} produced an unsafe documentation URL ${href}`);
  }

  if (!docHrefPattern.test(href)) {
    throw new Error(`${source} produced an unsafe documentation URL ${href}`);
  }

  return encodeURI(href);
}

export function safeBlogSlug(slug: string, source: string): string {
  if (/["'&<>]/.test(slug)) {
    throw new Error(`${source} produced an unsafe blog slug ${slug}`);
  }

  if (!blogSlugPattern.test(slug)) {
    throw new Error(`${source} produced an unsafe blog slug ${slug}`);
  }

  return encodeURIComponent(slug);
}

export function safeBlogHref(href: string, source: string): string {
  if (/["'&<>]/.test(href)) {
    throw new Error(`${source} produced an unsafe blog URL ${href}`);
  }

  if (!blogHrefPattern.test(href)) {
    throw new Error(`${source} produced an unsafe blog URL ${href}`);
  }

  return encodeURI(href);
}

export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
