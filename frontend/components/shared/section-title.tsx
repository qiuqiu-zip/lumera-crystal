import { ReactNode } from "react";

export function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-sm text-ink/70">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
