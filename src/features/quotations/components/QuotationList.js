"use client";

import Link from "next/link";
import { CalendarDays, FileText, Mail, UserRound } from "lucide-react";

import { Skeleton } from "@/components/ui";

import { formatAmount, formatDate } from "../utils/format";
import { QuotationStatusBadge, QuotationTypeBadge } from "./QuotationBadges";

function QuotationSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="border-t border-[#F1F4F9]">
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[230px]" />
        <Skeleton className="mt-2 h-3 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[88px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[74px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[150px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[100px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[90px]" />
      </td>
    </tr>
  ));
}

function QuotationSkeletonCards() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-2xl border border-[#E6EBF3] bg-white p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-4 w-[75%]" />
      <Skeleton className="mt-3 h-6 w-28" />
    </div>
  ));
}

/**
 * Listado de cotizaciones.
 *
 * Tabla en escritorio y tarjetas en móvil, con la misma información.
 */
export default function QuotationList({ quotations = [], isLoading = false }) {
  if (isLoading) {
    return (
      <>
        <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
          <table className="w-full border-collapse">
            <tbody>
              <QuotationSkeletonRows />
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          <QuotationSkeletonCards />
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
                Cotización
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Estado
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Tipo
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Cliente
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Válida hasta
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {quotations.map((quotation) => (
              <tr
                key={quotation.id}
                className="group border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
              >
                <td className="max-w-[340px] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#94A3B8]">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                      <Link
                        href={`/quotations/${quotation.id}`}
                        className="block truncate text-[13.5px] font-semibold text-[#0B1220] transition hover:text-[#2E6BFF]"
                      >
                        {quotation.title}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11.5px] text-[#94A3B8]">
                        {quotation.number}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <QuotationStatusBadge status={quotation.status} />
                </td>

                <td className="px-5 py-4">
                  <QuotationTypeBadge type={quotation.type} />
                </td>

                <td className="px-5 py-4">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 truncate text-[12.5px] text-[#475569]">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                      {quotation.customer_name ?? "—"}
                    </p>
                    {quotation.customer_email ? (
                      <p className="mt-0.5 inline-flex items-center gap-1.5 truncate text-[12px] text-[#94A3B8]">
                        <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {quotation.customer_email}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#475569]">
                    <CalendarDays className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                    {formatDate(quotation.valid_until)}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <span className="text-[13.5px] font-semibold tabular-nums text-[#0B1220]">
                    {formatAmount(quotation.total)} {quotation.currency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="grid gap-3 md:hidden">
        {quotations.map((quotation) => (
          <Link
            key={quotation.id}
            href={`/quotations/${quotation.id}`}
            className="rounded-2xl border border-[#E6EBF3] bg-white p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11.5px] text-[#94A3B8]">{quotation.number}</p>
                <p className="mt-0.5 text-[13.5px] font-semibold leading-snug text-[#0B1220]">
                  {quotation.title}
                </p>
              </div>
              <QuotationStatusBadge status={quotation.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <QuotationTypeBadge type={quotation.type} />
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                {quotation.customer_name ?? "—"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(quotation.valid_until)}
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-[#0B1220]">
                {formatAmount(quotation.total)} {quotation.currency}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
