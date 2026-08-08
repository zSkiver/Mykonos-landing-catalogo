import { Seo, breadcrumbSchema } from '@/components/common/Seo';
import { PageHero } from '@/components/common/PageHero';
import { Differentials } from '@/components/home/Differentials';
import { Faq } from '@/components/home/Faq';
import { Section, SectionHeader } from '@/components/common/Section';
import { Reveal, RevealGroup, RevealItem } from '@/components/common/Reveal';
import { RouteButton } from '@/components/common/Button';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useStore } from '@/contexts/StoreContext';
import { generalMessage, specialistMessage } from '@/utils/whatsapp';

/**
 * A história contada na estrutura de uma fragrância: o que se sente primeiro,
 * o que sustenta e o que fica. É o mesmo vocabulário que a loja usa para
 * explicar um perfume, aplicado a ela mesma.
 */
const CHAPTERS = [
  {
    label: 'Saída',
    title: 'Uma loja para cheirar antes de decidir',
    text: 'Perfume não se escolhe por foto. A Mykonos existe para você sentir o frasco na pele, comparar duas opções lado a lado e sair sabendo o que levou. O site adianta a parte chata — preço, tamanho, notas — para que a conversa comece já no ponto certo.',
  },
  {
    label: 'Coração',
    title: 'Importado, nacional e árabe na mesma prateleira',
    text: 'Não separamos por prestígio. O europeu discreto que serve para o trabalho, o nacional que cabe no orçamento e o árabe que dura o dia inteiro convivem no mesmo balcão, porque a pergunta certa nunca foi a origem — é o que combina com você, com a ocasião e com o que você pode gastar agora.',
  },
  {
    label: 'Fundo',
    title: 'Atendimento que continua depois da venda',
    text: 'Quem vende é quem conhece o estoque. Você fala com uma pessoa que pode conferir o frasco, mandar foto do lote e dizer honestamente quando um perfume mais barato resolve melhor. É por isso que a compra termina no WhatsApp e não num carrinho anônimo.',
  },
];

const CRITERIA = [
  {
    title: 'Lacre e lote conferidos',
    text: 'Nada entra na prateleira sem embalagem íntegra e lote visível. Antes de separar o seu, mandamos a foto para você conferir.',
  },
  {
    title: 'Provado antes de indicar',
    text: 'A equipe usa o que vende. Quando alguém diz que um perfume fixa oito horas, é porque testou na própria pele.',
  },
  {
    title: 'Preço explicado',
    text: 'Se a versão de 50 ml resolve o seu caso, a gente diz. Vender o frasco maior por vender não traz ninguém de volta.',
  },
  {
    title: 'Sem empurrar novidade',
    text: 'Lançamento entra no catálogo quando merece, não quando chega. Muita coisa que testamos não passa dessa etapa.',
  },
];

export default function About() {
  const { settings } = useStore();

  return (
    <>
      <Seo
        title="Sobre a Mykonos Parfum"
        description="A Mykonos Parfum em Rio Verde, GO: perfumes importados, nacionais e árabes, body splash e kits, com atendimento direto pelo WhatsApp e loja física para provar antes de levar."
        path="/sobre"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Sobre', path: '/sobre' },
        ])}
      />

      <PageHero
        eyebrow="A casa"
        title={settings.aboutTitle}
        lead="Perfumaria, maquiagem e cuidado em Rio Verde, GO — vendidos por conversa, não por carrinho anônimo."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Sobre' }]}
        aside={
          <WhatsAppButton message={specialistMessage()}>Falar com um especialista</WhatsAppButton>
        }
      />

      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <Reveal>
            <div className="overflow-hidden lg:sticky lg:top-24">
              <img
                src="/img/cat-perfumes-importados-1280.webp"
                alt="Frascos alinhados no balcão da Mykonos Parfum"
                loading="lazy"
                decoding="async"
                className="aspect-3/4 w-full object-cover"
              />
            </div>
          </Reveal>

          <div className="space-y-14">
            {CHAPTERS.map((chapter) => (
              <Reveal key={chapter.label}>
                <div className="tier-label text-aegean">{chapter.label}</div>
                <h2 className="mt-5 text-balance lowercase text-3xl md:text-4xl">{chapter.title}</h2>
                <p className="mt-4 text-pretty leading-relaxed text-stone">{chapter.text}</p>
              </Reveal>
            ))}

            <Reveal>
              <div className="space-y-5 border-t border-salt pt-10">
                {settings.aboutText.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-pretty leading-relaxed text-stone">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Section tone="limewash">
        <SectionHeader
          eyebrow="Curadoria"
          title={
            <>
              o que precisa ser verdade <span className="italic text-aegean">para entrar no catálogo</span>
            </>
          }
          lead="Quatro critérios que valem para qualquer produto, do árabe de duzentos reais ao importado de mil."
        />

        <RevealGroup className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {CRITERIA.map((item) => (
            <RevealItem key={item.title}>
              <div className="border-t border-salt pt-7">
                <h3 className="font-display text-2xl lowercase">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-stone">{item.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section tone="aegean">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-mist">Venha conhecer</p>
            <h2 className="mt-6 text-balance lowercase text-4xl md:text-5xl">
              a loja fica em {settings.address}
            </h2>
            <p className="mt-5 leading-relaxed text-mist">
              Confirme a disponibilidade pelo WhatsApp antes de vir — parte do estoque gira rápido, e
              assim a gente separa o frasco esperando você.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <WhatsAppButton message={generalMessage('uma visita à loja')} variant="chalk" size="lg">
              Combinar uma visita
            </WhatsAppButton>
            <RouteButton to="/catalogo" variant="outline-invert" size="lg">
              Ver catálogo
            </RouteButton>
          </div>
        </Reveal>
      </Section>

      <Differentials />
      <Faq />
    </>
  );
}
