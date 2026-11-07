"use client";

import { Banknote, CalendarDays, Receipt, TrendingUp, Wallet } from "lucide-react";

import { Alert, Card, CardBody, CardHeader, Skeleton } from "@/components/ui";

import { useCustomerFinancial } from "../hooks/useCustomerAudit";
import { formatCurrency, formatDate } from "../utils/format";

function MetricCard({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="rounded-2xl border border-[#E6EBF3] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
          <p className="mt-1 text-[19px] font-bold leading-none tracking-[-0.02em] text-[#0B1220]">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-[11.5px] text-[#94A3B8]">{hint}</p> : null}
        </div>

        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

/**
 * Resumen financiero del cliente.
 *
 * Consume `GET /customers/{id}/financial`.
 */
export default function CustomerFinancial({ customerId }) {
  const { financial, error, isLoading } = useCustomerFinancial(customerId);

  const currency = financial?.currency ?? "USD";
  const total = financial?.total_invoiced ?? 0;
  const paid = financial?.total_paid ?? 0;
  const outstanding = financial?.outstanding ?? 0;
  const paidRatio = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  if (error) {
    return (
      <Card>
        <CardHeader title="Resumen financiero" />
        <CardBody>
          <Alert variant="error">{error}</Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#E6EBF3] bg-white p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-6 w-28" />
            </div>
          ))
        ) : (
          <>
            <MetricCard
              icon={Receipt}
              label="Total facturado"
              value={formatCurrency(total, currency)}
              tone="bg-[#EFF4FF] text-[#2E6BFF]"
              hint={`${financial?.invoices_count ?? 0} facturas emitidas`}
            />
            <MetricCard
              icon={Wallet}
              label="Total cobrado"
              value={formatCurrency(paid, currency)}
              tone="bg-[#F0FBF4] text-[#12A150]"
              hint={`Último pago: ${formatDate(financial?.last_payment_date)}`}
            />
            <MetricCard
              icon={Banknote}
              label="Pendiente"
              value={formatCurrency(outstanding, currency)}
              tone={outstanding > 0 ? "bg-[#FEF4F4] text-[#D92D20]" : "bg-[#F1F5F9] text-[#475569]"}
              hint={`${financial?.pending_invoices ?? 0} facturas por cobrar`}
            />
            <MetricCard
              icon={TrendingUp}
              label="Ticket medio"
              value={formatCurrency(financial?.average_ticket ?? 0, currency)}
              tone="bg-[#F7F4FF] text-[#6941C6]"
              hint={`Última factura: ${formatDate(financial?.last_invoice_date)}`}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader
          title="Cobranza"
          description="Porcentaje del total facturado que ya ha sido cobrado."
        />

        <CardBody>
          {isLoading ? (
            <Skeleton className="h-2 w-full rounded-full" rounded="rounded-full" />
          ) : (
            <>
              <div className="flex items-end justify-between gap-3">
                <p className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#0B1220]">
                  {paidRatio}%
                </p>
                <p className="text-[12.5px] text-[#64748B]">
                  {formatCurrency(paid, currency)} de {formatCurrency(total, currency)}
                </p>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2E6BFF] to-[#60A5FA]"
                  style={{ width: `${paidRatio}%` }}
                />
              </div>

              {outstanding > 0 ? (
                <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[#64748B]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                  Quedan {formatCurrency(outstanding, currency)} pendientes de cobro.
                </p>
              ) : (
                <p className="mt-3 text-[12.5px] text-[#64748B]">
                  No hay saldos pendientes con este cliente.
                </p>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
