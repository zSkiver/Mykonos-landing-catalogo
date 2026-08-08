import { Seo, breadcrumbSchema } from '@/components/common/Seo';
import { Contact } from '@/components/home/Contact';
import { Faq } from '@/components/home/Faq';

/**
 * O componente <Contact /> já traz o próprio cabeçalho, os dados da loja e o
 * mapa. Um PageHero acima dele repetia título, chamada e botão do WhatsApp —
 * dois contatos na mesma página. Ficou só o de baixo, que é o completo.
 */
export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contato"
        description="Fale com a Mykonos Parfum pelo WhatsApp ou Instagram. Endereço, horário de atendimento e mapa da loja em Rio Verde, GO."
        path="/contato"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contato', path: '/contato' },
        ])}
      />

      <Contact />
      <Faq />
    </>
  );
}
