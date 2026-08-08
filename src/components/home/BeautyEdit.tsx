import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RevealGroup, RevealItem } from '@/components/common/Reveal';
import { Section, SectionHeader } from '@/components/common/Section';

const EDITS = [
  {
    title: 'Maquiagem',
    text: 'Bases, batons e paletas para montar uma rotina que combina com você.',
    to: '/catalogo/cosmeticos',
    image: '/img/edit-maquiagem-1280.webp',
  },
  {
    title: 'Cosméticos',
    text: 'Cremes, hidratantes e cuidados para pele, corpo e cabelos no dia a dia.',
    to: '/catalogo/cosmeticos',
    image: '/img/edit-cosmeticos-1280.webp',
  },
  {
    title: 'Skincare',
    text: 'Séruns, hidratantes e cuidados para transformar o autocuidado em ritual.',
    to: '/catalogo/skincare',
    image: '/img/cat-skincare-v2-896.webp',
  },
];

export function BeautyEdit() {
  return (
    <Section tone="limewash">
      <SectionHeader
        eyebrow="Beleza além da fragrância"
        title={
          <>
            maquiagem, cosméticos, skincare e{' '}
            <span className="italic text-aegean">cabelos para o seu ritual</span>
          </>
        }
        lead="Na Mykonos, perfumar é apenas uma parte da sua rotina. Encontre também produtos para cuidar da pele e dos cabelos, preparar e realçar a sua beleza."
      />

      <RevealGroup className="grid gap-4 md:grid-cols-3" step={0.08}>
        {EDITS.map((edit) => (
          <RevealItem key={edit.title}>
            <Link to={edit.to} className="group block overflow-hidden bg-deep text-chalk">
              <div className="relative aspect-4/5 overflow-hidden">
                <img
                  src={edit.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/88 via-deep/18 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <h3 className="font-display text-3xl lowercase md:text-4xl">{edit.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-chalk/76">{edit.text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                    Explorar seleção
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
