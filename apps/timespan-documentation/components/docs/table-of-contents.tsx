import type { MarkdownSection } from '@/lib/markdown';

export function TableOfContents({ sections }: { sections: MarkdownSection[] }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="pb-2 font-medium">On this page</p>
      <ul className="flex flex-col gap-2 border-l">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={
                section.level === 3
                  ? 'block border-l -ml-px px-3 pl-6 text-muted-foreground hover:text-foreground'
                  : 'block border-l -ml-px px-3 text-muted-foreground hover:text-foreground'
              }
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
