import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsCoarsePointer } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';

interface Props {
  images: string[];
  alt: string;
}

/** Galeria com zoom por posição do ponteiro — sem lightbox, sem dependência. */
export function Gallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef<HTMLDivElement>(null);
  const coarse = useIsCoarsePointer();

  const gallery = images.length > 0 ? images : [''];
  const current = gallery[Math.min(index, gallery.length - 1)];

  const onMove = (event: React.PointerEvent) => {
    if (coarse) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="lg:sticky lg:top-24">
      <div
        ref={frameRef}
        onPointerMove={onMove}
        onPointerEnter={() => setZooming(true)}
        onPointerLeave={() => setZooming(false)}
        className="group relative aspect-4/5 overflow-hidden bg-limewash"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={current}
            alt={alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: origin,
              transform: zooming && !coarse ? 'scale(1.8)' : undefined,
            }}
            className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </AnimatePresence>

        {!coarse && (
          <span className="pointer-events-none absolute bottom-4 right-4 bg-chalk/90 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-stone transition-opacity duration-500 group-hover:opacity-0">
            Passe o cursor para ampliar
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {gallery.map((image, position) => (
            <button
              key={image + position}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Ver imagem ${position + 1} de ${gallery.length}`}
              aria-current={position === index}
              className={cn(
                'size-20 shrink-0 overflow-hidden border transition-colors duration-400',
                position === index ? 'border-aegean' : 'border-transparent hover:border-salt',
              )}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className={cn(
                  'size-full object-cover transition-opacity duration-400',
                  position === index ? 'opacity-100' : 'opacity-60 hover:opacity-90',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
