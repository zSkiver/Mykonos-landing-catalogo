import { Section, SectionHeader } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useStore } from '@/contexts/StoreContext';
import { formatWhatsappNumber, generalMessage, whatsappLink } from '@/utils/whatsapp';

export function Contact() {
  const { settings } = useStore();
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(settings.mapsQuery)}&z=15&output=embed`;

  return (
    <Section id="contato" tone="limewash">
      <SectionHeader
        eyebrow="Contato"
        title={
          <>
            a conversa começa <span className="italic text-aegean">quando você quiser</span>
          </>
        }
        lead="Atendemos pelo WhatsApp todos os dias. Na loja física, nos horários abaixo."
        action={
          <WhatsAppButton message={generalMessage()} size="lg">
            Iniciar conversa
          </WhatsAppButton>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal>
          <dl className="border-t border-salt">
            <ContactRow label="WhatsApp">
              <a
                href={whatsappLink(generalMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline numeric text-lg text-ink transition-colors hover:text-aegean"
              >
                {formatWhatsappNumber(settings.whatsappNumber)}
              </a>
              <p className="mt-2 text-sm text-stone">Resposta média em 4 minutos, das 8h às 22h.</p>
            </ContactRow>

            <ContactRow label="Instagram">
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-lg text-ink transition-colors hover:text-aegean"
              >
                @mykonos.parfum
              </a>
              <p className="mt-2 text-sm text-stone">Lançamentos e chegadas do dia nos stories.</p>
            </ContactRow>

            <ContactRow label="Endereço">
              <p className="text-lg leading-snug text-ink">{settings.address}</p>
            </ContactRow>

            <ContactRow label="Horário">
              <ul className="space-y-1.5">
                {settings.openingHours.map((entry) => (
                  <li key={entry.days} className="flex justify-between gap-6 text-sm">
                    <span className="text-stone">{entry.days}</span>
                    <span className="numeric text-ink">{entry.hours}</span>
                  </li>
                ))}
              </ul>
            </ContactRow>

            <ContactRow label="E-mail">
              <a
                href={`mailto:${settings.email}`}
                className="link-underline text-lg text-ink transition-colors hover:text-aegean"
              >
                {settings.email}
              </a>
            </ContactRow>
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <iframe
            title={`Mapa com a localização da ${settings.storeName}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[26rem] w-full border-0 grayscale-[0.9] lg:h-full lg:min-h-[32rem]"
          />
        </Reveal>
      </div>
    </Section>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-salt py-6 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
