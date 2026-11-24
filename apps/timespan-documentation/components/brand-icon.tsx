export function BrandIcon({
  name,
  className = 'text-[1.75rem]',
}: {
  name: string;
  className?: string;
}) {
  return (
    <i className={`fa-brands fa-${name} ${className}`} aria-hidden="true" />
  );
}
