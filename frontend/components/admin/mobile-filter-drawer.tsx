"use client";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onReset?: () => void;
  onApply?: () => void;
  children: React.ReactNode;
};

export function MobileFilterDrawer({ open, title, onClose, onReset, onApply, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/35" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[82vh] rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stone-300" />
        <h3 className="text-base font-semibold text-stone-900">{title}</h3>
        <div className="mt-3 max-h-[56vh] space-y-3 overflow-y-auto pr-1">{children}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onReset} className="min-h-11 rounded-xl border border-stone-300 text-sm text-stone-700">
            重置
          </button>
          <button type="button" onClick={onApply} className="min-h-11 rounded-xl bg-stone-900 text-sm text-white">
            确认筛选
          </button>
        </div>
      </div>
    </div>
  );
}

