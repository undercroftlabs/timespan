'use client';

import { useEffect, useState } from 'react';

const shareTargets = [
  {
    name: 'X',
    icon: 'fa-brands fa-x-twitter',
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Facebook',
    icon: 'fa-brands fa-facebook',
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    icon: 'fa-brands fa-linkedin',
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Reddit',
    icon: 'fa-brands fa-reddit',
    href: (url: string, title: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: 'Bluesky',
    icon: 'fa-brands fa-bluesky',
    href: (url: string, title: string) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: 'Mastodon',
    icon: 'fa-brands fa-mastodon',
    href: (url: string, title: string) =>
      `https://mastodon.social/share?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: 'Hacker News',
    icon: 'fa-brands fa-hacker-news',
    href: (url: string, title: string) =>
      `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`,
  },
  {
    name: 'Email',
    label: 'Share by email',
    icon: 'fa-solid fa-envelope',
    href: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
] as const;

export function ShareLinks({
  title,
  canonical,
}: {
  title: string;
  canonical: string;
}) {
  const [pageUrl, setPageUrl] = useState(
    canonical.startsWith('http') ? canonical : '',
  );

  useEffect(() => {
    if (!canonical.startsWith('http')) {
      setPageUrl(window.location.href);
    }
  }, [canonical]);

  return (
    <nav aria-label="Share" className="flex items-center gap-3">
      {shareTargets.map((target) => (
        <a
          key={target.name}
          href={pageUrl ? target.href(pageUrl, title) : undefined}
          target={target.name === 'Email' ? undefined : '_blank'}
          rel={target.name === 'Email' ? undefined : 'noreferrer'}
          aria-label={
            'label' in target ? target.label : `Share on ${target.name}`
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          <i className={target.icon} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
