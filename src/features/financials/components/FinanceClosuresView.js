"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  CircleAlert,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
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

import { CLOSURE_STATUS_LIST } from "../constants";
import { useFinancialClosures } from "../hooks/useFinancialClosures";
import { formatMoney, formatWeekRange } from "../utils/format";
import { ClosureStatusBadge } from "./FinanceBadges";
import FinanceKpiCard from "./FinanceKpiCard";

const CLOSURE_STATUS_OPTIONS = CLOSURE_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

function getDifferenceTone(value) {
  if (Number(value) > 0) return "text-[#0A6B3D]";
  if (Number(value) < 0) return "text-[#B42318]";
  return "text-[#64748B]";
}

function formatDifference(value) {
  const amount = Number(value ?? 0);
  const prefix = amount > 0 ? "+" : amount < 0 ? "−" : "";

  return `${prefix}${formatMoney(Math.abs(amount))}`;
}

function ClosuresSkeletonRows() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="border-t border-[#F1F4F9]">
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[190px]" />
        <Skeleton className="mt-2 h-3 w-[90px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[88px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[90px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[130px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[50px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[40px]" />
      </td>
    </tr>
  ));
}

/**
 * Historial de cierres de caja con filtros, totales y diferencias.
 */
export default function FinanceClosuresView() {
  const router = useRouter();

  const {
    closures,
    stats,
    totals,
    total,
    filters,
    error,
    isLoading,
    isEmpty,
    updateFilter,
    resetFilters,
  } = useFinancialClosures();

  const accumulatedDifference = Number(totals?.difference ?? 0);

  const kpis = [
    {
      label: "Cierres totales",
      value: stats?.total ?? 0,
      icon: WalletCards,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
      hint: "Cierres incluidos en el filtro actual.",
    },
    {
      label: "Con diferencia",
      value: stats?.withDifference ?? 0,
      icon: CircleAlert,
      tone: "bg-[#FEF8EC] text-[#96590A]",
      hint: "Cierres con faltante o sobrante de caja.",
    },
    {
      label: "Ajustes pendientes",
      value: stats?.pendingAdjustments ?? 0,
      icon: SlidersHorizontal,
      tone: "bg-[#FEF4F4] text-[#B42318]",
      hint: "Ajustes que todavía requieren resolución.",
    },
    {
      label: "Diferencia acumulada",
      value: (
        <span className={getDifferenceTone(accumulatedDifference)}>
          {formatDifference(accumulatedDifference)}
        </span>
      ),
      icon: Scale,
      tone: "bg-[#F1F5F9] text-[#475569]",
      hint: "Suma de las diferencias del filtro actual.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Historial de cierres"
        description="Cierres de caja semanales con ingresos, egresos, saldos, diferencias, responsables y ajustes."
        actions={
          <Button variant="outline" onClick={() => router.push("/financials/periods")}>
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Ir a períodos
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
          description="Selecciona el estado, el rango de fechas o busca por responsable y semana."
          action={
            <span className="text-[12px] font-medium text-[#94A3B8]">
              {isLoading ? "Cargando…" : `${total} cierres`}
            </span>
          }
        />
        <CardBody className="pt-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <Select
              id="closure-status-filter"
              name="status"
              label="Estado"
              value={filters.status}
              onChange={(event) => updateFilter({ status: event.target.value })}
              options={CLOSURE_STATUS_OPTIONS}
              placeholder="Todos los estados"
              className="xl:w-[200px]"
            />

            <Input
              id="closure-from"
              name="from"
              label="Desde"
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter({ from: event.target.value })}
              className="xl:w-[180px]"
            />

            <Input
              id="closure-to"
              name="to"
              label="Hasta"
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter({ to: event.target.value })}
              className="xl:w-[180px]"
            />

            <Input
              id="closure-search"
              name="search"
              label="Búsqueda"
              type="search"
              icon={Search}
              value={filters.search}
              onChange={(event) => updateFilter({ search: event.target.value })}
              placeholder="Busca por responsable o semana"
              className="xl:w-[300px]"
            />

            <Button variant="outline" onClick={resetFilters} className="xl:ml-auto">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          </div>
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={Banknote}
          title="No hay cierres que coincidan"
          description="Prueba a cambiar el estado, las fechas o la búsqueda para consultar otros cierres."
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
            title="Cierres de caja"
            description="Detalle semanal de saldos, diferencias y responsables."
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] border-collapse">
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
                      Saldo esperado
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Saldo real
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Diferencia
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Responsable
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Ajustes
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <ClosuresSkeletonRows />
                  ) : (
                    closures.map((closure) => {
                      const adjustmentCount = closure.adjustments?.length ?? 0;

                      return (
                        <tr
                          key={closure.id}
                          className="border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
                        >
                          <td className="px-5 py-4">
                            <p className="text-[13.5px] font-semibold text-[#0B1220]">
                              {formatWeekRange(closure.start_date, closure.end_date)}
                            </p>
                            <p className="mt-0.5 text-[11.5px] font-medium text-[#94A3B8]">
                              Semana {closure.number}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <ClosureStatusBadge status={closure.status} />
                          </td>
                          <td className="px-5 py-4 text-right text-[13px] font-semibold tabular-nums text-[#0A6B3D]">
                            {formatMoney(closure.total_income ?? 0)}
                          </td>
                          <td className="px-5 py-4 text-right text-[13px] font-semibold tabular-nums text-[#B42318]">
                            {formatMoney(closure.total_expense ?? 0)}
                          </td>
                          <td className="px-5 py-4 text-right text-[13px] font-semibold tabular-nums text-[#0B1220]">
                            {formatMoney(closure.expected_cash ?? 0)}
                          </td>
                          <td className="px-5 py-4 text-right text-[13px] font-semibold tabular-nums text-[#0B1220]">
                            {formatMoney(closure.actual_cash ?? 0)}
                          </td>
                          <td
                            className={`px-5 py-4 text-right text-[13px] font-bold tabular-nums ${getDifferenceTone(
                              closure.difference ?? 0,
                            )}`}
                          >
                            {formatDifference(closure.difference ?? 0)}
                          </td>
                          <td className="px-5 py-4 text-[12.5px] font-medium text-[#475569]">
                            {closure.responsible ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-right text-[13px] font-semibold tabular-nums text-[#475569]">
                            {adjustmentCount > 0 ? adjustmentCount : "—"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/financials/closures/${closure.id}`}
                              className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
                            >
                              Ver
                            </Link>
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
