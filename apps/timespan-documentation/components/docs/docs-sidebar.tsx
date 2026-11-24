'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { findDocProduct, type DocNavProduct } from '@/lib/doc-nav';
import { cn } from '@/lib/utils';

export function DocsSidebar({
  products,
  className,
}: {
  products: DocNavProduct[];
  className?: string;
}) {
  const pathname = usePathname();
  const product = findDocProduct(products, pathname);

  return (
    <nav aria-label="Documentation" className={className}>
      <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
        Sections
      </p>
      <div className="flex flex-col gap-6">
        {product.groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.pages.map((docPage) => {
                const active = docPage.href === pathname;

                return (
                  <li key={docPage.href}>
                    <Link
                      href={docPage.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
                        active && 'bg-muted font-medium text-foreground',
                      )}
                    >
                      {docPage.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
