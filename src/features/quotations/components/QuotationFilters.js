"use client";

import { ListFilter, RotateCcw, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";

import { QUOTATION_STATUS_OPTIONS, QUOTATION_TYPE_OPTIONS } from "../constants";

/**
 * Filtros del listado de cotizaciones: búsqueda, estado, tipo y limpieza.
 */
export default function QuotationFilters({ filters, onChange, onReset, resultCount }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <Input
        id="quotation-search"
        name="search"
        label="Buscar"
        icon={Search}
        placeholder="Busca por número, concepto o cliente"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        className="lg:w-[320px]"
        inputClassName="h-10"
      />

      <Select
        id="quotation-status-filter"
        name="status"
        label="Estado"
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        options={QUOTATION_STATUS_OPTIONS}
        placeholder="Todos los estados"
        className="lg:w-[190px]"
      />

      <Select
        id="quotation-type-filter"
        name="type"
        label="Tipo"
        value={filters.type}
        onChange={(event) => onChange({ type: event.target.value })}
        options={QUOTATION_TYPE_OPTIONS}
        placeholder="Todos los tipos"
        className="lg:w-[190px]"
      />

      <div className="flex items-center gap-2 lg:ml-auto">
        {typeof resultCount === "number" ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#64748B]">
            <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
            {resultCount} {resultCount === 1 ? "cotización" : "cotizaciones"}
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
