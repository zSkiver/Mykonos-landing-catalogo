import { Seo } from '@/components/common/Seo';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { BeautyEdit } from '@/components/home/BeautyEdit';
import { DailyOffers } from '@/components/home/DailyOffers';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PromoBand } from '@/components/home/PromoBand';
import { Differentials } from '@/components/home/Differentials';
import { About } from '@/components/home/About';
import { Faq } from '@/components/home/Faq';
import { Contact } from '@/components/home/Contact';
import { useStore } from '@/contexts/StoreContext';

export default function Home() {
  const { settings } = useStore();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: settings.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <Seo
        title="Mykonos Parfum — Perfumes, maquiagem, cosméticos e skincare"
        description="Perfumes nacionais e importados, maquiagens, cosméticos e skincare em Rio Verde, GO. Atendimento direto pelo WhatsApp."
        path="/"
        schema={faqSchema}
      />

      <Hero />
      <DailyOffers />
      <Categories />
      <BeautyEdit />
      <HowItWorks />
      <PromoBand />
      <Differentials />
      <About />
      <Faq />
      <Contact />
    </>
  );
}
