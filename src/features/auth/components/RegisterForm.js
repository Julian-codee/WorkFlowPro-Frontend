"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, Mail, UserRound } from "lucide-react";

import { IS_API_MODE, SIMULATION_NOTICE } from "../config";
import { useRegisterForm } from "../hooks/useRegisterForm";
import FormField from "./FormField";
import PasswordField from "./PasswordField";
import StatusMessage from "./StatusMessage";

/**
 * Formulario de registro de cuenta.
 *
 * Conecta con `POST /api/v1/auth/register`:
 *   { email, username, password, tenant_slug? }
 */
export default function RegisterForm() {
  const {
    values,
    errors,
    formError,
    notice,
    formRef,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useRegisterForm();

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-[clamp(8px,1.4vh,24px)] space-y-[clamp(9px,1.5vh,16px)]">
      {IS_API_MODE ? null : (
        <StatusMessage variant="info">
          <span className="font-semibold text-[#1D4ED8]">Vista previa.</span> {SIMULATION_NOTICE}
        </StatusMessage>
      )}

      {formError ? <StatusMessage variant="error">{formError}</StatusMessage> : null}
      {notice ? <StatusMessage variant="success">{notice}</StatusMessage> : null}

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

      <FormField
        id="username"
        name="username"
        label="Nombre de usuario"
        icon={UserRound}
        placeholder="nombre.apellido"
        autoComplete="username"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.username}
        disabled={isLoading}
        required
      />

      <PasswordField
        id="password"
        name="password"
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        disabled={isLoading}
        required
      />

      <PasswordField
        id="password_confirmation"
        name="password_confirmation"
        label="Repite la contraseña"
        placeholder="Vuelve a escribir tu contraseña"
        autoComplete="new-password"
        value={values.password_confirmation}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password_confirmation}
        disabled={isLoading}
        required
      />

      <FormField
        id="tenant_slug"
        name="tenant_slug"
        label="Empresa (opcional)"
        placeholder="mi-empresa"
        value={values.tenant_slug}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.tenant_slug}
        disabled={isLoading}
        hint="Si lo dejas vacío, se creará un espacio de trabajo con tu correo."
      />

      <button
        type="submit"
        disabled={isLoading}
        className="group flex h-[clamp(42px,5.2vh,48px)] w-full items-center justify-center gap-2 rounded-xl bg-[#0F1A33] text-[14px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(15,26,51,0.95)] transition hover:bg-[#17233F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1A33] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Creando cuenta…
          </>
        ) : (
          <>
            Crear mi cuenta
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      <p className="text-center text-[13px] text-[#64748B]">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#2E6BFF] transition hover:text-[#1D4FD8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF]"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
