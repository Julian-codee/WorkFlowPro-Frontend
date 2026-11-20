"use client";

import { ArrowDownRight, ArrowUpRight, Clock3 } from "lucide-react";

import { Alert, Input, Select, Textarea } from "@/components/ui";

import {
  MOVEMENT_TYPES,
  PAYMENT_METHOD_OPTIONS,
  getCategoriesForType,
  getWeekKey,
} from "../constants";
import { useFinancialAccounts } from "../hooks/useFinancialAccounts";
import { useFinancialPeriods } from "../hooks/useFinancialPeriods";

/**
 * Formulario de alta/edición de un movimiento financiero.
 *
 * Distingue la fecha del movimiento de la fecha de registro y advierte cuando
 * la fecha elegida pertenece a una semana ya cerrada (movimiento tardío).
 */
export default function FinanceMovementForm({
  values,
  errors,
  onChange,
  onBlur,
  onTypeChange,
  isLoading = false,
  isEditing = false,
}) {
  const { accounts } = useFinancialAccounts();
  const { periods } = useFinancialPeriods();

  const categories = getCategoriesForType(values.type);
  const accountOptions = accounts
    .filter((account) => account.status === "active")
    .map((account) => ({ value: account.id, label: `${account.name} · ${account.currency}` }));

  const weekKey = values.movement_date ? getWeekKey(values.movement_date) : null;
  const period = periods.find((item) => item.week_key === weekKey);
  const isLate = Boolean(period && period.status === "closed" && !isEditing);

  return (
    <div className="space-y-5">
      {/* Tipo de movimiento */}
      <div>
        <p className="mb-[clamp(3px,0.6vh,6px)] text-[12.5px] font-semibold text-[#334155]">
          Tipo de movimiento
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <TypeOption
            active={values.type === MOVEMENT_TYPES.INCOME}
            onClick={() => onTypeChange?.(MOVEMENT_TYPES.INCOME)}
            title="Ingreso"
            description="Entrada de dinero"
            icon={ArrowUpRight}
            activeClass="border-[#CDEBD8] bg-[#F0FBF4] text-[#0A6B3D]"
            idleClass="border-[#E2E8F0] bg-white text-[#475569]"
            disabled={isLoading}
          />

          <TypeOption
            active={values.type === MOVEMENT_TYPES.EXPENSE}
            onClick={() => onTypeChange?.(MOVEMENT_TYPES.EXPENSE)}
            title="Egreso"
            description="Salida de dinero"
            icon={ArrowDownRight}
            activeClass="border-[#F4C7CA] bg-[#FEF4F4] text-[#B42318]"
            idleClass="border-[#E2E8F0] bg-white text-[#475569]"
            disabled={isLoading}
          />
        </div>

        {errors.type ? (
          <p className="mt-1.5 text-[12px] font-medium text-[#D92D20]">{errors.type}</p>
        ) : null}
      </div>

      {isLate ? (
        <Alert variant="warning" title="Movimiento sobre una semana cerrada">
          La fecha {values.movement_date} pertenece a la semana {period.number}, que ya está
          cerrada. El movimiento se registrará como tardío, con su propia fecha de registro, y no
          alterará el cierre original.
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="movement-concept"
          name="concept"
          label="Concepto"
          placeholder="Ej. Implementación WorkFlowPro · Plan Growth"
          value={values.concept ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.concept}
          disabled={isLoading}
          required
          className="sm:col-span-2"
        />

        <Input
          id="movement-amount"
          name="amount"
          type="number"
          step="0.01"
          label="Importe"
          placeholder="0.00"
          value={values.amount ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.amount}
          disabled={isLoading}
          required
        />

        <Select
          id="movement-category"
          name="category"
          label="Categoría"
          value={values.category ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.category}
          options={categories}
          placeholder="Selecciona una categoría"
          disabled={isLoading}
          required
        />

        <Select
          id="movement-account"
          name="account_id"
          label="Cuenta"
          value={values.account_id ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.account_id}
          options={accountOptions}
          placeholder="Selecciona una cuenta"
          disabled={isLoading}
          required
        />

        <Select
          id="movement-method"
          name="payment_method"
          label="Método de pago"
          value={values.payment_method ?? "cash"}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.payment_method}
          options={PAYMENT_METHOD_OPTIONS}
          disabled={isLoading}
          required
        />

        <Input
          id="movement-date"
          name="movement_date"
          type="date"
          label="Fecha del movimiento"
          value={values.movement_date ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.movement_date}
          disabled={isLoading}
          required
          hint="La fecha en que ocurrió el hecho económico."
        />

        <Input
          id="movement-reference"
          name="reference"
          label="Referencia"
          placeholder="Ej. FAC-2026-0123"
          value={values.reference ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isLoading}
          hint="Opcional. Comprobante o documento asociado."
        />

        <Textarea
          id="movement-notes"
          name="notes"
          label="Observaciones"
          placeholder="Detalle del movimiento, responsable o incidencias…"
          value={values.notes ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.notes}
          disabled={isLoading}
          rows={3}
          maxLength={500}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-3.5">
        <Clock3 className="mt-px h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
        <p className="text-[12px] leading-5 text-[#64748B]">
          El sistema guarda la fecha del movimiento y la fecha de registro. Si se registra una
          fecha de una semana ya cerrada, el movimiento queda marcado como tardío.
        </p>
      </div>
    </div>
  );
}

/** Opción seleccionable de tipo de movimiento. */
function TypeOption({
  active,
  onClick,
  title,
  description,
  icon: Icon,
  activeClass,
  idleClass,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition disabled:opacity-60 ${
        active ? activeClass : idleClass
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          active ? "bg-white/70" : "bg-[#F7F9FC] text-[#94A3B8]"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <span>
        <span className="block text-[13.5px] font-semibold">{title}</span>
        <span className="block text-[11.5px] opacity-75">{description}</span>
      </span>
    </button>
  );
}
