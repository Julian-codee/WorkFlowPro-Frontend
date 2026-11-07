"use client";

import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, UserRound, UserRoundCheck, Users } from "lucide-react";

import { Alert, Button, Card, CardBody, EmptyState, PageHeader, Skeleton } from "@/components/ui";

import { useCustomers } from "../hooks/useCustomers";
import CustomerFilters from "./CustomerFilters";
import CustomerList from "./CustomerList";

/**
 * Listado de clientes con búsqueda, filtros y paginación.
 */
export default function CustomersView() {
  const router = useRouter();

  const {
    customers,
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
  } = useCustomers();

  const kpis = [
    {
      label: "Clientes totales",
      value: stats?.total ?? 0,
      icon: Users,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
    },
    {
      label: "Personas naturales",
      value: stats?.natural ?? 0,
      icon: UserRound,
      tone: "bg-[#F3F7FF] text-[#1D4ED8]",
    },
    {
      label: "Personas jurídicas",
      value: stats?.legal ?? 0,
      icon: Building2,
      tone: "bg-[#F7F4FF] text-[#6941C6]",
    },
    {
      label: "Activos",
      value: stats?.active ?? 0,
      icon: UserRoundCheck,
      tone: "bg-[#F0FBF4] text-[#12A150]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cartera"
        title="Clientes"
        description="Personas naturales y jurídicas de tu espacio de trabajo: datos, estado y actividad."
        actions={
          <Button variant="brand" onClick={() => router.push("/customers/new")}>
            Nuevo cliente
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
        <CardBody>
          <CustomerFilters
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            resultCount={isLoading ? undefined : total}
          />
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={Users}
          title="No hay clientes que coincidan"
          description="Prueba a cambiar los filtros o registra un nuevo cliente para empezar."
          action={
            <Button variant="brand" onClick={() => router.push("/customers/new")}>
              Nuevo cliente
            </Button>
          }
        />
      ) : (
        <>
          <CustomerList customers={customers} isLoading={isLoading} />

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
