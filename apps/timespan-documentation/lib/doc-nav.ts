export type DocNavPage = {
  title: string;
  href: string;
};

export type DocNavGroup = {
  title: string;
  pages: DocNavPage[];
};

export type DocNavProduct = {
  title: string;
  href: string;
  groups: DocNavGroup[];
};

export function findDocProduct(
  products: DocNavProduct[],
  pathname: string,
): DocNavProduct {
  return (
    products.find(
      (product) =>
        pathname === product.href || pathname.startsWith(`${product.href}/`),
    ) ?? products[0]
  );
}
