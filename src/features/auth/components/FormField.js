/**
 * Campo de formulario reutilizable (texto, email, etc.).
 *
 * Es un componente controlado: recibe `value`, `onChange` y `onBlur`, por lo
 * que la lógica de validación permanece fuera del componente visual.
 */
export default function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error = null,
  placeholder,
  icon: Icon = null,
  autoComplete,
  disabled = false,
  required = false,
  hint = null,
  className = "",
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-[clamp(3px,0.6vh,6px)] block text-[12.5px] font-semibold text-[#334155]">
        {label}
      </label>

      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#94A3B8]"
            aria-hidden="true"
          />
        ) : null}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={`h-[clamp(42px,5.2vh,48px)] w-full rounded-xl border bg-white text-[14px] text-[#0B1220] outline-none transition placeholder:text-[#A3AFC2] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F3F5F9] disabled:text-[#94A3B8] ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-3.5 ${
            error
              ? "border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]/10"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2E6BFF] focus:ring-[#2E6BFF]/10"
          }`}
        />
      </div>

      {hint && !error ? (
        <p id={hintId} className="mt-[clamp(4px,0.7vh,6px)] text-[12px] text-[#94A3B8]">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="mt-[clamp(4px,0.7vh,6px)] text-[12px] font-medium text-[#D92D20]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
