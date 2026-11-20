"use client";

import { Input, Select, Textarea } from "@/components/ui";

import { ACCOUNT_STATUS_OPTIONS, ACCOUNT_TYPE_OPTIONS } from "../constants";

const CURRENCY_OPTIONS = [
  { value: "COP", label: "$ · Peso colombiano" },
  { value: "PEN", label: "S/ · Sol peruano" },
  { value: "USD", label: "US$ · Dólar americano" },
];

/**
 * Formulario controlado para crear y editar una cuenta financiera.
 */
export default function FinanceAccountForm({
  values,
  errors = {},
  onChange,
  onBlur,
  isLoading = false,
  isEditing = false,
}) {
  return (
    <form
      noValidate
      onSubmit={(event) => event.preventDefault()}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="account-name"
          name="name"
          label="Nombre de la cuenta"
          placeholder="Ej. Caja principal"
          value={values.name ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.name}
          disabled={isLoading}
          required
        />

        <Input
          id="account-code"
          name="code"
          label="Código"
          placeholder="Ej. CAJA001"
          value={values.code ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.code}
          disabled={isLoading || isEditing}
          required
          hint={isEditing ? "El código de la cuenta no se puede modificar." : undefined}
        />

        <Select
          id="account-type"
          name="type"
          label="Tipo de cuenta"
          value={values.type ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.type}
          options={ACCOUNT_TYPE_OPTIONS}
          placeholder="Selecciona un tipo"
          disabled={isLoading}
          required
        />

        <Select
          id="account-currency"
          name="currency"
          label="Moneda"
          value={values.currency ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.currency}
          options={CURRENCY_OPTIONS}
          placeholder="Selecciona una moneda"
          disabled={isLoading}
          required
        />

        <Select
          id="account-status"
          name="status"
          label="Estado"
          value={values.status ?? "active"}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.status}
          options={ACCOUNT_STATUS_OPTIONS}
          disabled={isLoading}
          required
        />

        <Textarea
          id="account-description"
          name="description"
          label="Descripción"
          placeholder="Añade información relevante sobre esta cuenta."
          value={values.description ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.description}
          rows={3}
          maxLength={500}
          disabled={isLoading}
          className="sm:col-span-2"
        />
      </div>
    </form>
  );
}
