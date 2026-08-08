import { Seo } from '@/components/common/Seo';
import { RouteButton } from '@/components/common/Button';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { generalMessage } from '@/utils/whatsapp';

export default function NotFound() {
  return (
    <>
      <Seo
        title="Página não encontrada"
        description="A página que você procurava não existe mais. Volte ao catálogo ou fale com a Mykonos Parfum pelo WhatsApp."
        path="/404"
        noIndex
      />

      <section className="shell flex min-h-[65vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow text-aegean">Erro 404</p>
        <h1 className="mt-6 max-w-lg text-balance lowercase text-4xl md:text-5xl">
          Essa fragrância <span className="italic text-aegean">evaporou</span>
        </h1>
        <p className="mt-5 max-w-md text-pretty leading-relaxed text-stone">
          O endereço não existe ou o produto saiu do catálogo. Se você sabe o que procurava, a gente
          confirma a disponibilidade pelo WhatsApp.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton message={generalMessage('um produto que não achei no site')}>
            Perguntar no WhatsApp
          </WhatsAppButton>
          <RouteButton to="/catalogo" variant="outline">
            Ver catálogo
          </RouteButton>
        </div>
      </section>
    </>
  );
}
