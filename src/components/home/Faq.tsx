import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Section, SectionHeader } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useStore } from '@/contexts/StoreContext';
import { generalMessage } from '@/utils/whatsapp';
import { cn } from '@/utils/cn';

export function Faq() {
  const { settings } = useStore();
  const [open, setOpen] = useState<string | null>(settings.faq[0]?.id ?? null);

  if (settings.faq.length === 0) return null;

  return (
    <Section id="faq">
      <SectionHeader
        eyebrow="Perguntas frequentes"
        title={
          <>
            antes de comprar, <span className="italic text-aegean">o que costumam perguntar</span>
          </>
        }
        lead="Se a sua pergunta não estiver aqui, mande no WhatsApp. Respondemos em minutos."
        action={
          <WhatsAppButton message={generalMessage('uma dúvida que não está no site')} variant="outline">
            Perguntar agora
          </WhatsAppButton>
        }
      />

      <Reveal>
        <dl className="border-t border-salt">
          {settings.faq.map((item) => {
            const expanded = open === item.id;
            return (
              <div key={item.id} className="border-b border-salt">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : item.id)}
                    aria-expanded={expanded}
                    aria-controls={`faq-${item.id}`}
                    className="flex w-full items-start justify-between gap-8 py-7 text-left transition-colors duration-300 hover:text-aegean"
                  >
                    <span className="max-w-2xl font-display text-xl leading-snug md:text-2xl">
                      {item.question}
                    </span>

                    <Plus
                      aria-hidden
                      className={cn(
                        'mt-1.5 size-5 shrink-0 text-aegean transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        expanded && 'rotate-45',
                      )}
                    />
                  </button>
                </dt>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.dd
                      id={`faq-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-8 pr-12 text-pretty leading-relaxed text-stone">
                        {item.answer}
                      </p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </dl>
      </Reveal>
    </Section>
  );
}
