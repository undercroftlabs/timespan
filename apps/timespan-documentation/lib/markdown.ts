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

export function renderMarkdown(markdown: string): {
  html: string;
  sections: MarkdownSection[];
} {
  const sections: MarkdownSection[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({ gfm: true });

  marked.use({
    renderer: {
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
    },
  });

  return {
    html: marked.parse(markdown, { async: false }),
    sections,
  };
}
