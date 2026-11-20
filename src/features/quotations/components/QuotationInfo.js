"use client";

import {
  CalendarDays,
  Clock,
  FileText,
  Mail,
  Receipt,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

import { Card, CardBody, CardHeader } from "@/components/ui";

import { formatAmount, formatDate, formatDateTime } from "../utils/format";
import { QuotationStatusBadge, QuotationTypeBadge } from "./QuotationBadges";

function InfoRow({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#94A3B8]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[#94A3B8]">{label}</p>
        <p className="mt-0.5 text-[13.5px] font-medium text-[#0B1220]">{value ?? "—"}</p>
        {hint ? <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">{hint}</p> : null}
      </div>
    </div>
  );
}

/**
 * Ficha de la cotización: cliente, condiciones, importes y marcas de tiempo.
 *
 * Consume los datos ya cargados por `GET /quotations/{id}` (o `/full`).
 */
export default function QuotationInfo({ quotation }) {
  if (!quotation) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Datos de la cotización"
            description="Concepto, condiciones y notas registradas en la propuesta."
          />

          <CardBody>
            <div className="flex flex-wrap items-center gap-2">
              <QuotationTypeBadge type={quotation.type} />
              <QuotationStatusBadge status={quotation.status} />
              <span className="font-mono text-[12px] text-[#94A3B8]">{quotation.number}</span>
            </div>

            <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
              <InfoRow
                icon={FileText}
                label="Concepto"
                value={quotation.title}
              />
              <InfoRow
                icon={Wallet}
                label="Condiciones de pago"
                value={quotation.payment_terms || "Sin condiciones"}
              />
              <InfoRow
                icon={CalendarDays}
                label="Válida hasta"
                value={formatDate(quotation.valid_until)}
                hint={quotation.valid_until ? undefined : "Sin fecha de expiración"}
              />
              <InfoRow
                icon={Clock}
                label="Creada"
                value={formatDateTime(quotation.created_at)}
              />
            </div>

            {quotation.notes ? (
              <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-4">
                <p className="text-[12px] font-semibold text-[#334155]">Notas y condiciones</p>
                <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-[#475569]">
                  {quotation.notes}
                </p>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Seguimiento" description="Fechas clave del ciclo de vida de la propuesta." />

          <CardBody className="grid gap-x-6 sm:grid-cols-2">
            <InfoRow icon={Clock} label="Última actualización" value={formatDateTime(quotation.updated_at)} />
            <InfoRow icon={Mail} label="Enviada" value={formatDateTime(quotation.sent_at)} />
            <InfoRow icon={ShieldCheck} label="Aceptada" value={formatDateTime(quotation.accepted_at)} />
            <InfoRow icon={Receipt} label="Rechazada" value={formatDateTime(quotation.rejected_at)} />

            {quotation.rejection_reason ? (
              <div className="sm:col-span-2 mt-2 rounded-xl border border-[#F4C7CA] bg-[#FEF4F4] p-4">
                <p className="text-[12px] font-semibold text-[#B42318]">Motivo del rechazo</p>
                <p className="mt-1.5 text-[13px] leading-6 text-[#7A271A]">
                  {quotation.rejection_reason}
                </p>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Cliente" description="Destinatario de la propuesta." />

          <CardBody>
            <InfoRow
              icon={UserRound}
              label="Cliente"
              value={quotation.customer_name || "Sin cliente asignado"}
              hint={quotation.customer_email || undefined}
            />

            {quotation.customer_id ? (
              <a
                href={`/customers/${quotation.customer_id}`}
                className="mt-2 inline-flex text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
              >
                Ver ficha del cliente
              </a>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Importes" description="Totales calculados sobre las líneas." />

          <CardBody>
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12.5px] text-[#64748B]">Subtotal</dt>
                <dd className="text-[13px] tabular-nums text-[#334155]">
                  {formatAmount(quotation.subtotal)} {quotation.currency}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12.5px] text-[#64748B]">Descuento</dt>
                <dd className="text-[13px] tabular-nums text-[#334155]">
                  −{formatAmount(quotation.discount_total)} {quotation.currency}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12.5px] text-[#64748B]">Impuestos</dt>
                <dd className="text-[13px] tabular-nums text-[#334155]">
                  {formatAmount(quotation.tax_total)} {quotation.currency}
                </dd>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#F1F4F9] pt-4">
                <dt className="text-[13px] font-semibold text-[#0B1220]">Total</dt>
                <dd className="text-[22px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[#0B1220]">
                  {formatAmount(quotation.total)}{" "}
                  <span className="text-[13px] font-semibold text-[#64748B]">{quotation.currency}</span>
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
