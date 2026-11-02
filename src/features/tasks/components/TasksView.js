"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ListTodo, Plus } from "lucide-react";

import { Alert, Button, Card, CardBody, EmptyState, PageHeader } from "@/components/ui";
import { TaskFilters, TaskList } from "@/features/tasks/components";
import { useTasks } from "@/features/tasks/hooks/useTasks";

/**
 * Listado de tareas con búsqueda, filtros y paginación.
 */
export default function TasksView() {
  const router = useRouter();

  const {
    tasks,
    total,
    filters,
    status,
    error,
    isLoading,
    isEmpty,
    totalPages,
    updateFilter,
    resetFilters,
    setPage,
  } = useTasks();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestión"
        title="Tareas"
        description="Todas las tareas del espacio de trabajo: revisa estados, prioridades y vencimientos."
        actions={
          <Button variant="brand" onClick={() => router.push("/tasks/new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva tarea
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardBody>
          <TaskFilters
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            resultCount={isLoading ? undefined : total}
          />
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={ListTodo}
          title="No hay tareas que coincidan"
          description="Prueba a cambiar los filtros o crea una nueva tarea para empezar a avanzar."
          action={
            <Button variant="brand" onClick={() => router.push("/tasks/new")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear tarea
            </Button>
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
