import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { getDocProducts } from '@/lib/docs';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = getDocProducts();

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 sm:px-6">
        <DocsSidebar
          products={products}
          className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r py-8 pr-4 lg:block"
        />
        {children}
      </div>
    </div>
  );
}
