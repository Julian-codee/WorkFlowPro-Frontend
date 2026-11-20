"use client";

import { ListFilter, RotateCcw, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";

import {
  MOVEMENT_STATUS_OPTIONS,
  MOVEMENT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  getCategoriesForType,
} from "../constants";
import { useFinancialAccounts } from "../hooks/useFinancialAccounts";

/**
 * Filtros del registro de movimientos: búsqueda, tipo, cuenta, categoría,
 * método de pago, estado, rango de fechas y rango de importes.
 */
export default function FinanceMovementFilters({ filters, onChange, onReset, resultCount }) {
  const { accounts } = useFinancialAccounts();

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  const categoryOptions = getCategoriesForType(filters.type).map((category) => ({
    value: category.value,
    label: category.label,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <Input
          id="movement-search"
          name="search"
          label="Buscar"
          icon={Search}
          placeholder="Busca por concepto, referencia o nota"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          className="lg:col-span-2"
        />

        <Select
          id="movement-type-filter"
          name="type"
          label="Tipo"
          value={filters.type}
          onChange={(event) => onChange({ type: event.target.value })}
          options={MOVEMENT_TYPE_OPTIONS}
          placeholder="Ingresos y egresos"
        />

        <Select
          id="movement-account-filter"
          name="accountId"
          label="Cuenta"
          value={filters.accountId}
          onChange={(event) => onChange({ accountId: event.target.value })}
          options={accountOptions}
          placeholder="Todas las cuentas"
        />

        <Select
          id="movement-category-filter"
          name="category"
          label="Categoría"
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
          options={categoryOptions}
          placeholder="Todas las categorías"
        />

        <Select
          id="movement-method-filter"
          name="paymentMethod"
          label="Método de pago"
          value={filters.paymentMethod}
          onChange={(event) => onChange({ paymentMethod: event.target.value })}
          options={PAYMENT_METHOD_OPTIONS}
          placeholder="Todos los métodos"
        />

        <Select
          id="movement-status-filter"
          name="status"
          label="Estado"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          options={MOVEMENT_STATUS_OPTIONS}
          placeholder="Todos los estados"
        />

        <Input
          id="movement-from"
          name="from"
          type="date"
          label="Desde"
          value={filters.from}
          onChange={(event) => onChange({ from: event.target.value })}
        />

        <Input
          id="movement-to"
          name="to"
          type="date"
          label="Hasta"
          value={filters.to}
          onChange={(event) => onChange({ to: event.target.value })}
        />

        <Input
          id="movement-min-amount"
          name="minAmount"
          type="number"
          label="Importe mínimo"
          placeholder="0.00"
          value={filters.minAmount}
          onChange={(event) => onChange({ minAmount: event.target.value })}
        />

        <Input
          id="movement-max-amount"
          name="maxAmount"
          type="number"
          label="Importe máximo"
          placeholder="Sin límite"
          value={filters.maxAmount}
          onChange={(event) => onChange({ maxAmount: event.target.value })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-3">
        {typeof resultCount === "number" ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#64748B]">
            <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
            {resultCount} {resultCount === 1 ? "movimiento" : "movimientos"}
          </span>
        ) : (
          <span />
        )}

        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
