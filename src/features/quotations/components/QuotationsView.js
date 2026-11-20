"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Plus,
  Send,
  CheckCircle2,
} from "lucide-react";

import { Alert, Button, Card, CardBody, EmptyState, PageHeader, Skeleton } from "@/components/ui";

import { useQuotations } from "../hooks/useQuotations";
import { formatAmount } from "../utils/format";
import QuotationFilters from "./QuotationFilters";
import QuotationList from "./QuotationList";

/**
 * Listado de cotizaciones con KPIs, búsqueda, filtros y paginación.
 *
 * Consume `GET /quotations/` mediante `useQuotations`.
 */
export default function QuotationsView() {
  const router = useRouter();

  const {
    quotations,
    stats,
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
  } = useQuotations();

  const kpis = [
    {
      label: "Cotizaciones totales",
      value: stats?.total ?? 0,
      icon: FileText,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
    },
    {
      label: "En borrador",
      value: stats?.draft ?? 0,
      icon: FileText,
      tone: "bg-[#F1F5F9] text-[#475569]",
    },
    {
      label: "Enviadas",
      value: stats?.sent ?? 0,
      icon: Send,
      tone: "bg-[#F3F7FF] text-[#1D4ED8]",
    },
    {
      label: "Aceptadas",
      value: stats?.accepted ?? 0,
      icon: CheckCircle2,
      tone: "bg-[#F0FBF4] text-[#12A150]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comercial"
        title="Cotizaciones"
        description="Propuestas enviadas a tus clientes: importes, estados y líneas de cada cotización."
        actions={
          <Button variant="brand" onClick={() => router.push("/quotations/new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva cotización
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12.5px] font-medium text-[#64748B]">{kpi.label}</p>

                  {isLoading ? (
                    <Skeleton className="mt-2.5 h-7 w-12" />
                  ) : (
                    <p className="mt-1 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#0B1220]">
                      {kpi.value}
                    </p>
                  )}
                </div>

                <span className={`grid h-10 w-10 place-items-center rounded-xl ${kpi.tone}`}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <QuotationFilters
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            resultCount={isLoading ? undefined : total}
          />

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EFF4FF] text-[#2E6BFF]">
                <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
              </span>

              <div>
                <p className="text-[12px] font-medium text-[#64748B]">Valor total cotizado</p>

                {isLoading ? (
                  <Skeleton className="mt-1 h-4 w-24" />
                ) : (
                  <p className="text-[15px] font-bold leading-none tracking-[-0.01em] text-[#0B1220]">
                    {formatAmount(stats?.amount ?? 0)} USD
                  </p>
                )}
              </div>
            </div>

            <p className="hidden text-[11.5px] text-[#94A3B8] sm:block">
              Suma de las cotizaciones no canceladas.
            </p>
          </div>
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={FileText}
          title="No hay cotizaciones que coincidan"
          description="Prueba a cambiar los filtros o crea una nueva cotización para empezar."
          action={
            <Button variant="brand" onClick={() => router.push("/quotations/new")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva cotización
            </Button>
          }
        />
      ) : (
        <>
          <QuotationList quotations={quotations} isLoading={isLoading} />

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
