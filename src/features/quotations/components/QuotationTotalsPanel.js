"use client";

import { Calculator, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui";

import { formatAmount } from "../utils/format";

/**
 * Panel de totales de la cotización.
 *
 * En el formulario muestra la vista previa calculada por
 * `POST /quotations/calculate`; en el detalle muestra los totales guardados.
 */
export default function QuotationTotalsPanel({
  totals = null,
  currency = "USD",
  isCalculating = false,
  onCalculate,
  className = "",
}) {
  const subtotal = totals?.subtotal ?? 0;
  const discountTotal = totals?.discount_total ?? 0;
  const taxTotal = totals?.tax_total ?? 0;
  const total = totals?.total ?? 0;

  const rows = [
    { label: "Subtotal", value: subtotal, muted: true },
    { label: "Descuento", value: -discountTotal, muted: true },
    { label: "Impuestos", value: taxTotal, muted: true },
  ];

  return (
    <div className={`rounded-2xl border border-[#E6EBF3] bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#0B1220]">Totales</p>

        {onCalculate ? (
          <Button
            variant="outline"
            size="sm"
            loading={isCalculating}
            onClick={onCalculate}
            disabled={isCalculating}
          >
            {!isCalculating ? (
              <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            ) : null}
            Calcular
          </Button>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-[#64748B]">{row.label}</dt>
            <dd className="text-[13px] tabular-nums text-[#334155]">
              {row.value < 0 ? "−" : ""}
              {formatAmount(Math.abs(row.value))} {currency}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#F1F4F9] pt-4">
        <p className="text-[13px] font-semibold text-[#0B1220]">Total</p>
        <p className="text-[22px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[#0B1220]">
          {formatAmount(total)}{" "}
          <span className="text-[13px] font-semibold text-[#64748B]">{currency}</span>
        </p>
      </div>

      {isCalculating ? (
        <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[#94A3B8]">
          <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
          Calculando con el backend…
        </p>
      ) : null}
    </div>
  );
}
