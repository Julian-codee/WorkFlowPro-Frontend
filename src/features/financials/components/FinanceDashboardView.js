"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  CircleDollarSign,
  Landmark,
  Plus,
  ReceiptText,
  Scale,
  Wallet,
} from "lucide-react";

import { Alert, Button, Card, CardBody, CardHeader, PageHeader, Skeleton } from "@/components/ui";

import { useFinancialOverview } from "../hooks/useFinancialOverview";
import { formatAmount, formatDate, formatMoney, formatWeekRange } from "../utils/format";
import FinanceKpiCard from "./FinanceKpiCard";
import { AccountTypeBadge, MovementTypeBadge } from "./FinanceBadges";

/**
 * Dashboard financiero: indicadores, resumen semanal, último cierre y saldos.
 *
 * Consume (composición, no es un endpoint propio):
 *   GET /financial/movements
 *   GET /financial/periods
 *   GET /financial/closures-history
 */
export default function FinanceDashboardView() {
  const router = useRouter();
  const { overview, error, isLoading } = useFinancialOverview();

  const month = overview?.month;
  const week = overview?.week;
  const totals = overview?.totals;

  const kpis = [
    {
      label: "Ingresos del mes",
      value: formatMoney(month?.income ?? 0),
      icon: ArrowUpRight,
      tone: "bg-[#F0FBF4] text-[#12A150]",
      hint: `${month?.count ?? 0} movimientos registrados`,
    },
    {
      label: "Egresos del mes",
      value: formatMoney(month?.expense ?? 0),
      icon: ArrowDownRight,
      tone: "bg-[#FEF4F4] text-[#D92D20]",
      hint: "Gastos pagados del mes en curso",
    },
    {
      label: "Flujo neto del mes",
      value: formatMoney(month?.balance ?? 0),
      icon: Scale,
      tone: (month?.balance ?? 0) >= 0 ? "bg-[#EFF4FF] text-[#2E6BFF]" : "bg-[#FEF4F4] text-[#D92D20]",
      hint: "Ingresos menos egresos",
    },
    {
      label: "Saldo disponible",
      value: formatMoney(totals?.available_balance ?? 0),
      icon: Wallet,
      tone: "bg-[#F7F4FF] text-[#6941C6]",
      hint: `Efectivo en caja: ${formatMoney(totals?.cash_balance ?? 0)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Dashboard financiero"
        description="Ingresos, egresos, flujo neto y saldo disponible de tu operación."
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/financials/calendar")}>
              <CalendarRange className="h-4 w-4" aria-hidden="true" />
              Calendario
            </Button>

            <Button variant="brand" onClick={() => router.push("/financials/movements/new")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Registrar movimiento
            </Button>
          </>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <FinanceKpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              hint={kpi.hint}
              icon={Icon}
              tone={kpi.tone}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        {/* Resumen semanal */}
        <Card>
          <CardHeader
            title="Resumen de la semana en curso"
            description={
              week
                ? `Semana ${week.number} · ${formatWeekRange(week.start_date, week.end_date)}`
                : "Acumuladores reiniciados cada lunes"
            }
            action={
              overview?.current_period ? (
                <Link
                  href={`/financials/periods/${overview.current_period.id}`}
                  className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
                >
                  Ver semana
                </Link>
              ) : null
            }
          />

          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <WeekStat
                label="Ingresos"
                value={formatMoney(week?.income ?? 0)}
                tone="text-[#0A6B3D]"
                isLoading={isLoading}
              />
              <WeekStat
                label="Egresos"
                value={formatMoney(week?.expense ?? 0)}
                tone="text-[#B42318]"
                isLoading={isLoading}
              />
              <WeekStat
                label="Balance"
                value={formatMoney(week?.balance ?? 0)}
                tone={(week?.balance ?? 0) >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"}
                isLoading={isLoading}
              />
            </div>

            <div className="rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-medium text-[#64748B]">Movimientos de la semana</p>
                <p className="text-[13px] font-semibold tabular-nums text-[#0B1220]">
                  {week?.count ?? 0}
                </p>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2E6BFF] to-[#60A5FA]"
                  style={{
                    width: `${Math.min(100, Math.max(3, ((week?.count ?? 0) / 25) * 100))}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-[11.5px] leading-5 text-[#94A3B8]">
                Cada semana reinicia sus acumuladores en cero, pero conserva los saldos y el
                historial financiero.
              </p>
            </div>

            {overview?.last_weeks?.length ? (
              <div className="overflow-hidden rounded-xl border border-[#E6EBF3]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] text-left">
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Semana
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Ingresos
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Egresos
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {overview.last_weeks.map((weekRow) => (
                      <tr key={weekRow.id} className="border-t border-[#F1F4F9]">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/financials/periods/${weekRow.id}`}
                            className="text-[12.5px] font-medium text-[#0B1220] transition hover:text-[#2E6BFF]"
                          >
                            Semana {weekRow.number}
                          </Link>
                          <p className="text-[11px] text-[#94A3B8]">
                            {formatDate(weekRow.start_date)}
                          </p>
                        </td>

                        <td className="px-4 py-2.5 text-right text-[12.5px] tabular-nums text-[#0A6B3D]">
                          {formatAmount(weekRow.income)}
                        </td>

                        <td className="px-4 py-2.5 text-right text-[12.5px] tabular-nums text-[#B42318]">
                          {formatAmount(weekRow.expense)}
                        </td>

                        <td
                          className={`px-4 py-2.5 text-right text-[12.5px] font-semibold tabular-nums ${
                            weekRow.balance >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"
                          }`}
                        >
                          {formatAmount(weekRow.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardBody>
        </Card>

        {/* Último cierre de caja */}
        <Card>
          <CardHeader
            title="Último cierre de caja"
            description="Conteo de la última semana cerrada."
            action={
              overview?.last_closure ? (
                <Link
                  href={`/financials/closures/${overview.last_closure.id}`}
                  className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
                >
                  Ver cierre
                </Link>
              ) : null
            }
          />

          <CardBody>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : overview?.last_closure ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13.5px] font-semibold text-[#0B1220]">
                    Semana {overview.last_closure.number}
                  </p>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                      overview.last_closure.difference < 0
                        ? "bg-[#FEF4F4] text-[#B42318]"
                        : "bg-[#F0FBF4] text-[#0A6B3D]"
                    }`}
                  >
                    {overview.last_closure.difference < 0 ? "Faltante" : "Sin diferencia"}
                  </span>
                </div>

                <p className="text-[12px] text-[#94A3B8]">
                  {formatWeekRange(overview.last_closure.start_date, overview.last_closure.end_date)}
                </p>

                <dl className="space-y-2.5 rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-4">
                  <ClosureRow label="Saldo esperado" value={overview.last_closure.expected_cash} />
                  <ClosureRow label="Saldo real" value={overview.last_closure.actual_cash} />
                  <ClosureRow
                    label="Diferencia"
                    value={overview.last_closure.difference}
                    signed
                    tone={
                      overview.last_closure.difference < 0 ? "text-[#B42318]" : "text-[#0A6B3D]"
                    }
                  />
                </dl>

                <p className="text-[11.5px] text-[#94A3B8]">
                  Responsable: {overview.last_closure.responsible} · Confirmado el{" "}
                  {formatDate(overview.last_closure.confirmed_at)}
                </p>
              </div>
            ) : (
              <p className="py-6 text-center text-[13px] text-[#94A3B8]">
                Todavía no hay cierres de caja registrados.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr] xl:items-start">
        {/* Saldos por cuenta */}
        <Card>
          <CardHeader
            title="Saldo por cuenta"
            description="Cajas, bancos y billeteras con su saldo actual."
            action={
              <Link
                href="/financials/accounts"
                className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
              >
                Ver cuentas
              </Link>
            }
          />

          <CardBody className="space-y-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))
            ) : (
              overview?.accounts
                ?.filter((account) => account.status === "active")
                .map((account) => (
                  <Link
                    key={account.id}
                    href={`/financials/accounts/${account.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EEF1F6] px-3.5 py-3 transition hover:border-[#D6E2FB] hover:bg-[#FBFCFE]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#94A3B8]">
                        {account.type === "cash" ? (
                          <ReceiptText className="h-4 w-4" aria-hidden="true" />
                        ) : account.type === "bank" ? (
                          <Landmark className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0B1220]">
                          {account.name}
                        </p>
                        <div className="mt-1">
                          <AccountTypeBadge type={account.type} />
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[#0B1220]">
                      {formatMoney(account.balance, account.currency)}
                    </span>
                  </Link>
                ))
            )}
          </CardBody>
        </Card>

        {/* Últimos movimientos */}
        <Card>
          <CardHeader
            title="Últimos movimientos"
            description="Registro por fecha de registro, incluidos los tardíos."
            action={
              <Link
                href="/financials/movements"
                className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
              >
                Ver todos
              </Link>
            }
          />

          <CardBody>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : overview?.recent_movements?.length ? (
              <div className="overflow-hidden rounded-xl border border-[#E6EBF3]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] text-left">
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Movimiento
                      </th>
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Tipo
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Importe
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {overview.recent_movements.map((movement) => (
                      <tr key={movement.id} className="border-t border-[#F1F4F9]">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/financials/movements/${movement.id}`}
                            className="block max-w-[280px] truncate text-[12.5px] font-medium text-[#0B1220] transition hover:text-[#2E6BFF]"
                          >
                            {movement.concept}
                          </Link>
                          <p className="text-[11px] text-[#94A3B8]">
                            {formatDate(movement.movement_date)}
                            {movement.origin === "late" ? " · registro tardío" : ""}
                          </p>
                        </td>

                        <td className="px-4 py-2.5">
                          <MovementTypeBadge type={movement.type} />
                        </td>

                        <td
                          className={`px-4 py-2.5 text-right text-[12.5px] font-semibold tabular-nums ${
                            movement.type === "income" ? "text-[#0A6B3D]" : "text-[#B42318]"
                          }`}
                        >
                          {movement.type === "income" ? "+" : "−"}
                          {formatAmount(movement.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-6 text-center text-[13px] text-[#94A3B8]">
                Todavía no hay movimientos registrados.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/** Indicador compacto del resumen semanal. */
function WeekStat({ label, value, tone, isLoading }) {
  return (
    <div className="rounded-xl border border-[#EEF1F6] bg-white p-3.5">
      <p className="text-[11.5px] font-medium text-[#94A3B8]">{label}</p>

      {isLoading ? (
        <Skeleton className="mt-2 h-5 w-20" />
      ) : (
        <p className={`mt-1 text-[16px] font-bold tabular-nums ${tone}`}>{value}</p>
      )}
    </div>
  );
}

/** Fila del resumen del cierre. */
function ClosureRow({ label, value, signed = false, tone = "text-[#0B1220]" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[12.5px] text-[#64748B]">{label}</dt>
      <dd className={`text-[13px] font-semibold tabular-nums ${tone}`}>
        {signed && Number(value) > 0 ? "+" : ""}
        {formatMoney(value)}
      </dd>
    </div>
  );
}
