"use client";

import { ListFilter, RotateCcw, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../constants";

/**
 * Filtros del listado de tareas: búsqueda, estado, prioridad y limpieza.
 */
export default function TaskFilters({ filters, onChange, onReset, resultCount }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <Input
        id="task-search"
        name="search"
        label="Buscar"
        icon={Search}
        placeholder="Busca por título, proyecto o responsable"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        className="lg:w-[320px]"
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
        className="lg:w-[190px]"
      />

      <Select
        id="task-priority-filter"
        name="priority"
        label="Prioridad"
        value={filters.priority}
        onChange={(event) => onChange({ priority: event.target.value })}
        options={TASK_PRIORITY_OPTIONS}
        placeholder="Todas las prioridades"
        className="lg:w-[190px]"
      />

      <div className="flex items-center gap-2 lg:ml-auto">
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
  );
}
