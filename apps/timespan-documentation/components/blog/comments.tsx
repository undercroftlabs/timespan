'use client';

import { useEffect, useRef } from 'react';

const giscusOrigin = 'https://giscus.app';

function siteTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function Comments({ term }: { term: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const script = document.createElement('script');
    script.src = `${giscusOrigin}/client.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'undercroftlabs/timespan');
    script.setAttribute('data-repo-id', 'R_kgDOJoXf7g');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOJoXf7s4CWyZx');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', term);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', siteTheme());
    script.setAttribute('data-lang', 'en');
    container.appendChild(script);

    const observer = new MutationObserver(() => {
      const frame = container.querySelector<HTMLIFrameElement>(
        'iframe.giscus-frame',
      );
      frame?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: siteTheme() } } },
        giscusOrigin,
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [term]);

  return (
    <section aria-label="Comments" className="mt-12 border-t pt-8">
      <h2 className="text-xl font-semibold tracking-tight">Comments</h2>
      <div ref={containerRef} className="mt-4" />
    </section>
  );
}
