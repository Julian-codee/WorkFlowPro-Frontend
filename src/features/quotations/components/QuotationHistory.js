"use client";

import {
  CheckCircle2,
  Copy,
  FileText,
  History,
  ListPlus,
  Pencil,
  Send,
  Share2,
  XCircle,
} from "lucide-react";

import { Alert, Card, CardBody, CardHeader, EmptyState, Skeleton } from "@/components/ui";

import { useQuotationHistory } from "../hooks/useQuotationHistory";
import { formatDateTime } from "../utils/format";

const ACTION_META = {
  created: { label: "Cotización creada", icon: FileText, tone: "bg-[#EFF4FF] text-[#2E6BFF]" },
  updated: { label: "Datos actualizados", icon: Pencil, tone: "bg-[#F7F4FF] text-[#6941C6]" },
  sent: { label: "Enviada al cliente", icon: Send, tone: "bg-[#F3F7FF] text-[#1D4ED8]" },
  accepted: { label: "Aceptada", icon: CheckCircle2, tone: "bg-[#F0FBF4] text-[#0A6B3D]" },
  rejected: { label: "Rechazada", icon: XCircle, tone: "bg-[#FEF4F4] text-[#B42318]" },
  duplicated: { label: "Duplicada", icon: Copy, tone: "bg-[#F1F5F9] text-[#475569]" },
  converted: { label: "Convertida en tarea", icon: Share2, tone: "bg-[#FEF8EC] text-[#96590A]" },
  status_changed: {
    label: "Estado modificado",
    icon: History,
    tone: "bg-[#FEF8EC] text-[#96590A]",
  },
  item_added: { label: "Línea agregada", icon: ListPlus, tone: "bg-[#F3F7FF] text-[#1D4ED8]" },
  item_updated: { label: "Línea actualizada", icon: Pencil, tone: "bg-[#F3F7FF] text-[#1D4ED8]" },
  item_deleted: { label: "Línea eliminada", icon: XCircle, tone: "bg-[#FEF4F4] text-[#B42318]" },
};

/**
 * Historial de acciones de la cotización.
 *
 * Consume `GET /quotations/{id}/full` (bloque `history`).
 */
export default function QuotationHistory({ quotationId }) {
  const { entries, error, isLoading } = useQuotationHistory(quotationId);

  return (
    <Card>
      <CardHeader
        title="Historial"
        description="Registro de los cambios y transiciones de la cotización."
      />

      <CardBody>
        {error ? <Alert variant="error">{error}</Alert> : null}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" rounded="rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="mt-2 h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={History}
            title="Sin movimientos registrados"
            description="Aquí verás cada envío, aceptación o cambio de la cotización."
            className="border-none bg-transparent py-8"
          />
        ) : (
          <ol className="relative space-y-5 border-l border-[#EEF1F6] pl-6">
            {entries.map((entry) => {
              const meta = ACTION_META[entry.action] ?? {
                label: entry.action,
                icon: History,
                tone: "bg-[#F1F5F9] text-[#475569]",
              };

              const Icon = meta.icon;

              return (
                <li key={entry.id} className="relative">
                  <span
                    className={`absolute -left-[38px] grid h-8 w-8 place-items-center rounded-lg ${meta.tone}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <p className="text-[13px] font-semibold text-[#0B1220]">{meta.label}</p>
                  {entry.detail ? (
                    <p className="mt-0.5 text-[12.5px] text-[#64748B]">{entry.detail}</p>
                  ) : null}
                  <p className="mt-1 text-[11.5px] text-[#94A3B8]">
                    {entry.actor ?? "Sistema"} · {formatDateTime(entry.created_at)}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
