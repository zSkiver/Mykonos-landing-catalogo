import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, FormSection, TextArea, TextInput } from '@/components/admin/Field';
import { useStore } from '@/contexts/StoreContext';
import { settingsService } from '@/services/content.service';
import { randomId } from '@/utils/slug';
import type { FaqItem, StoreSettings } from '@/types';

export default function SettingsAdmin() {
  const { settings, refresh } = useStore();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setBusy(true);
    try {
      const { id: _id, ...payload } = draft;
      await settingsService.save({
        ...payload,
        whatsappNumber: payload.whatsappNumber.replace(/\D/g, ''),
      });
      await refresh();
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminHeader
        title="Configurações"
        description="Dados de contato, horários de atendimento e FAQ."
        action={
          <div className="flex items-center gap-4">
            {saved && (
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-aegean">Salvo</span>
            )}
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-aegean text-chalk px-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {busy && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              Salvar
            </button>
          </div>
        }
      />
      <FormSection title="Loja e contato" description="O número do WhatsApp alimenta todos os botões do site.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nome da loja">
            <TextInput value={draft.storeName} onChange={(event) => set('storeName', event.target.value)} />
          </Field>

          <Field label="WhatsApp" hint="Somente dígitos, com código do país.">
            <TextInput
              inputMode="numeric"
              value={draft.whatsappNumber}
              onChange={(event) => set('whatsappNumber', event.target.value)}
              placeholder="5564992970843"
            />
          </Field>

          <Field label="Instagram">
            <TextInput type="url" value={draft.instagram} onChange={(event) => set('instagram', event.target.value)} />
          </Field>

          <Field label="E-mail">
            <TextInput type="email" value={draft.email} onChange={(event) => set('email', event.target.value)} />
          </Field>

          <Field label="Endereço" className="md:col-span-2">
            <TextInput value={draft.address} onChange={(event) => set('address', event.target.value)} />
          </Field>

          <Field label="Busca no Google Maps" className="md:col-span-2" hint="Usado no mapa da página de contato.">
            <TextInput value={draft.mapsQuery} onChange={(event) => set('mapsQuery', event.target.value)} />
          </Field>

          <Field label="Aviso do topo" className="md:col-span-2">
            <TextInput value={draft.announcement} onChange={(event) => set('announcement', event.target.value)} />
          </Field>

        </div>
      </FormSection>

      <FormSection title="Horário de atendimento">
        <div className="space-y-3">
          {draft.openingHours.map((entry, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem]">
              <TextInput
                value={entry.days}
                aria-label="Dias de atendimento"
                onChange={(event) =>
                  set(
                    'openingHours',
                    draft.openingHours.map((item, position) =>
                      position === index ? { ...item, days: event.target.value } : item,
                    ),
                  )
                }
              />
              <TextInput
                value={entry.hours}
                aria-label="Horário de atendimento"
                onChange={(event) =>
                  set(
                    'openingHours',
                    draft.openingHours.map((item, position) =>
                      position === index ? { ...item, hours: event.target.value } : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                aria-label="Remover horário"
                onClick={() =>
                  set('openingHours', draft.openingHours.filter((_, position) => position !== index))
                }
                className="grid size-11 place-items-center rounded-lg border border-salt text-stone transition-colors hover:border-red-400/40 hover:text-red-400"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}

          <AddButton
            label="Adicionar horário"
            onClick={() => set('openingHours', [...draft.openingHours, { days: '', hours: '' }])}
          />
        </div>
      </FormSection>

      <FormSection title="Perguntas frequentes" description="Também viram dados estruturados de FAQ para o Google.">
        <div className="space-y-5">
          {draft.faq.map((item, index) => (
            <FaqFields
              key={item.id}
              item={item}
              onChange={(changes) =>
                set(
                  'faq',
                  draft.faq.map((current, position) =>
                    position === index ? { ...current, ...changes } : current,
                  ),
                )
              }
              onRemove={() =>
                set(
                  'faq',
                  draft.faq.filter((_, position) => position !== index),
                )
              }
            />
          ))}

          <AddButton
            label="Adicionar pergunta"
            onClick={() => set('faq', [...draft.faq, { id: randomId('faq'), question: '', answer: '' }])}
          />
        </div>
      </FormSection>
    </div>
  );
}

function FaqFields({
  item,
  onChange,
  onRemove,
}: {
  item: FaqItem;
  onChange: (changes: Partial<FaqItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-salt p-5">
      <Field label="Pergunta">
        <TextInput value={item.question} onChange={(event) => onChange({ question: event.target.value })} />
      </Field>
      <Field label="Resposta" className="mt-4">
        <TextArea value={item.answer} onChange={(event) => onChange({ answer: event.target.value })} />
      </Field>

      <button
        type="button"
        onClick={onRemove}
        className="mt-4 inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ash transition-colors hover:text-red-400"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Remover
      </button>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-salt px-5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-stone transition-colors hover:border-aegean hover:text-aegean"
    >
      <Plus className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}
