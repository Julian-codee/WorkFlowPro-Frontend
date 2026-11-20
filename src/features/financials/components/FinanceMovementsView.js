"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, ReceiptText, Scale } from "lucide-react";

import { Alert, Button, Card, CardBody, EmptyState, PageHeader } from "@/components/ui";

import { useFinancialAccounts } from "../hooks/useFinancialAccounts";
import { useFinancialMovements } from "../hooks/useFinancialMovements";
import { formatMoney } from "../utils/format";
import FinanceMovementFilters from "./FinanceMovementFilters";
import FinanceMovementList from "./FinanceMovementList";

/**
 * Registro de movimientos con filtros, búsqueda, resumen y paginación.
 *
 * Consume `GET /financial/movements`.
 */
export default function FinanceMovementsView() {
  const router = useRouter();

  const {
    movements,
    stats,
    total,
    filters,
    status,
    error,
    isLoading,
    isEmpty,
    hasActiveFilters,
    totalPages,
    updateFilter,
    resetFilters,
    setPage,
  } = useFinancialMovements();

  const { accounts } = useFinancialAccounts();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Movimientos"
        description="Ingresos y egresos registrados: consulta, edita y filtra por fecha, cuenta, categoría o importe."
        actions={
          <Button variant="brand" onClick={() => router.push("/financials/movements/new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo movimiento
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Ingresos filtrados"
          value={formatMoney(stats?.income ?? 0)}
          tone="text-[#0A6B3D]"
          isLoading={isLoading}
        />
        <SummaryCard
          label="Egresos filtrados"
          value={formatMoney(stats?.expense ?? 0)}
          tone="text-[#B42318]"
          isLoading={isLoading}
        />
        <SummaryCard
          label="Balance filtrado"
          value={formatMoney(stats?.balance ?? 0)}
          tone={(stats?.balance ?? 0) >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardBody>
          <FinanceMovementFilters
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            resultCount={isLoading ? undefined : total}
          />
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={ReceiptText}
          title={hasActiveFilters ? "No hay movimientos que coincidan" : "Sin movimientos registrados"}
          description={
            hasActiveFilters
              ? "Prueba a cambiar los filtros o limpia la búsqueda para ver más resultados."
              : "Registra el primer ingreso o egreso para empezar a construir el historial financiero."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button variant="brand" onClick={() => router.push("/financials/movements/new")}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nuevo movimiento
              </Button>
            )
          }
        />
      ) : (
        <>
          <FinanceMovementList movements={movements} accounts={accounts} isLoading={isLoading} />

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12.5px] text-[#64748B]">
                Página {filters.page} de {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1 || status === "loading"}
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages || status === "loading"}
                >
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Tarjeta de resumen de los filtros aplicados. */
function SummaryCard({ label, value, tone, isLoading }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#E6EBF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div>
        <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
        <p className={`mt-1 text-[19px] font-bold leading-none tracking-[-0.02em] tabular-nums ${tone}`}>
          {value}
        </p>
      </div>

      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EFF4FF] text-[#2E6BFF]">
        <Scale className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  );
}
