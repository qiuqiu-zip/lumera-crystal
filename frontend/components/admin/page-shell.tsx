import { cn } from "@/lib/utils";

export function AdminPageShell({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6", className)}>
      <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3 sm:border-none sm:bg-transparent sm:p-0">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-2xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-stone-600">{description}</p> : null}
        </div>
        {actions ? <div className="w-full">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
