"use client";

import Link from "next/link";
import { Building2, Mail, MapPin, Phone, UserRound } from "lucide-react";

import { Avatar, Skeleton } from "@/components/ui";

import { getCustomerDisplayName, getCustomerInitials } from "../constants";
import { formatRelative } from "../utils/format";
import { CustomerStatusBadge, CustomerTypeBadge } from "./CustomerBadges";

function CustomerSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="border-t border-[#F1F4F9]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" rounded="rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-[190px]" />
            <Skeleton className="mt-2 h-3 w-[120px]" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[76px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[84px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[180px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
    </tr>
  ));
}

function CustomerSkeletonCards() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-2xl border border-[#E6EBF3] bg-white p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" rounded="rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="mt-2 h-3 w-[45%]" />
        </div>
      </div>
      <Skeleton className="mt-4 h-5 w-[90px] rounded-full" rounded="rounded-full" />
    </div>
  ));
}

/**
 * Listado de clientes.
 *
 * Tabla en escritorio y tarjetas en móvil, con la misma información.
 */
export default function CustomerList({ customers = [], isLoading = false }) {
  if (isLoading) {
    return (
      <>
        <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
          <table className="w-full border-collapse">
            <tbody>
              <CustomerSkeletonRows />
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          <CustomerSkeletonCards />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Escritorio */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] text-left">
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Cliente
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Tipo
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Estado
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Contacto
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Ubicación
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Actualizado
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="group border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
              >
                <td className="max-w-[320px] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={getCustomerDisplayName(customer)} size="md" />

                    <div className="min-w-0">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="block truncate text-[13.5px] font-semibold text-[#0B1220] transition hover:text-[#2E6BFF]"
                      >
                        {getCustomerDisplayName(customer)}
                      </Link>
                      <p className="mt-0.5 truncate font-mono text-[11.5px] text-[#94A3B8]">
                        {customer.document_number ?? customer.tax_id ?? "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <CustomerTypeBadge type={customer.type} />
                </td>

                <td className="px-5 py-4">
                  <CustomerStatusBadge status={customer.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 truncate text-[12.5px] text-[#475569]">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                      {customer.email ?? "—"}
                    </p>
                    {customer.phone ? (
                      <p className="mt-0.5 inline-flex items-center gap-1.5 truncate text-[12px] text-[#94A3B8]">
                        <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {customer.phone}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#475569]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                    {customer.city ?? "—"}
                  </span>
                </td>

                <td className="px-5 py-4 text-right text-[12.5px] text-[#94A3B8]">
                  {formatRelative(customer.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="grid gap-3 md:hidden">
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="rounded-2xl border border-[#E6EBF3] bg-white p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <Avatar name={getCustomerDisplayName(customer)} size="lg" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold leading-snug text-[#0B1220]">
                  {getCustomerDisplayName(customer)}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-[#94A3B8]">
                  {customer.email ?? "Sin correo registrado"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CustomerTypeBadge type={customer.type} />
              <CustomerStatusBadge status={customer.status} />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                {customer.type === "legal" ? (
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {customer.document_number ?? customer.tax_id ?? "—"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {customer.city ?? "—"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
