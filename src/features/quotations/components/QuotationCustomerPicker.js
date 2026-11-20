"use client";

import { useState } from "react";
import { Building2, Check, Search, UserRound, X } from "lucide-react";

import { Alert, Avatar, Badge, Input, Skeleton } from "@/components/ui";
import { getCustomerDisplayName } from "@/features/customers/constants";

import { useQuotationCustomers } from "../hooks/useQuotationCustomers";

/**
 * Selector de cliente para la cotización.
 *
 * Permite filtrar por tipo (natural / jurídica) y buscar por nombre,
 * documento o correo. Al elegir, guarda `customer_id`, nombre, correo y tipo.
 */
export default function QuotationCustomerPicker({ value, onChange, error, type = "" }) {
  const [search, setSearch] = useState("");
  const { customers, error: loadError, isLoading } = useQuotationCustomers({ type, search });

  const handleSelect = (customer) => {
    onChange?.({
      customer_id: customer.id,
      customer_name: getCustomerDisplayName(customer),
      customer_email: customer.email ?? "",
      type: customer.type,
    });
  };

  const handleClear = () => {
    setSearch("");
    onChange?.({ customer_id: "", customer_name: "", customer_email: "", type });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-[#334155]">Cliente de la cotización</p>

        {value?.customer_id ? (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#94A3B8] transition hover:text-[#B42318]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Cambiar
          </button>
        ) : null}
      </div>

      {value?.customer_id ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#D6E2FB] bg-[#F4F7FF] p-3.5">
          <Avatar name={value.customer_name} size="md" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-[#0B1220]">
              {value.customer_name}
            </p>
            <p className="truncate text-[12px] text-[#64748B]">
              {value.customer_email || "Sin correo registrado"}
            </p>
          </div>

          <Badge tone={value.type === "legal" ? "purple" : "info"}>
            {value.type === "legal" ? (
              <Building2 className="h-3 w-3" aria-hidden="true" />
            ) : (
              <UserRound className="h-3 w-3" aria-hidden="true" />
            )}
            {value.type === "legal" ? "Jurídica" : "Natural"}
          </Badge>

          <Check className="h-4 w-4 shrink-0 text-[#2E6BFF]" aria-hidden="true" />
        </div>
      ) : (
        <>
          <Input
            id="quotation-customer-search"
            name="customer_search"
            icon={Search}
            placeholder="Busca por nombre, documento o correo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            error={error}
            inputClassName="h-10"
          />

          {loadError ? <Alert variant="error">{loadError}</Alert> : null}

          <div className="max-h-64 overflow-y-auto rounded-xl border border-[#E6EBF3] bg-white">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12.5px] text-[#94A3B8]">
                No encontramos clientes con ese criterio.
              </p>
            ) : (
              <ul className="divide-y divide-[#F1F4F9]">
                {customers.map((customer) => (
                  <li key={customer.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(customer)}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-[#F7F9FC]"
                    >
                      <Avatar name={getCustomerDisplayName(customer)} size="sm" />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-[#0B1220]">
                          {getCustomerDisplayName(customer)}
                        </span>
                        <span className="block truncate text-[11.5px] text-[#94A3B8]">
                          {customer.email ?? "Sin correo"} · {customer.document_number ?? "—"}
                        </span>
                      </span>

                      <Badge tone={customer.type === "legal" ? "purple" : "info"}>
                        {customer.type === "legal" ? "Jurídica" : "Natural"}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
