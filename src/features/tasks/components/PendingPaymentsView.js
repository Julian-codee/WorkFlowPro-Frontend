"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleDollarSign, ListTodo, Plus } from "lucide-react";

import { Alert, Button, Card, CardBody, EmptyState, PageHeader } from "@/components/ui";

import { usePendingPayments } from "../hooks/usePendingPayments";
import PendingPaymentsDashboard from "./PendingPaymentsDashboard";
import PendingPaymentsFilters from "./PendingPaymentsFilters";
import TaskList from "./TaskList";

/** Vista de tareas con saldo pendiente, incluidos trabajos finalizados. */
export default function PendingPaymentsView() {
  const router = useRouter();
  const {
    tasks,
    total,
    totalPages,
    stats,
    filters,
    status,
    error,
    isLoading,
    isEmpty,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setPage,
  } = usePendingPayments();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tareas"
        title="Pagos pendientes"
        description="Controla la deuda de trabajos activos y finalizados. Finalizar una tarea no cancela su saldo pendiente."
        actions={
          <Button variant="brand" onClick={() => router.push("/tasks/new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva tarea
          </Button>
        }
      />

      <PendingPaymentsDashboard stats={stats} isLoading={isLoading} />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardBody>
          <PendingPaymentsFilters
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            resultCount={isLoading ? undefined : total}
            hasActiveFilters={hasActiveFilters}
          />
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={hasActiveFilters ? ListTodo : CircleDollarSign}
          title={
            hasActiveFilters
              ? "No hay pagos pendientes que coincidan"
              : "No hay pagos pendientes"
          }
          description={
            hasActiveFilters
              ? "Prueba a cambiar o limpiar los filtros para consultar otros resultados."
              : "Las tareas con precio pendiente aparecerán aquí, sin importar su estado operativo."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button variant="brand" onClick={() => router.push("/tasks/new")}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Crear tarea
              </Button>
            )
          }
        />
      ) : (
        <>
          <TaskList tasks={tasks} isLoading={isLoading} />

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
