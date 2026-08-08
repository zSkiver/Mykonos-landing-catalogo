import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { UploadError, uploadImages } from '@/services/storage.service';
import { isSupabaseEnabled } from '@/supabase/client';
import { cn } from '@/utils/cn';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  max?: number;
}

/** A primeira imagem é usada como capa do produto na landing page. */
export function ImageUploader({ images, onChange, folder = 'products', max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded = await uploadImages(files, folder);
      onChange([...images, ...uploaded].slice(0, max));
    } catch (cause) {
      setError(cause instanceof UploadError ? cause.message : 'Falha no envio. Tente novamente.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const addUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange([...images, trimmed].slice(0, max));
    setUrl('');
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <figure key={image + index} className="group relative overflow-hidden rounded-lg bg-chalk ring-1 ring-salt">
            <img src={image} alt="" className="aspect-square w-full object-cover" />
            {index === 0 && (
              <figcaption className="absolute inset-x-0 top-0 bg-limewash/45 py-1 text-center font-mono text-[0.5rem] uppercase tracking-[0.16em] text-aegean">
                Capa
              </figcaption>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((_, position) => position !== index))}
              aria-label={`Remover imagem ${index + 1}`}
              className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-chalk/90 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-stone opacity-0 transition-opacity duration-300 hover:text-ink group-hover:opacity-100"
            >
              <Trash2 className="size-3" aria-hidden />
              Remover
            </button>
          </figure>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              'grid aspect-square place-items-center gap-1.5 rounded-lg border border-dashed border-salt text-ash transition-colors',
              busy ? 'opacity-60' : 'hover:border-aegean hover:text-aegean',
            )}
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-5" aria-hidden />
            )}
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em]">
              {busy ? 'Enviando' : 'Adicionar'}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(event) => void handleFiles(event.target.files)}
        className="sr-only"
      />

      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addUrl();
            }
          }}
          placeholder="Ou cole a URL de uma imagem"
          className="w-full rounded-lg border border-salt bg-chalk px-4 py-2.5 text-sm text-ink placeholder:text-ash focus:border-aegean focus:outline-none"
        />
        <button
          type="button"
          onClick={addUrl}
          className="shrink-0 rounded-lg border border-salt px-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-stone transition-colors hover:border-aegean hover:text-aegean"
        >
          Incluir
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {!isSupabaseEnabled && (
        <p className="mt-3 text-xs text-ash">
          Supabase Storage não configurado: as imagens enviadas ficam apenas neste navegador.
        </p>
      )}
    </div>
  );
}
