"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

/**
 * Campo de contraseña con opción de mostrar/ocultar.
 *
 * La visibilidad es estado local puramente visual; no afecta a la lógica
 * de autenticación ni a los valores enviados.
 */
export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error = null,
  placeholder,
  autoComplete = "current-password",
  disabled = false,
  required = false,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-[clamp(3px,0.6vh,6px)] block text-[12.5px] font-semibold text-[#334155]">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#94A3B8]"
          aria-hidden="true"
        />

        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-[clamp(42px,5.2vh,48px)] w-full rounded-xl border bg-white pl-10 pr-11 text-[14px] text-[#0B1220] outline-none transition placeholder:text-[#A3AFC2] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F3F5F9] disabled:text-[#94A3B8] ${
            error
              ? "border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]/10"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2E6BFF] focus:ring-[#2E6BFF]/10"
          }`}
        />

        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          disabled={disabled}
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={isVisible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#475569] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF] disabled:cursor-not-allowed"
        >
          {isVisible ? (
            <EyeOff className="h-[17px] w-[17px]" aria-hidden="true" />
          ) : (
            <Eye className="h-[17px] w-[17px]" aria-hidden="true" />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} className="mt-[clamp(4px,0.7vh,6px)] text-[12px] font-medium text-[#D92D20]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
