"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CircleCheckBig,
  History,
  Minus,
  ReceiptText,
  RotateCcw,
  Search,
  WalletCards,
} from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Skeleton,
} from "@/components/ui";

import { PERIOD_STATUS_LIST } from "../constants";
import { useFinancialPeriods } from "../hooks/useFinancialPeriods";
import { formatMoney, formatPercent, formatWeekRange } from "../utils/format";
import FinanceKpiCard from "./FinanceKpiCard";
import { PeriodStatusBadge } from "./FinanceBadges";

const PERIOD_STATUS_OPTIONS = PERIOD_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

const COMPARISON_ROWS = [
  { key: "income", label: "Ingresos" },
  { key: "expense", label: "Egresos" },
  { key: "balance", label: "Balance" },
];

function getVariationTone(value) {
  if (Number(value) > 0) return "text-[#0A6B3D]";
  if (Number(value) < 0) return "text-[#B42318]";
  return "text-[#64748B]";
}

function PeriodsSkeletonRows() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="border-t border-[#F1F4F9]">
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[190px]" />
        <Skeleton className="mt-2 h-3 w-[90px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[78px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[100px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[70px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[80px]" />
      </td>
    </tr>
  ));
}

/**
 * Resumen financiero de los períodos semanales y comparación entre semanas.
 */
export default function FinancePeriodsView() {
  const router = useRouter();

  const {
    periods,
    stats,
    total,
    filters,
    status,
    error,
    isLoading,
    isEmpty,
    comparison,
    updateFilter,
    resetFilters,
  } = useFinancialPeriods();

  const kpis = [
    {
      label: "Ingresos acumulados",
      value: formatMoney(stats?.income ?? 0),
      icon: Banknote,
      tone: "bg-[#F0FBF4] text-[#0A6B3D]",
      hint: "Suma de ingresos registrados en las semanas.",
    },
    {
      label: "Egresos acumulados",
      value: formatMoney(stats?.expense ?? 0),
      icon: ReceiptText,
      tone: "bg-[#FEF4F4] text-[#B42318]",
      hint: "Suma de egresos registrados en las semanas.",
    },
    {
      label: "Períodos abiertos",
      value: stats?.open ?? 0,
      icon: WalletCards,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
      hint: "Semanas que todavía admiten movimientos.",
    },
    {
      label: "Períodos cerrados",
      value: stats?.closed ?? 0,
      icon: CircleCheckBig,
      tone: "bg-[#F1F5F9] text-[#475569]",
      hint: "Semanas con conteo de caja confirmado.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Períodos semanales"
        description="Cada semana corre de lunes a domingo y reinicia sus acumuladores en cero, mientras el saldo acumulado y el historial permanecen disponibles."
        actions={
          <Button variant="outline" onClick={() => router.push("/financials/closures")}>
            <History className="h-4 w-4" aria-hidden="true" />
            Ver historial de cierres
          </Button>
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

      <Card>
        <CardHeader
          title="Filtros"
          description="Encuentra períodos por estado o por semana y fecha."
          action={
            <span className="text-[12px] font-medium text-[#94A3B8]">
              {isLoading ? "Cargando…" : `${total} períodos`}
            </span>
          }
        />
        <CardBody className="pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <Select
              id="period-status-filter"
              name="status"
              label="Estado"
              value={filters.status}
              onChange={(event) => updateFilter({ status: event.target.value })}
              options={PERIOD_STATUS_OPTIONS}
              placeholder="Todos los estados"
              className="lg:w-[210px]"
            />

            <Input
              id="period-search"
              name="search"
              label="Búsqueda"
              type="search"
              icon={Search}
              value={filters.search}
              onChange={(event) => updateFilter({ search: event.target.value })}
              placeholder="Busca por semana o fecha"
              className="lg:w-[340px]"
            />

            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={status === "loading" && !filters.status && !filters.search}
              className="lg:ml-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          </div>
        </CardBody>
      </Card>

      {comparison ? (
        <Card>
          <CardHeader
            title="Comparación de períodos"
            description="Compara los ingresos, egresos y balance de las dos semanas consecutivas."
          />
          <CardBody className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="bg-[#FAFBFD] text-left">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Métrica
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Período anterior
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Período actual
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Variación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => {
                    const variation = Number(comparison.variation?.[row.key] ?? 0);
                    const VariationIcon =
                      variation > 0 ? ArrowUpRight : variation < 0 ? ArrowDownRight : Minus;

                    return (
                      <tr key={row.key} className="border-t border-[#F1F4F9]">
                        <td className="px-4 py-4 text-[13px] font-semibold text-[#334155]">
                          {row.label}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-[13px] font-semibold tabular-nums text-[#334155]">
                            {formatMoney(comparison.previous?.[row.key] ?? 0)}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">
                            Semana {comparison.previous?.number ?? "—"} ·{" "}
                            {formatWeekRange(
                              comparison.previous?.start_date,
                              comparison.previous?.end_date,
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-[13px] font-semibold tabular-nums text-[#0B1220]">
                            {formatMoney(comparison.current?.[row.key] ?? 0)}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">
                            Semana {comparison.current?.number ?? "—"} ·{" "}
                            {formatWeekRange(
                              comparison.current?.start_date,
                              comparison.current?.end_date,
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-[13px] font-bold tabular-nums ${getVariationTone(
                              variation,
                            )}`}
                          >
                            <VariationIcon className="h-4 w-4" aria-hidden="true" />
                            {variation > 0 ? "+" : ""}
                            {formatPercent(variation, 1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {isEmpty ? (
        <EmptyState
          icon={CalendarDays}
          title="No hay períodos que coincidan"
          description="Prueba a cambiar el estado o la búsqueda para ver otros períodos semanales."
          action={
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader
            title="Períodos semanales"
            description="Acumuladores de cada semana y acceso a movimientos y cierres."
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="bg-[#FAFBFD] text-left">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Semana
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Ingresos
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Egresos
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Balance
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Movimientos
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Cierre
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <PeriodsSkeletonRows />
                  ) : (
                    periods.map((period) => {
                      const balance = Number(period.balance ?? 0);

                      return (
                        <tr
                          key={period.id}
                          className="group cursor-pointer border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
                          onClick={() => router.push(`/financials/periods/${period.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              router.push(`/financials/periods/${period.id}`);
                            }
                          }}
                          tabIndex={0}
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/financials/periods/${period.id}`}
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                              className="block text-[13.5px] font-semibold text-[#0B1220] transition hover:text-[#2E6BFF]"
                            >
                              {formatWeekRange(period.start_date, period.end_date)}
                            </Link>
                            <p className="mt-0.5 text-[11.5px] font-medium text-[#94A3B8]">
                              Semana {period.number}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <PeriodStatusBadge status={period.status} />
                          </td>
                          <td className="px-5 py-4 text-right text-[13.5px] font-semibold tabular-nums text-[#0A6B3D]">
                            {formatMoney(period.income ?? 0)}
                          </td>
                          <td className="px-5 py-4 text-right text-[13.5px] font-semibold tabular-nums text-[#B42318]">
                            {formatMoney(period.expense ?? 0)}
                          </td>
                          <td
                            className={`px-5 py-4 text-right text-[13.5px] font-semibold tabular-nums ${
                              balance >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"
                            }`}
                          >
                            {formatMoney(balance)}
                          </td>
                          <td className="px-5 py-4 text-right text-[13px] font-medium tabular-nums text-[#475569]">
                            {period.movement_count ?? 0}
                          </td>
                          <td className="px-5 py-4">
                            {period.closure ? (
                              <Link
                                href={`/financials/closures/${period.closure.id}`}
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                                className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
                              >
                                Ver cierre
                              </Link>
                            ) : (
                              <span className="text-[13px] text-[#A3AFC2]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
