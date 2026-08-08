import { Section, SectionHeader } from '@/components/common/Section';
import { RevealGroup, RevealItem } from '@/components/common/Reveal';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { generalMessage } from '@/utils/whatsapp';

const ITEMS = [
  {
    title: 'Produtos selecionados',
    text: 'Perfumes, maquiagens, cosméticos e skincare para descobrir na loja.',
  },
  {
    title: 'Atendimento local',
    text: 'Confirme a disponibilidade pelo WhatsApp e retire seu produto em Rio Verde, GO.',
  },
  {
    title: 'Atendimento humanizado',
    text: 'Você fala com uma equipe que conhece os produtos e ajuda na sua escolha.',
  },
  {
    title: 'Curadoria especializada',
    text: 'Uma curadoria para perfumar, cuidar e valorizar a sua rotina.',
  },
  {
    title: 'Compra orientada',
    text: 'Tire dúvidas, encontre o produto ideal e confirme os detalhes diretamente com a equipe.',
  },
  {
    title: 'Loja física',
    text: 'Conheça a Mykonos Parfum em Rio Verde, GO, e veja de perto suas escolhas.',
  },
];

/** Sem ícones e sem cartões: a régua e o espaço em branco já dão o ritmo. */
export function Differentials() {
  return (
    <Section id="diferenciais" tone="limewash">
      <SectionHeader
        eyebrow="Por que a Mykonos"
        title={
          <>
            seis motivos para confiar <span className="italic text-aegean">o seu ritual a nós</span>
          </>
        }
        lead="Não vendemos por marketplace nem por carrinho anônimo. A conversa é o produto."
        action={
          <WhatsAppButton message={generalMessage('as garantias da loja')} variant="outline">
            Tirar uma dúvida
          </WhatsAppButton>
        }
      />

      <RevealGroup className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <RevealItem key={item.title}>
            <div className="border-t border-salt pt-7">
              <h3 className="font-display text-2xl lowercase">{item.title}</h3>
              <p className="mt-3.5 leading-relaxed text-stone">{item.text}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
