"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Clock3 } from "lucide-react";

import { Badge, Skeleton } from "@/components/ui";

import { getCategoryLabel } from "../constants";
import { formatAmount, formatDate } from "../utils/format";
import { MovementTypeBadge } from "./FinanceBadges";

/**
 * Listado de movimientos: tabla en escritorio y tarjetas en móvil.
 */
export default function FinanceMovementList({
  movements = [],
  accounts = [],
  isLoading = false,
}) {
  const accountName = (accountId) =>
    accounts.find((account) => account.id === accountId)?.name ?? "Cuenta sin asignar";

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Escritorio */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] text-left">
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Movimiento
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Fecha
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Tipo
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Categoría
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Cuenta
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Importe
              </th>
            </tr>
          </thead>

          <tbody>
            {movements.map((movement) => (
              <tr
                key={movement.id}
                className="group border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
              >
                <td className="max-w-[320px] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        movement.type === "income"
                          ? "bg-[#F0FBF4] text-[#12A150]"
                          : "bg-[#FEF4F4] text-[#D92D20]"
                      }`}
                    >
                      {movement.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <Link
                        href={`/financials/movements/${movement.id}`}
                        className="block truncate text-[13.5px] font-semibold text-[#0B1220] transition hover:text-[#2E6BFF]"
                      >
                        {movement.concept}
                      </Link>
                      <p className="mt-0.5 truncate font-mono text-[11.5px] text-[#94A3B8]">
                        {movement.reference}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-[12.5px] text-[#475569]">
                    {formatDate(movement.movement_date)}
                  </p>

                  {movement.origin === "late" ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#96590A]">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      Registro tardío
                    </span>
                  ) : null}
                </td>

                <td className="px-5 py-4">
                  <MovementTypeBadge type={movement.type} />

                  {movement.status === "void" ? (
                    <div className="mt-1">
                      <Badge tone="neutral">Anulado</Badge>
                    </div>
                  ) : movement.status === "reconciled" ? (
                    <div className="mt-1">
                      <Badge tone="success">Conciliado</Badge>
                    </div>
                  ) : null}
                </td>

                <td className="px-5 py-4">
                  <span className="text-[12.5px] text-[#475569]">
                    {getCategoryLabel(movement.category)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="block max-w-[180px] truncate text-[12.5px] text-[#475569]">
                    {accountName(movement.account_id)}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <span
                    className={`text-[13.5px] font-semibold tabular-nums ${
                      movement.type === "income" ? "text-[#0A6B3D]" : "text-[#B42318]"
                    }`}
                  >
                    {movement.type === "income" ? "+" : "−"}
                    {formatAmount(movement.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="grid gap-3 md:hidden">
        {movements.map((movement) => (
          <Link
            key={movement.id}
            href={`/financials/movements/${movement.id}`}
            className="rounded-2xl border border-[#E6EBF3] bg-white p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-[#0B1220]">
                  {movement.concept}
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">
                  {formatDate(movement.movement_date)} · {accountName(movement.account_id)}
                </p>
              </div>

              <span
                className={`shrink-0 text-[13px] font-bold tabular-nums ${
                  movement.type === "income" ? "text-[#0A6B3D]" : "text-[#B42318]"
                }`}
              >
                {movement.type === "income" ? "+" : "−"}
                {formatAmount(movement.amount)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <MovementTypeBadge type={movement.type} />

              <span className="text-[11.5px] text-[#64748B]">
                {getCategoryLabel(movement.category)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
