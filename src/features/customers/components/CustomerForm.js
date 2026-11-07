"use client";

import { Building2, UserRound } from "lucide-react";

import { Alert, Input, Select } from "@/components/ui";

import { CUSTOMER_TYPES, DOCUMENT_TYPE_OPTIONS } from "../constants";
import { cn } from "@/lib/utils/cn";

import DuplicateCheckPanel from "./DuplicateCheckPanel";

/**
 * Formulario de alta/edición de cliente.
 *
 * Todos los campos controlados y con validación visual.
 * `onSubmit` recibe los valores ya validados.
 */
export default function CustomerForm({
  values,
  errors,
  onChange,
  onBlur,
  onTypeChange,
  onSubmit,
  isLoading,
  isEditing,
  showDuplicateCheck = false,
}) {
  const isLegal = values.type === CUSTOMER_TYPES.LEGAL;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="space-y-6"
    >
      {/* Tipo de cliente */}
      <section>
        <p className="text-[13px] font-semibold text-[#0B1220]">Tipo de cliente</p>
        <p className="mt-0.5 text-[12px] text-[#64748B]">
          Define qué datos te pediremos. Puedes cambiarlo mientras no guardes.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            {
              value: CUSTOMER_TYPES.NATURAL,
              label: "Persona natural",
              description: "Individual con documento de identidad.",
              icon: UserRound,
            },
            {
              value: CUSTOMER_TYPES.LEGAL,
              label: "Persona jurídica",
              description: "Empresa u organización con razón social.",
              icon: Building2,
            },
          ].map((option) => {
            const Icon = option.icon;
            const isActive = values.type === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                  isActive
                    ? "border-[#2E6BFF] bg-[#F4F7FF] shadow-[0_0_0_3px_rgba(46,107,255,0.08)]"
                    : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={isActive}
                  onChange={
                    onTypeChange
                      ? () => onTypeChange(option.value)
                      : (event) => onChange(event)
                  }
                  onBlur={onBlur}
                  disabled={isLoading}
                  className="sr-only"
                />

                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    isActive ? "bg-[#2E6BFF] text-white" : "bg-[#EDF1F7] text-[#64748B]",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>

                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-[#0B1220]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-5 text-[#64748B]">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Identificación */}
      <section className="border-t border-[#F1F4F9] pt-5">
        <p className="text-[13px] font-semibold text-[#0B1220]">Identificación</p>

        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {isLegal ? (
            <>
              <Input
                id="customer-business-name"
                name="business_name"
                label="Nombre comercial"
                placeholder="Ej. InnovaTech"
                value={values.business_name ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.business_name}
                disabled={isLoading}
                required
              />

              <Input
                id="customer-legal-name"
                name="legal_name"
                label="Razón social"
                placeholder="Ej. InnovaTech Solutions S.A.C."
                value={values.legal_name ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.legal_name}
                disabled={isLoading}
                required
              />

              <Input
                id="customer-tax-id"
                name="tax_id"
                label="Identificador fiscal"
                placeholder="Ej. 20512345678"
                value={values.tax_id ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.tax_id}
                disabled={isLoading}
                required
              />

              <Input
                id="customer-industry"
                name="industry"
                label="Sector o industria"
                placeholder="Ej. Tecnología y software"
                value={values.industry ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.industry}
                disabled={isLoading}
                required
              />
            </>
          ) : (
            <>
              <Input
                id="customer-first-name"
                name="first_name"
                label="Nombre"
                placeholder="Ej. Lucía"
                value={values.first_name ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.first_name}
                disabled={isLoading}
                required
              />

              <Input
                id="customer-last-name"
                name="last_name"
                label="Apellidos"
                placeholder="Ej. Fernández Ruiz"
                value={values.last_name ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.last_name}
                disabled={isLoading}
                required
              />
            </>
          )}

          <Select
            id="customer-document-type"
            name="document_type"
            label="Tipo de documento"
            value={values.document_type ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            options={DOCUMENT_TYPE_OPTIONS}
            error={errors.document_type}
            disabled={isLoading}
            required
          />

          <Input
            id="customer-document-number"
            name="document_number"
            label="Número de documento"
            placeholder="Ej. 10203040"
            value={values.document_number ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.document_number}
            disabled={isLoading}
            required
          />

          {isLegal ? (
            <Input
              id="customer-incorporation-date"
              name="incorporation_date"
              type="date"
              label="Fecha de constitución"
              value={values.incorporation_date ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.incorporation_date}
              disabled={isLoading}
            />
          ) : (
            <Input
              id="customer-birth-date"
              name="birth_date"
              type="date"
              label="Fecha de nacimiento"
              value={values.birth_date ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.birth_date}
              disabled={isLoading}
            />
          )}
        </div>
      </section>

      {/* Contacto */}
      <section className="border-t border-[#F1F4F9] pt-5">
        <p className="text-[13px] font-semibold text-[#0B1220]">Contacto</p>

        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <Input
            id="customer-email"
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="nombre@empresa.com"
            value={values.email ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <Input
            id="customer-phone"
            name="phone"
            label="Teléfono"
            placeholder="+51 987 654 321"
            value={values.phone ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.phone}
            disabled={isLoading}
            required
          />

          {isLegal ? (
            <>
              <Input
                id="customer-contact-name"
                name="contact_name"
                label="Persona de contacto"
                placeholder="Ej. Mateo Salazar"
                value={values.contact_name ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.contact_name}
                disabled={isLoading}
                required
              />

              <Input
                id="customer-contact-email"
                name="contact_email"
                type="email"
                label="Correo del contacto"
                placeholder="contacto@empresa.com"
                value={values.contact_email ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.contact_email}
                disabled={isLoading}
                hint="Opcional"
              />

              <Input
                id="customer-contact-phone"
                name="contact_phone"
                label="Teléfono del contacto"
                placeholder="+51 999 112 233"
                value={values.contact_phone ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.contact_phone}
                disabled={isLoading}
                hint="Opcional"
              />

              <Input
                id="customer-website"
                name="website"
                label="Sitio web"
                placeholder="https://empresa.com"
                value={values.website ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.website}
                disabled={isLoading}
                hint="Opcional"
              />
            </>
          ) : null}
        </div>
      </section>

      {/* Dirección */}
      <section className="border-t border-[#F1F4F9] pt-5">
        <p className="text-[13px] font-semibold text-[#0B1220]">Dirección</p>

        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <Input
            id="customer-address"
            name="address"
            label="Dirección"
            placeholder="Av. Arequipa 1234, apto 502"
            value={values.address ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.address}
            disabled={isLoading}
            required
            className="sm:col-span-2"
          />

          <Input
            id="customer-city"
            name="city"
            label="Ciudad"
            placeholder="Ej. Lima"
            value={values.city ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.city}
            disabled={isLoading}
            required
          />

          <Input
            id="customer-state"
            name="state"
            label="Estado / Provincia"
            placeholder="Ej. Lima"
            value={values.state ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.state}
            disabled={isLoading}
          />

          <Input
            id="customer-country"
            name="country"
            label="País"
            placeholder="Ej. Perú"
            value={values.country ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.country}
            disabled={isLoading}
            required
          />
        </div>
      </section>

      {showDuplicateCheck ? <DuplicateCheckPanel values={values} /> : null}

      {errors.document_number || errors.email ? (
        <Alert variant="error">Revisa los campos marcados antes de guardar el cliente.</Alert>
      ) : null}
    </form>
  );
}
