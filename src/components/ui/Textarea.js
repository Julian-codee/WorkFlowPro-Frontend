import { cn } from "@/lib/utils/cn";

/**
 * Área de texto multilínea del design system.
 */
export default function Textarea({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error = null,
  hint = null,
  placeholder,
  rows = 4,
  maxLength,
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

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={cn(
          "w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-[14px] leading-6 text-[#0B1220] outline-none transition placeholder:text-[#A3AFC2] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F3F5F9] disabled:text-[#94A3B8]",
          error
            ? "border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]/10"
            : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2E6BFF] focus:ring-[#2E6BFF]/10",
        )}
      />

      <div className="mt-1.5 flex items-start justify-between gap-3">
        {hint && !error ? (
          <p id={hintId} className="text-[12px] text-[#94A3B8]">
            {hint}
          </p>
        ) : null}

        {maxLength ? (
          <span className="ml-auto shrink-0 text-[11.5px] tabular-nums text-[#A3AFC2]">
            {(value ?? "").length}/{maxLength}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-[12px] font-medium text-[#D92D20]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
