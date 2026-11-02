"use client";

import { ArrowRight, Check, LoaderCircle, Mail, Sparkles } from "lucide-react";

import { AUTH_PROVIDERS } from "../constants";
import { DEMO_CREDENTIALS, IS_API_MODE, SIMULATION_NOTICE } from "../config";
import { useLoginForm } from "../hooks/useLoginForm";
import FormField from "./FormField";
import PasswordField from "./PasswordField";
import SocialAuthButton from "./SocialAuthButton";
import StatusMessage from "./StatusMessage";

/**
 * Formulario de inicio de sesión.
 *
 * Este componente no contiene lógica de autenticación: delega en el hook
 * `useLoginForm` el estado, la validación y el envío.
 */
export default function LoginForm() {
  const {
    values,
    errors,
    rememberMe,
    formError,
    notice,
    formRef,
    isLoading,
    handleChange,
    handleBlur,
    handleRememberMe,
    handleSubmit,
    handleProviderLogin,
    handlePasswordReset,
    setCredentials,
  } = useLoginForm();

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-[clamp(8px,1.4vh,24px)] space-y-[clamp(9px,1.5vh,16px)]">
      {IS_API_MODE ? null : (
        <StatusMessage variant="info">
          <span className="font-semibold text-[#1D4ED8]">Vista previa.</span> {SIMULATION_NOTICE}
        </StatusMessage>
      )}

      {formError ? <StatusMessage variant="error">{formError}</StatusMessage> : null}
      {notice ? <StatusMessage variant="success">{notice}</StatusMessage> : null}

      {/* Acceso rápido a la cuenta ficticia de la vista previa */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#C9D6EA] bg-[#F6F9FF] px-3.5 py-[clamp(5px,0.8vh,8px)]">
        <p className="min-w-0 text-[11.5px] leading-[1.5] text-[#5B6B85]">
          <span className="font-semibold text-[#334155]">Cuenta demo:</span>{" "}
          <span className="font-mono text-[11px]">
            {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setCredentials(DEMO_CREDENTIALS)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5E0F2] bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-[#2E6BFF] transition hover:border-[#BFD0EC] hover:bg-[#F3F7FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Rellenar
        </button>
      </div>

      <FormField
        id="email"
        name="email"
        label="Correo electrónico"
        type="email"
        icon={Mail}
        placeholder="nombre@empresa.com"
        autoComplete="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        disabled={isLoading}
        required
      />

      <PasswordField
        id="password"
        name="password"
        label="Contraseña"
        placeholder="Escribe tu contraseña"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        disabled={isLoading}
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <label className="flex cursor-pointer select-none items-center gap-2 text-[12.5px] font-medium text-[#475569]">
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={handleRememberMe}
            disabled={isLoading}
            className="peer sr-only"
          />
          <span className="grid h-[18px] w-[18px] place-items-center rounded-[6px] border border-[#CBD5E1] bg-white transition peer-checked:border-[#2E6BFF] peer-checked:bg-[#2E6BFF] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2E6BFF] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
            <Check className="h-3 w-3 text-white" aria-hidden="true" />
          </span>
          Recordarme
        </label>

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={isLoading}
          className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#1D4FD8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group flex h-[clamp(42px,5.2vh,48px)] w-full items-center justify-center gap-2 rounded-xl bg-[#0F1A33] text-[14px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(15,26,51,0.95)] transition hover:bg-[#17233F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1A33] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Iniciando sesión…
          </>
        ) : (
          <>
            Entrar a mi cuenta
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-[#E4E9F1]" />
        <span className="text-[11.5px] text-[#98A5B8]">o continúa con</span>
        <span className="h-px flex-1 bg-[#E4E9F1]" />
      </div>

      <SocialAuthButton
        provider={AUTH_PROVIDERS.GOOGLE}
        onClick={() => handleProviderLogin(AUTH_PROVIDERS.GOOGLE)}
        disabled={isLoading}
      />
    </form>
  );
}
