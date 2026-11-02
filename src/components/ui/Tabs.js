"use client";

import { cn } from "@/lib/utils/cn";

/**
 * pestañas reutilizables del design system.
 *
 * `items`: [{ id, label, badge? }]
 */
export default function Tabs({ items = [], value, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center gap-1 rounded-xl bg-[#EDF1F7] p-1", className)}
    >
      {items.map((item) => {
        const isActive = item.id === value;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(item.id)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF]",
              isActive
                ? "bg-white text-[#0F1A33] shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
                : "text-[#64748B] hover:text-[#334155]",
            )}
          >
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-[#0F1A33]/8 px-1.5 py-0.5 text-[10.5px] font-bold text-[#475569]">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
