import { useCallback, useEffect, useState } from 'react';

/**
 * Revela um bloco quando ele entra na viewport, uma única vez.
 * Depois de disparar, para de observar — nada reanima ao rolar de volta.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const [element, setElement] = useState<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold]);

  return { ref, isVisible };
}
