"use client";

import { ArrowDownRight, ArrowUpRight, CalendarX2, Wallet } from "lucide-react";

import { Badge, Card, CardBody, CardHeader, EmptyState } from "@/components/ui";

import { getCategoryLabel } from "../constants";
import { formatAmount, formatLongDate, formatTime } from "../utils/format";
import { MovementTypeBadge } from "./FinanceBadges";

/**
 * Detalle financiero de un día: movimientos, importes, conceptos, cuentas y
 * métodos de pago de la fecha seleccionada en el calendario.
 */
export default function FinanceDayDetail({ date, movements = [], accounts = [], isLoading = false }) {
  const totals = movements.reduce(
    (acc, movement) => {
      const amount = Number(movement.amount ?? 0);

      if (movement.type === "income") acc.income += amount;
      else acc.expense += amount;

      return acc;
    },
    { income: 0, expense: 0 },
  );

  const balance = totals.income - totals.expense;

  const accountName = (accountId) =>
    accounts.find((account) => account.id === accountId)?.name ?? "Cuenta sin asignar";

  return (
    <Card className="min-w-0">
      <CardHeader
        title={date ? formatLongDate(date) : "Selecciona una fecha"}
        description={
          date
            ? `${movements.length} movimiento${movements.length === 1 ? "" : "s"} · balance ${formatAmount(balance)}`
            : "Toca un día del calendario para ver sus movimientos."
        }
      />

      <CardBody className="min-w-0 space-y-4">
        {date ? (
          <>
            <div className="grid min-w-0 grid-cols-3 gap-2">
              <DayStat
                label="Ingresos"
                value={formatAmount(totals.income)}
                tone="text-[#0A6B3D]"
                icon={ArrowUpRight}
              />
              <DayStat
                label="Egresos"
                value={formatAmount(totals.expense)}
                tone="text-[#B42318]"
                icon={ArrowDownRight}
              />
              <DayStat
                label="Balance"
                value={formatAmount(balance)}
                tone={balance >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"}
                icon={Wallet}
              />
            </div>

            {isLoading ? (
              <p className="py-4 text-center text-[12.5px] text-[#94A3B8]">Cargando movimientos…</p>
            ) : movements.length === 0 ? (
              <EmptyState
                icon={CalendarX2}
                title="Sin movimientos"
                description="No se registraron ingresos ni egresos en esta fecha."
                className="border-none bg-transparent py-8"
              />
            ) : (
              <ul className="min-w-0 space-y-2">
                {movements.map((movement) => (
                  <li
                    key={movement.id}
                    className="min-w-0 rounded-xl border border-[#EEF1F6] bg-white p-3.5 transition hover:border-[#D6E2FB]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0B1220]">
                          {movement.concept}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">
                          {getCategoryLabel(movement.category)}
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

                    <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-2">
                      <MovementTypeBadge type={movement.type} />

                      <Badge tone="neutral" className="max-w-full min-w-0">
                        <Wallet className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{accountName(movement.account_id)}</span>
                      </Badge>

                      <span className="text-[11px] text-[#94A3B8]">
                        {formatTime(movement.registered_at)}
                        {movement.origin === "late" ? " · registro tardío" : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <EmptyState
            icon={CalendarX2}
            title="Ningún día seleccionado"
            description="Elige una fecha en el calendario para revisar sus movimientos, cuentas y métodos de pago."
            className="border-none bg-transparent py-8"
          />
        )}
      </CardBody>
    </Card>
  );
}

/** Indicador compacto del día. */
function DayStat({ label, value, tone, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-3">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
        <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-1 break-words text-[14px] font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
