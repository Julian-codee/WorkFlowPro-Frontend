"use client";

import { Alert, Input, Select, Textarea } from "@/components/ui";

import { ACCOUNT_TYPE_OPTIONS } from "../constants";

const CURRENCY_OPTIONS = [
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
      {isEditing ? (
        <Alert variant="info" title="Saldo de la cuenta">
          El saldo actual se recalcula con los movimientos registrados; cambiar el saldo inicial ajusta el saldo de la cuenta.
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="account-name"
          name="name"
          label="Nombre de la cuenta"
          placeholder="Ej. Caja principal · Sede Lima"
          value={values.name ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.name}
          disabled={isLoading}
          required
          className="sm:col-span-2"
        />

        <Select
          id="account-type"
          name="type"
          label="Tipo de cuenta"
          value={values.type ?? ""}
          onChange={onChange}
          options={ACCOUNT_TYPE_OPTIONS}
          placeholder="Selecciona un tipo"
          error={errors.type}
          disabled={isLoading}
          required
        />

        <Select
          id="account-currency"
          name="currency"
          label="Moneda"
          value={values.currency ?? ""}
          onChange={onChange}
          options={CURRENCY_OPTIONS}
          placeholder="Selecciona una moneda"
          error={errors.currency}
          disabled={isLoading}
          required
        />

        <Input
          id="account-opening-balance"
          name="opening_balance"
          type="number"
          label="Saldo inicial"
          placeholder="0.00"
          value={values.opening_balance ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.opening_balance}
          hint="Saldo con el que inicia la cuenta."
          disabled={isLoading}
          inputClassName="tabular-nums"
        />

        <Input
          id="account-owner"
          name="owner"
          label="Responsable"
          placeholder="Ej. Ana Morales"
          value={values.owner ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.owner}
          disabled={isLoading}
        />

        <Input
          id="account-branch"
          name="branch"
          label="Sucursal"
          placeholder="Ej. Sede central"
          value={values.branch ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.branch}
          hint="Sucursal o número de cuenta"
          disabled={isLoading}
          className="sm:col-span-2"
        />

        <Textarea
          id="account-notes"
          name="notes"
          label="Notas"
          placeholder="Añade información relevante sobre esta cuenta."
          value={values.notes ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.notes}
          rows={3}
          maxLength={500}
          disabled={isLoading}
          className="sm:col-span-2"
        />
      </div>
    </form>
  );
}
