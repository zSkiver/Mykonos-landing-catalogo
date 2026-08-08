import { useEffect, useRef } from 'react';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { Reveal } from '@/components/common/Reveal';
import { useStore } from '@/contexts/StoreContext';
import { parallax } from '@/animations/gsap';

/** Faixa editável pelo painel — o corte de respiro entre catálogo e conteúdo. */
export function PromoBand() {
  const { banners } = useStore();
  const banner = banners.find((item) => item.active && item.placement === 'home-mid');
  const rootRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => parallax(imageRef.current, 70, rootRef.current), [banner?.id]);

  if (!banner) return null;

  return (
    <section ref={rootRef} className="relative isolate overflow-hidden bg-abyss text-chalk">
      <img
        ref={imageRef}
        src={banner.image}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 size-full scale-115 object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-abyss via-abyss/85 to-abyss/40" aria-hidden />

      <div className="shell py-24 md:py-32">
        <Reveal className="max-w-xl">
          <h2 className="text-balance lowercase text-4xl md:text-5xl">{banner.title}</h2>
          <p className="mt-5 text-pretty leading-relaxed text-mist">{banner.subtitle}</p>
          <WhatsAppButton message={banner.ctaMessage} variant="chalk" size="lg" className="mt-9">
            {banner.ctaLabel}
          </WhatsAppButton>
        </Reveal>
      </div>
    </section>
  );
}
