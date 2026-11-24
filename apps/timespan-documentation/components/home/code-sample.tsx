'use client';

import { useState, type CSSProperties } from 'react';
import { highlight } from 'sugar-high';
import { cn } from '@/lib/utils';

const samples = [
  {
    id: 'esm',
    label: 'ESM',
    filename: 'duration.mjs',
    lang: 'javascript',
    code: `import { Timespan } from '@undercroft/timespan';

const span = new Timespan(
  new Date('2024-03-01T00:00:00.000Z'),
  new Date('2024-03-15T00:00:00.000Z'),
);

span.toString();`,
  },
  {
    id: 'commonjs',
    label: 'CommonJS',
    filename: 'duration.cjs',
    lang: 'javascript',
    code: `const { Timespan } = require('@undercroft/timespan');

const span = Timespan.fromString('3d 5h 30m');

span.toHours();`,
  },
  {
    id: 'browser',
    label: 'Browser',
    filename: 'index.html',
    lang: 'html',
    code: [
      '<script src="https://cdn.jsdelivr.net/npm/@undercroft/timespan/dist/index.umd.js"><' +
        '/script>',
      '<script>',
      '  const span = new Timespan(new Date(), new Date());',
      '  span.toMilliseconds();',
      '<' + '/script>',
    ].join('\n'),
  },
  {
    id: 'react',
    label: 'React',
    filename: 'shift.tsx',
    lang: 'typescript',
    code: `import { useTimespan } from '@undercroft/react-timespan';

export function Shift() {
  useTimespan();
}`,
  },
] as const;

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

export function CodeSample() {
  const [activeId, setActiveId] =
    useState<(typeof samples)[number]['id']>('esm');
  const [copied, setCopied] = useState(false);
  const sample = samples.find((item) => item.id === activeId) ?? samples[0];

  async function copySample() {
    await navigator.clipboard.writeText(sample.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-zinc-100 shadow-lg">
      <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-2 pt-2">
        {samples.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveId(item.id);
              setCopied(false);
            }}
            className={cn(
              'rounded-t-md px-3 py-2 text-sm text-zinc-400',
              item.id === sample.id && 'bg-white/10 text-white',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-500">
        <span>{sample.filename}</span>
        <button
          type="button"
          onClick={copySample}
          className="rounded-md px-2 py-1 text-zinc-300 hover:bg-white/10"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="h-64 overflow-auto px-4 pb-4 font-mono text-sm leading-6 [&_.sh__line]:block"
        style={codeColors}
      >
        <code
          dangerouslySetInnerHTML={{
            __html: highlight(sample.code, { lang: sample.lang }),
          }}
        />
      </pre>
    </div>
  );
}
