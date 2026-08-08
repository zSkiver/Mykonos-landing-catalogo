import { useEffect, useRef } from 'react';
import { Reveal } from '@/components/common/Reveal';
import { RouteButton } from '@/components/common/Button';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useStore } from '@/contexts/StoreContext';
import { specialistMessage } from '@/utils/whatsapp';
import { parallax } from '@/animations/gsap';

const FACTS = [
  { value: 'Rio Verde', label: 'loja física, com estoque para ver e cheirar' },
  { value: '5 coleções', label: 'importados, nacionais, árabes, body splash e kits' },
  { value: 'WhatsApp', label: 'atendimento direto, sem carrinho nem cadastro' },
];

export function About() {
  const { settings } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => parallax(imageRef.current, -50, sectionRef.current), []);

  return (
    <section id="sobre" ref={sectionRef} className="grid scroll-mt-24 lg:grid-cols-2">
      {/* A fotografia sangra até a borda esquerda. */}
      <Reveal className="relative min-h-[26rem] overflow-hidden bg-limewash lg:min-h-full">
        <img
          ref={imageRef}
          src="/img/band-loja-1920.webp"
          alt="Balcão da Mykonos Parfum com frascos alinhados sob luz de fim de tarde"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full scale-110 object-cover"
        />
      </Reveal>

      <div className="flex items-center bg-chalk">
        <div className="w-full max-w-xl px-6 py-20 md:px-12 md:py-24 lg:px-16 xl:px-20">
          <Reveal>
            <p className="eyebrow text-aegean">A casa</p>
            <h2 className="mt-6 text-balance lowercase text-4xl leading-[1] md:text-5xl">
              {settings.aboutTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 space-y-5">
              {settings.aboutText.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-pretty leading-relaxed text-stone">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-12 space-y-5 border-t border-salt pt-8">
              {FACTS.map((fact) => (
                <div key={fact.value} className="grid gap-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-5">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-aegean">
                    {fact.value}
                  </dt>
                  <dd className="text-sm leading-relaxed text-stone">{fact.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton message={specialistMessage()}>
                Falar com um especialista
              </WhatsAppButton>
              <RouteButton to="/sobre" variant="ghost">
                Conhecer a história
              </RouteButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
