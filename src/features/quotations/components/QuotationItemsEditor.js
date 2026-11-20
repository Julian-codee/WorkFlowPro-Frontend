"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui";

import { QUOTATION_TAX_RATES, calculateLineTotal } from "../constants";
import { formatAmount } from "../utils/format";

/**
 * Editor de líneas de la cotización (usable en alta y edición).
 *
 * Las líneas se controlan desde `useQuotationForm`; aquí solo se pintan.
 */
export default function QuotationItemsEditor({
  items = [],
  itemErrors = [],
  currency = "USD",
  onItemChange,
  onAddItem,
  onRemoveItem,
  isLoading = false,
}) {
  const inputClass =
    "h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-[12.5px] text-[#0B1220] outline-none transition focus:border-[#2E6BFF] focus:ring-4 focus:ring-[#2E6BFF]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5F9]";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-semibold text-[#334155]">Líneas de la cotización</p>
          <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">
            Añade los conceptos con su cantidad, precio e impuesto.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onAddItem} disabled={isLoading}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Añadir línea
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E6EBF3] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-[#FAFBFD] text-left">
                <th className="px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Concepto
                </th>
                <th className="w-[92px] px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Cantidad
                </th>
                <th className="w-[132px] px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Precio unit.
                </th>
                <th className="w-[104px] px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Desc. %
                </th>
                <th className="w-[150px] px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Impuesto
                </th>
                <th className="w-[118px] px-3 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Total
                </th>
                <th className="w-[44px] px-2 py-2.5" />
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const lineTotal = calculateLineTotal(item);
                const errors = itemErrors[index] ?? {};

                return (
                  <tr key={item.id ?? index} className="border-t border-[#F1F4F9] align-middle">
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={item.description ?? ""}
                        onChange={(event) => onItemChange?.(item.id, "description", event.target.value)}
                        disabled={isLoading}
                        placeholder="Ej. Licencia WorkFlowPro Premium"
                        aria-label="Concepto"
                        aria-invalid={Boolean(errors.description)}
                        className={`${inputClass} ${
                          errors.description ? "border-[#E5484D] focus:border-[#E5484D]" : ""
                        }`}
                      />
                      {errors.description ? (
                        <p className="mt-1 text-[11px] font-medium text-[#D92D20]">
                          {errors.description}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity ?? 1}
                        onChange={(event) => onItemChange?.(item.id, "quantity", event.target.value)}
                        disabled={isLoading}
                        aria-label="Cantidad"
                        aria-invalid={Boolean(errors.quantity)}
                        className={`${inputClass} tabular-nums ${
                          errors.quantity ? "border-[#E5484D] focus:border-[#E5484D]" : ""
                        }`}
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price ?? 0}
                        onChange={(event) => onItemChange?.(item.id, "unit_price", event.target.value)}
                        disabled={isLoading}
                        aria-label="Precio unitario"
                        aria-invalid={Boolean(errors.unit_price)}
                        className={`${inputClass} tabular-nums ${
                          errors.unit_price ? "border-[#E5484D] focus:border-[#E5484D]" : ""
                        }`}
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={item.discount ?? 0}
                        onChange={(event) => onItemChange?.(item.id, "discount", event.target.value)}
                        disabled={isLoading}
                        aria-label="Descuento"
                        aria-invalid={Boolean(errors.discount)}
                        className={`${inputClass} tabular-nums ${
                          errors.discount ? "border-[#E5484D] focus:border-[#E5484D]" : ""
                        }`}
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <select
                        value={String(item.tax_rate ?? 0)}
                        onChange={(event) => onItemChange?.(item.id, "tax_rate", event.target.value)}
                        disabled={isLoading}
                        aria-label="Impuesto"
                        aria-invalid={Boolean(errors.tax_rate)}
                        className={`${inputClass} appearance-none ${
                          errors.tax_rate ? "border-[#E5484D] focus:border-[#E5484D]" : ""
                        }`}
                      >
                        {QUOTATION_TAX_RATES.map((rate) => (
                          <option key={rate.value} value={rate.value}>
                            {rate.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[13px] font-semibold tabular-nums text-[#0B1220]">
                        {formatAmount(lineTotal.total)} {currency}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        disabled={isLoading}
                        aria-label="Eliminar línea"
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#FEF4F4] hover:text-[#B42318] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
