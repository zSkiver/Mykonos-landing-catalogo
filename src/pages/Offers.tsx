import { useMemo } from 'react';
import { Seo, breadcrumbSchema } from '@/components/common/Seo';
import { PageHero } from '@/components/common/PageHero';
import { Countdown } from '@/components/common/Countdown';
import { ProductCard } from '@/components/catalog/ProductCard';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { RevealGroup, RevealItem } from '@/components/common/Reveal';
import { useStore } from '@/contexts/StoreContext';
import { resolveDailyOffers, totalSavings } from '@/utils/offers';
import { endOfToday, formatPrice } from '@/utils/format';
import { generalMessage } from '@/utils/whatsapp';

export default function Offers() {
  const { products, offers: offerWindows } = useStore();
  const offers = useMemo(
    () => resolveDailyOffers(products, offerWindows),
    [products, offerWindows],
  );
  const midnight = useMemo(() => endOfToday(), []);
  const savings = totalSavings(offers);

  return (
    <>
      <Seo
        title="Ofertas do dia"
        description="Perfumes, maquiagem, cosméticos e skincare com desconto até a meia-noite, com compra direta pelo WhatsApp."
        path="/ofertas"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Ofertas', path: '/ofertas' },
        ])}
      />

      <PageHero
        eyebrow="Oferta do dia"
        title={
          <>
            Preços que zeram <span className="italic text-aegean">à meia-noite</span>
          </>
        }
        lead={
          offers.length > 0
            ? `${offers.length} produtos com desconto agora. Somando tudo, ${formatPrice(savings)} abaixo do preço de tabela.`
            : 'Nenhuma oferta ativa neste momento. A próxima seleção entra amanhã de manhã.'
        }
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Ofertas' }]}
        aside={offers.length > 0 ? <Countdown target={midnight} /> : undefined}
      />

      <div className="shell pb-24">
        {offers.length > 0 ? (
          <RevealGroup className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" step={0.05}>
            {offers.map((product, index) => (
              <RevealItem key={product.id} className="h-full">
                <ProductCard product={product} priority={index < 4} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="flex flex-col items-center border border-dashed border-salt px-8 py-20 text-center">
            <p className="eyebrow text-aegean">Fora do horário</p>
            <h2 className="mt-4 max-w-md text-balance text-2xl">
              As ofertas de hoje já foram — mas podemos ajudar
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone">
              Diga qual fragrância você procura e verificamos se ainda dá para segurar o preço.
            </p>
            <WhatsAppButton message={generalMessage('as ofertas de hoje')} className="mt-8">
              Perguntar sobre ofertas
            </WhatsAppButton>
          </div>
        )}
      </div>
    </>
  );
}
