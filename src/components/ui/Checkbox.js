"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Checkbox con estilo propio (consistente con el de la pantalla de login).
 */
export default function Checkbox({
  id,
  name,
  label,
  checked,
  onChange,
  description = null,
  disabled = false,
  className = "",
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer select-none items-start gap-2.5 text-[13px] text-[#475569]",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative mt-px">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
        />
        <span className="grid h-[18px] w-[18px] place-items-center rounded-[6px] border border-[#CBD5E1] bg-white transition peer-checked:border-[#2E6BFF] peer-checked:bg-[#2E6BFF] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2E6BFF] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <Check className="h-3 w-3 text-white" aria-hidden="true" />
        </span>
      </span>

      <span className="min-w-0">
        <span className="font-medium text-[#334155]">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[12px] text-[#94A3B8]">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
