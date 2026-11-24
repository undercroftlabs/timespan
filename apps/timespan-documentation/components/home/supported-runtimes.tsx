import { BrandIcon } from '@/components/brand-icon';

function CommonJsMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="size-7 text-foreground"
    >
      <path
        fill="currentColor"
        d="M8 9h7.2c2.6 0 4.2 1.4 4.2 3.5 0 1.5-.8 2.6-2.2 3.1 1.7.4 2.7 1.6 2.7 3.4 0 2.3-1.8 3.9-4.6 3.9H8V9Zm2.2 5.6h4.4c1.2 0 1.9-.6 1.9-1.5s-.7-1.5-1.9-1.5h-4.4v3Zm0 6.5h4.8c1.4 0 2.2-.6 2.2-1.6s-.8-1.6-2.2-1.6h-4.8v3.2Z"
      />
    </svg>
  );
}

const runtimes = [
  {
    name: 'Node.js',
    icon: (
      <BrandIcon name="node-js" className="text-[1.75rem] text-[#339933]" />
    ),
  },
  {
    name: 'TypeScript',
    icon: (
      <BrandIcon name="typescript" className="text-[1.75rem] text-[#3178C6]" />
    ),
  },
  {
    name: 'React',
    icon: <BrandIcon name="react" className="text-[1.75rem] text-[#61DAFB]" />,
  },
  {
    name: 'ESM',
    icon: <BrandIcon name="js" className="text-[1.75rem] text-[#F7DF1E]" />,
  },
  { name: 'CommonJS', icon: <CommonJsMark /> },
  {
    name: 'Browser',
    icon: <BrandIcon name="html5" className="text-[1.75rem] text-[#E34F26]" />,
  },
];

export function SupportedRuntimes() {
  return (
    <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {runtimes.map((runtime) => (
        <li
          key={runtime.name}
          className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground"
        >
          <span className="flex h-7 items-center">{runtime.icon}</span>
          {runtime.name}
        </li>
      ))}
    </ul>
  );
}
