import { Marked, type Tokens } from 'marked';
import { highlight, type LanguageName } from 'sugar-high';

export type MarkdownSection = {
  id: string;
  title: string;
  level: 2 | 3;
};

const languages = new Set<LanguageName>([
  'javascript',
  'typescript',
  'css',
  'python',
  'c',
  'go',
  'glsl',
  'java',
  'rust',
  'json',
  'diff',
  'shell',
  'cpp',
  'csharp',
  'sql',
  'html',
  'vue',
  'svelte',
  'yaml',
  'markdown',
  'plaintext',
  'ruby',
  'kotlin',
  'swift',
  'php',
  'toml',
  'powershell',
  'dockerfile',
  'graphql',
  'hcl',
  'zig',
  'lua',
]);

const languageAliases: Record<string, LanguageName> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  sh: 'shell',
  bash: 'shell',
  yml: 'yaml',
  md: 'markdown',
  text: 'plaintext',
  txt: 'plaintext',
};

function codeLanguage(lang: string | undefined): LanguageName | undefined {
  if (!lang) {
    return undefined;
  }

  const normalized = lang.toLowerCase();
  const alias = languageAliases[normalized];

  if (alias) {
    return alias;
  }

  return languages.has(normalized as LanguageName)
    ? (normalized as LanguageName)
    : undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

const allowedLinkProtocols = new Set(['http:', 'https:', 'mailto:']);
const allowedImageProtocols = new Set(['http:', 'https:']);

function trustedHref(
  href: string,
  protocols: ReadonlySet<string>,
): string | null {
  const value = href.trim();

  if (value === '' || /["'<>]/.test(value)) {
    return null;
  }

  if (
    value.startsWith('#') ||
    (value.startsWith('/') && !value.startsWith('//'))
  ) {
    return value;
  }

  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) && !value.startsWith('//')) {
    return value;
  }

  try {
    const url = new URL(value);
    return protocols.has(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function hrefAttribute(href: string): string {
  return escapeHtml(encodeURI(href));
}

// Markdown is the authoring format for docs and blog posts. Raw HTML is
// escaped. href and src values may be a hash, a root-relative or relative
// path, or an http(s) or mailto URL.
export function renderMarkdown(markdown: string): {
  html: string;
  sections: MarkdownSection[];
} {
  const sections: MarkdownSection[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({ gfm: true });

  marked.use({
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(text);
      },
      heading(
        this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } },
        token: Tokens.Heading,
      ) {
        const level: 2 | 3 = token.depth === 3 ? 3 : 2;
        const base = slugify(token.text) || 'section';
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count + 1}`;

        if (token.depth === 2 || token.depth === 3) {
          sections.push({ id, title: token.text, level });
        }

        const inner = this.parser.parseInline(token.tokens);

        return `<h${level} id="${id}">${inner}</h${level}>`;
      },
      code({ text, lang }: Tokens.Code) {
        const colored = highlight(text, { lang: codeLanguage(lang) });

        return `<pre><code>${colored}</code></pre>`;
      },
      link(
        this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } },
        { href, title, text, tokens, autolink }: Tokens.Link,
      ) {
        const inner = autolink
          ? escapeHtml(text)
          : this.parser.parseInline(tokens);
        const safe = trustedHref(href, allowedLinkProtocols);

        if (!safe) {
          return inner;
        }

        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<a href="${hrefAttribute(safe)}"${titleAttr}>${inner}</a>`;
      },
      image(
        this: {
          parser: { parseInline: (tokens: Tokens.Generic[]) => string };
        },
        { href, title, text, tokens }: Tokens.Image,
      ) {
        const alt =
          tokens.length > 0
            ? this.parser.parseInline(tokens)
            : escapeHtml(text);
        const safe = trustedHref(href, allowedImageProtocols);

        if (!safe) {
          return alt;
        }

        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${hrefAttribute(safe)}" alt="${escapeHtml(text)}"${titleAttr}>`;
      },
    },
  });

  return {
    html: marked.parse(markdown, { async: false }),
    sections,
  };
}
