import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Select nativo estilizado (accesible y sin dependencias extra).
 */
export default function Select({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  error = null,
  hint = null,
  disabled = false,
  required = false,
  className = "",
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-[clamp(3px,0.6vh,6px)] block text-[12.5px] font-semibold text-[#334155]">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-white pl-3.5 pr-9 text-[14px] text-[#0B1220] outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F3F5F9] disabled:text-[#94A3B8]",
            error
              ? "border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]/10"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2E6BFF] focus:ring-[#2E6BFF]/10",
          )}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
          aria-hidden="true"
        />
      </div>

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-[12px] text-[#94A3B8]">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="mt-1.5 text-[12px] font-medium text-[#D92D20]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
