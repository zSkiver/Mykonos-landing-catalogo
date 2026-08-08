import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminHeader({ title, description, action }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-stone">{description}</p>}
      </div>
      {action}
    </header>
  );
}
