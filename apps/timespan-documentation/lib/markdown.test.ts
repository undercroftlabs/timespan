import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('escapes raw HTML instead of injecting it', () => {
    const { html } = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>',
    );

    expect(html).not.toContain('<script>');
    expect(html).not.toMatch(/<img src=x/i);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('onerror=alert(1)');
  });

  it('does not render javascript: or data: URLs as href or src', () => {
    const { html } = renderMarkdown(
      [
        '[xss](javascript:alert(1))',
        '[also](JAVASCRIPT:alert(1))',
        '![](data:text/html,<script>alert(1)</script>)',
        '[proto](//evil.example)',
      ].join('\n\n'),
    );

    expect(html).not.toMatch(/href\s*=\s*["']?\s*javascript:/i);
    expect(html).not.toMatch(/src\s*=\s*["']?\s*data:/i);
    expect(html).not.toContain('href="//evil.example"');
    expect(html).toContain('xss');
  });

  it('keeps relative, hash, https, and mailto links', () => {
    const { html } = renderMarkdown(
      [
        '[docs](/docs/timespan)',
        '[section](#browser)',
        '[npm](https://www.npmjs.com/package/@undercroft/timespan)',
        '[mail](mailto:hello@example.com)',
      ].join('\n\n'),
    );

    expect(html).toContain('href="/docs/timespan"');
    expect(html).toContain('href="#browser"');
    expect(html).toContain(
      'href="https://www.npmjs.com/package/@undercroft/timespan"',
    );
    expect(html).toContain('href="mailto:hello@example.com"');
  });

  it('preserves fenced HTML examples as text inside a code block', () => {
    const { html } = renderMarkdown(`\`\`\`html
<script src="https://cdn.example/index.umd.js"></script>
\`\`\`
`);

    expect(html).toContain('<pre><code>');
    expect(html).toContain('&lt;');
    expect(html).toContain('index.umd.js');
    expect(html).not.toMatch(/<script src=/);
  });

  it('preserves JavaScript examples used in the docs', () => {
    const { html } = renderMarkdown(`\`\`\`javascript
const span = Timespan.fromHours(2);
span.toString(); // '2h'
\`\`\`
`);

    expect(html).toContain('<pre><code>');
    expect(html).toContain('Timespan');
    expect(html).toContain('fromHours');
  });

  it('still extracts heading sections', () => {
    const { sections } = renderMarkdown('## Browser\n\nThe UMD build.');

    expect(sections).toEqual([{ id: 'browser', title: 'Browser', level: 2 }]);
  });
});
