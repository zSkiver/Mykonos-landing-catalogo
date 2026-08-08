import { MapPin } from 'lucide-react';
import { Section, SectionHeader } from '@/components/common/Section';
import { RevealGroup, RevealItem, Reveal } from '@/components/common/Reveal';
import { RouteButton } from '@/components/common/Button';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useStore } from '@/contexts/StoreContext';
import { generalMessage } from '@/utils/whatsapp';

/**
 * Aqui a numeração significa alguma coisa: é a ordem em que a compra acontece,
 * e pular um passo muda o resultado. Nos diferenciais ela foi removida porque
 * lá são garantias paralelas — numerar seria só enfeite.
 */
const STEPS = [
  {
    title: 'Encontre o produto',
    text: 'Navegue pelas coleções ou busque por nome, marca ou tipo. Cada página traz o que pesa na decisão — num perfume, a pirâmide olfativa e a fixação; nos demais, o que muda a diferença na hora de usar.',
  },
  {
    title: 'Escolha a versão',
    text: 'Quando o mesmo produto vem em mais de uma apresentação, alternar entre elas troca o preço ali mesmo, sem sair da página.',
  },
  {
    title: 'Abra a conversa',
    text: 'O botão leva ao WhatsApp com o produto, a versão e o preço já escritos na mensagem. Você não precisa digitar nada.',
  },
  {
    title: 'Retire ou receba',
    text: 'Confirmamos a disponibilidade e combinamos o pagamento. Daí você busca na loja ou a gente acerta a entrega.',
  },
];

export function HowItWorks() {
  const { settings } = useStore();

  return (
    <Section id="como-funciona" tone="limewash">
      <SectionHeader
        eyebrow="Como funciona"
        title={
          <>
            do catálogo à sua pele, <span className="italic text-aegean">em quatro passos</span>
          </>
        }
        lead="Não há carrinho nem cadastro. O site serve para você decidir com calma; a compra acontece na conversa."
        action={
          <RouteButton to="/catalogo" variant="outline">
            Começar pelo catálogo
          </RouteButton>
        }
      />

      {/*
        A régua atravessando os números é o que faz a seção ser lida como
        percurso, e não como quatro cartões soltos. Ela corre na horizontal no
        desktop e some no mobile, onde a própria pilha já dá a sequência.
      */}
      <RevealGroup className="relative grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
        <span
          className="absolute left-0 right-0 top-[0.6rem] hidden h-px bg-salt lg:block"
          aria-hidden
        />

        {STEPS.map((step, index) => (
          <RevealItem key={step.title}>
            <div className="relative">
              <span className="numeric relative z-10 inline-block bg-limewash pr-4 text-[0.7rem] text-aegean">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="mt-5 font-display text-2xl lowercase">{step.title}</h3>
              <p className="mt-3 text-pretty leading-relaxed text-stone">{step.text}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal>
        <div className="mt-16 flex flex-col gap-6 border-t border-salt pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl lowercase">pronto para o primeiro passo?</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-stone">
              <MapPin className="size-4 shrink-0 text-aegean" aria-hidden />
              {settings.address} · atendimento também pelo WhatsApp
            </p>
          </div>

          <WhatsAppButton message={generalMessage()} size="lg" className="shrink-0">
            Falar com a loja agora
          </WhatsAppButton>
        </div>
      </Reveal>
    </Section>
  );
}
