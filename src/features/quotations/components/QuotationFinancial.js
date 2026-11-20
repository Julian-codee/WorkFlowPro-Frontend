"use client";

import { Banknote, CalendarDays, Receipt, TrendingUp, Wallet } from "lucide-react";

import { Alert, Card, CardBody, CardHeader, Skeleton } from "@/components/ui";

import { useQuotationFinancial } from "../hooks/useQuotationFinancial";
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
 * Resumen financiero de la cotización.
 *
 * Consume `GET /quotations/{id}/financial`.
 */
export default function QuotationFinancial({ quotationId, total = 0, currency = "USD" }) {
  const { financial, error, isLoading } = useQuotationFinancial(quotationId);

  const currencyCode = financial?.currency ?? currency;
  const invoiced = financial?.invoiced ?? 0;
  const paid = financial?.paid ?? 0;
  const outstanding = financial?.outstanding ?? 0;
  const collectedRatio = invoiced > 0 ? Math.min(100, Math.round((paid / invoiced) * 100)) : 0;

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
              label="Total cotizado"
              value={formatCurrency(financial?.total ?? total, currencyCode, { decimals: 0 })}
              tone="bg-[#EFF4FF] text-[#2E6BFF]"
              hint="Importe de la propuesta"
            />
            <MetricCard
              icon={Wallet}
              label="Facturado"
              value={formatCurrency(invoiced, currencyCode, { decimals: 0 })}
              tone="bg-[#F7F4FF] text-[#6941C6]"
              hint={`${financial?.invoices_count ?? 0} facturas emitidas`}
            />
            <MetricCard
              icon={Banknote}
              label="Cobrado"
              value={formatCurrency(paid, currencyCode, { decimals: 0 })}
              tone="bg-[#F0FBF4] text-[#12A150]"
              hint={`Último pago: ${formatDate(financial?.last_payment_date)}`}
            />
            <MetricCard
              icon={TrendingUp}
              label="Por cobrar"
              value={formatCurrency(outstanding, currencyCode, { decimals: 0 })}
              tone={
                outstanding > 0 ? "bg-[#FEF4F4] text-[#D92D20]" : "bg-[#F1F5F9] text-[#475569]"
              }
              hint={`${financial?.pending_invoices ?? 0} facturas pendientes`}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader
          title="Cobranza"
          description="Porcentaje facturado que ya ha sido cobrado."
        />

        <CardBody>
          {isLoading ? (
            <Skeleton className="h-2 w-full rounded-full" rounded="rounded-full" />
          ) : (
            <>
              <div className="flex items-end justify-between gap-3">
                <p className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#0B1220]">
                  {collectedRatio}%
                </p>
                <p className="text-[12.5px] text-[#64748B]">
                  {formatCurrency(paid, currencyCode, { decimals: 0 })} de{" "}
                  {formatCurrency(invoiced, currencyCode, { decimals: 0 })}
                </p>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2E6BFF] to-[#60A5FA]"
                  style={{ width: `${collectedRatio}%` }}
                />
              </div>

              {financial?.win_probability ? (
                <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[#64748B]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                  Probabilidad de cierre estimada: {financial.win_probability}%.
                </p>
              ) : null}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
