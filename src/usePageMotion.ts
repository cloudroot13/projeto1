import { useEffect } from 'react';

/** Reveal content once per page, with small stagger groups and a safe fallback. */
export function usePageMotion(page: string) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    const elements = document.querySelectorAll<HTMLElement>(
      '.site main section:not(.hero), .page-title, .solution-hero, .challenge-band, .cta-band, .impact-ribbon, .editorial-chart, .lab-info-grid article, .parameter-panel, .results-panel, .paper, .dossier-grid article',
    );
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

    elements.forEach(element => {
      element.classList.add('scroll-reveal');
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      elements.forEach(element => element.classList.remove('scroll-reveal', 'is-visible'));
    };
  }, [page]);
}
