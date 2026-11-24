import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

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

const markdownBodyClassName =
  'leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:scroll-mt-20 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:scroll-mt-20 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-4 [&_p]:mt-4 [&_pre]:mt-4 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-zinc-950 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-zinc-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6';

export function MarkdownBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn(markdownBodyClassName, className)}
      style={codeColors}
      dangerouslySetInnerHTML={{ __html: html }} // sanitized by renderMarkdown
    />
  );
}
