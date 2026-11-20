"use client";

import { ListFilter, RotateCcw, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../constants";

const SORT_OPTIONS = [
  { value: "created_at", label: "Más recientes" },
  { value: "due_date", label: "Fecha de vencimiento" },
  { value: "priority", label: "Prioridad" },
  { value: "pending_balance", label: "Saldo pendiente" },
];

/** Filtros del listado de tareas: búsqueda, estado, prioridad, orden y limpieza. */
export default function TaskFilters({ filters, onChange, onReset, resultCount }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_190px]">
        <Input
          id="task-search"
          name="search"
          label="Buscar"
          icon={Search}
          placeholder="Busca por título o descripción"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          className="lg:w-full"
          inputClassName="h-10"
        />

        <Select
          id="task-status-filter"
          name="status"
          label="Estado"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          options={TASK_STATUS_OPTIONS}
          placeholder="Todos los estados"
        />

        <Select
          id="task-priority-filter"
          name="priority"
          label="Prioridad"
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value })}
          options={TASK_PRIORITY_OPTIONS}
          placeholder="Todas las prioridades"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EEF1F6] pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 sm:w-[440px]">
          <Select
            id="task-sort-filter"
            name="sortBy"
            label="Ordenar por"
            value={filters.sortBy}
            onChange={(event) => onChange({ sortBy: event.target.value })}
            options={SORT_OPTIONS}
          />

          <Select
            id="task-sort-order-filter"
            name="sortOrder"
            label="Dirección"
            value={filters.sortOrder}
            onChange={(event) => onChange({ sortOrder: event.target.value })}
            options={[
              { value: "desc", label: "Descendente" },
              { value: "asc", label: "Ascendente" },
            ]}
          />
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          {typeof resultCount === "number" ? (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#64748B]">
              <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
              {resultCount} {resultCount === 1 ? "tarea" : "tareas"}
            </span>
          ) : null}

          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}
