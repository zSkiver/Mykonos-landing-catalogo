import { Link } from 'react-router-dom';
import { FOOTER_CATEGORIES, FOOTER_LINKS } from '@/routes/nav';
import { useStore } from '@/contexts/StoreContext';
import { formatWhatsappNumber, generalMessage, whatsappLink } from '@/utils/whatsapp';
import { Wordmark } from './Wordmark';

/** O rodapé é branco sobre marinho — o logo aplicado em escala de página. */
export function Footer() {
  const { settings } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-aegean text-chalk">
      <div className="shell-wide py-16 md:py-20">
        <div className="grid gap-14 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-10">
          <div className="max-w-sm">
            <Wordmark invert />
            <p className="mt-7 leading-relaxed text-mist">
              Perfumes nacionais e importados, cosméticos, maquiagens e muito mais para você descobrir
              em Rio Verde, GO.
            </p>
            <a
              href={whatsappLink(generalMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="numeric mt-7 inline-block text-lg text-chalk transition-opacity hover:opacity-70"
            >
              {formatWhatsappNumber(settings.whatsappNumber)}
            </a>
          </div>

          <FooterColumn title="Coleções">
            {FOOTER_CATEGORIES.map((item) => (
              <FooterLink key={item.to} to={item.to}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Links rápidos">
            {FOOTER_LINKS.map((item) => (
              <FooterLink key={item.to} to={item.to}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Contato">
            <li className="text-sm leading-relaxed text-mist">{settings.address}</li>
            <li className="text-sm leading-relaxed text-mist">
              {settings.openingHours.map((entry) => (
                <span key={entry.days} className="block">
                  {entry.days}: {entry.hours}
                </span>
              ))}
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="text-sm text-mist transition-colors hover:text-chalk"
              >
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-mist transition-colors hover:text-chalk"
              >
                @mykonos.parfum
              </a>
            </li>
          </FooterColumn>
        </div>

        <div className="rule-invert my-12" aria-hidden />

        <div className="flex flex-col gap-4 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings.storeName}. Todos os direitos reservados.
          </p>
          <p className="font-mono uppercase tracking-[0.16em]">
            Originalidade garantida · Nota fiscal em todo pedido
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-chalk/55">{title}</h3>
      <ul className="mt-6 space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-mist transition-colors duration-300 hover:text-chalk">
        {children}
      </Link>
    </li>
  );
}
