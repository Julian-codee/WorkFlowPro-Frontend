"use client";

import { Input, Select, Textarea } from "@/components/ui";

import { QUOTATION_CURRENCIES } from "../constants";

import QuotationCustomerPicker from "./QuotationCustomerPicker";
import QuotationItemsEditor from "./QuotationItemsEditor";
import QuotationTotalsPanel from "./QuotationTotalsPanel";

/**
 * Formulario de alta/edición de cotización.
 *
 * Controla cliente, cabecera, líneas y totales. Toda la lógica vive en
 * `useQuotationForm`; aquí solo se pintan los campos.
 */
export default function QuotationForm({
  values,
  errors,
  onChange,
  onBlur,
  onCustomerChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onCalculate,
  totals = null,
  isCalculating = false,
  isLoading = false,
  isEditing = false,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] xl:items-start">
      <div className="space-y-6">
        {/* Cliente */}
        <section>
          <QuotationCustomerPicker
            value={{
              customer_id: values.customer_id,
              customer_name: values.customer_name,
              customer_email: values.customer_email,
              type: values.type,
            }}
            onChange={onCustomerChange}
            error={errors.customer_id}
            type={values.type}
          />
        </section>

        {/* Cabecera */}
        <section className="border-t border-[#F1F4F9] pt-5">
          <p className="text-[13px] font-semibold text-[#0B1220]">Datos de la cotización</p>

          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            <Input
              id="quotation-title"
              name="title"
              label="Concepto"
              placeholder="Ej. Renovación plataforma premium 2026"
              value={values.title ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.title}
              disabled={isLoading}
              required
              className="sm:col-span-2"
            />

            <Select
              id="quotation-currency"
              name="currency"
              label="Moneda"
              value={values.currency ?? "USD"}
              onChange={onChange}
              onBlur={onBlur}
              options={QUOTATION_CURRENCIES}
              disabled={isLoading}
            />

            <Input
              id="quotation-valid-until"
              name="valid_until"
              type="date"
              label="Válida hasta"
              value={values.valid_until ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.valid_until}
              disabled={isLoading}
              hint="Opcional. Tras esta fecha la cotización se marca como vencida."
            />

            <Input
              id="quotation-payment-terms"
              name="payment_terms"
              label="Condiciones de pago"
              placeholder="Ej. 30 días después de la firma"
              value={values.payment_terms ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isLoading}
              className="sm:col-span-2"
            />

            <Textarea
              id="quotation-notes"
              name="notes"
              label="Notas y condiciones"
              placeholder="Alcance, exclusiones o condiciones generales de la propuesta…"
              value={values.notes ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isLoading}
              rows={4}
              maxLength={1000}
              className="sm:col-span-2"
            />
          </div>
        </section>

        {/* Líneas */}
        <section className="border-t border-[#F1F4F9] pt-5">
          <QuotationItemsEditor
            items={values.items ?? []}
            itemErrors={errors.item_errors ?? []}
            currency={values.currency ?? "USD"}
            onItemChange={onItemChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            isLoading={isLoading}
          />

          {errors.items ? (
            <p className="mt-2 text-[12px] font-medium text-[#D92D20]">{errors.items}</p>
          ) : null}
        </section>
      </div>

      {/* Totales */}
      <div className="xl:sticky xl:top-24">
        <QuotationTotalsPanel
          totals={totals}
          currency={values.currency ?? "USD"}
          isCalculating={isCalculating}
          onCalculate={onCalculate}
        />

        {!isEditing ? (
          <p className="mt-3 text-[11.5px] leading-5 text-[#94A3B8]">
            La cotización se guarda en estado <strong className="text-[#64748B]">borrador</strong>.
            Podrás enviarla al cliente cuando esté lista.
          </p>
        ) : null}
      </div>
    </div>
  );
}
