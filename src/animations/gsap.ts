import type { gsap as GsapType } from 'gsap';

export const EASE = 'power3.out';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * O GSAP entra depois da primeira pintura: nenhuma animação de scroll é
 * necessária antes de o conteúdo estar na tela.
 */
let gsapPromise: Promise<typeof GsapType> | null = null;

export function loadGsap(): Promise<typeof GsapType> {
  gsapPromise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return gsap;
    },
  );
  return gsapPromise;
}

/**
 * Parallax vertical amarrado ao scroll. Devolve a limpeza de forma síncrona
 * para poder ser retornada direto de um `useEffect`.
 * `distance` em pixels: negativo sobe, positivo desce.
 */
export function parallax(element: Element | null, distance: number, scope?: Element | null): () => void {
  if (!element || prefersReducedMotion()) return () => {};

  let cancelled = false;
  let dispose: (() => void) | null = null;

  void loadGsap().then((gsap) => {
    if (cancelled) return;
    const tween = gsap.to(element, {
      y: distance,
      ease: 'none',
      scrollTrigger: {
        trigger: (scope ?? element) as Element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    dispose = () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  });

  return () => {
    cancelled = true;
    dispose?.();
  };
}
