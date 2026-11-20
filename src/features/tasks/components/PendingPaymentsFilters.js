"use client";

import { ListFilter, RotateCcw, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";

import { TASK_STATUS_OPTIONS } from "../constants";
import { useTaskReferences } from "../hooks/useTaskReferences";

const SCOPE_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Solo no finalizadas" },
  { value: "completed", label: "Solo finalizadas" },
];

const SORT_OPTIONS = [
  { value: "due_date", label: "Vencimiento" },
  { value: "pending_balance", label: "Saldo pendiente" },
  { value: "priority", label: "Prioridad" },
  { value: "created_at", label: "Fecha de creación" },
];

/** Filtros de la vista Pagos pendientes. */
export default function PendingPaymentsFilters({
  filters,
  onChange,
  onReset,
  resultCount,
  hasActiveFilters = false,
}) {
  const { customers, isLoading: areCustomersLoading } = useTaskReferences();
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.full_name || customer.name,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          id="pending-search"
          name="search"
          label="Buscar"
          icon={Search}
          placeholder="Título, descripción o cliente"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          className="xl:col-span-2"
          inputClassName="h-10"
        />

        <Select
          id="pending-customer"
          name="customerId"
          label="Cliente"
          value={filters.customerId}
          onChange={(event) => onChange({ customerId: event.target.value })}
          options={customerOptions}
          placeholder={areCustomersLoading ? "Cargando clientes…" : "Todos los clientes"}
          disabled={areCustomersLoading}
        />

        <Select
          id="pending-scope"
          name="scope"
          label="Alcance"
          value={filters.scope}
          onChange={(event) => onChange({ scope: event.target.value })}
          options={SCOPE_OPTIONS}
        />

        <Select
          id="pending-status"
          name="status"
          label="Estado operativo"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          options={TASK_STATUS_OPTIONS}
          placeholder="Todos los estados"
        />

        <Input
          id="pending-min-balance"
          name="minBalance"
          type="number"
          min="0"
          step="0.01"
          label="Saldo mínimo"
          placeholder="0.00"
          value={filters.minBalance}
          onChange={(event) => onChange({ minBalance: event.target.value })}
          inputClassName="h-10"
        />

        <Input
          id="pending-max-balance"
          name="maxBalance"
          type="number"
          min="0"
          step="0.01"
          label="Saldo máximo"
          placeholder="Sin máximo"
          value={filters.maxBalance}
          onChange={(event) => onChange({ maxBalance: event.target.value })}
          inputClassName="h-10"
        />

        <Input
          id="pending-due-from"
          name="dueFrom"
          type="date"
          label="Vence desde"
          value={filters.dueFrom}
          onChange={(event) => onChange({ dueFrom: event.target.value })}
          inputClassName="h-10"
        />

        <Input
          id="pending-due-to"
          name="dueTo"
          type="date"
          label="Vence hasta"
          value={filters.dueTo}
          onChange={(event) => onChange({ dueTo: event.target.value })}
          inputClassName="h-10"
        />

        <Select
          id="pending-sort"
          name="sortBy"
          label="Ordenar por"
          value={filters.sortBy}
          onChange={(event) => onChange({ sortBy: event.target.value })}
          options={SORT_OPTIONS}
        />

        <Select
          id="pending-sort-order"
          name="sortOrder"
          label="Dirección"
          value={filters.sortOrder}
          onChange={(event) => onChange({ sortOrder: event.target.value })}
          options={[
            { value: "asc", label: "Ascendente" },
            { value: "desc", label: "Descendente" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EEF1F6] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[12.5px] text-[#64748B]">
          <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
          {typeof resultCount === "number"
            ? `${resultCount} ${resultCount === 1 ? "trabajo con deuda" : "trabajos con deuda"}`
            : "Consultando pagos pendientes…"}
          {hasActiveFilters ? (
            <span className="rounded-full bg-[#EFF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#2559E0]">
              Filtros activos
            </span>
          ) : null}
        </div>

        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
