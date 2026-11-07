"use client";

import {
  Archive,
  History,
  MessageSquare,
  Pencil,
  PlayCircle,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

import { Alert, Card, CardBody, CardHeader, EmptyState, Skeleton } from "@/components/ui";

import { useCustomerAudit } from "../hooks/useCustomerAudit";
import { formatDateTime } from "../utils/format";

const ACTION_META = {
  created: { label: "Cliente creado", icon: PlusCircle, tone: "bg-[#EFF4FF] text-[#2E6BFF]" },
  updated: { label: "Datos actualizados", icon: Pencil, tone: "bg-[#F7F4FF] text-[#6941C6]" },
  status_changed: {
    label: "Estado modificado",
    icon: ShieldCheck,
    tone: "bg-[#FEF8EC] text-[#96590A]",
  },
  note_added: {
    label: "Nota agregada",
    icon: MessageSquare,
    tone: "bg-[#F3F7FF] text-[#1D4ED8]",
  },
  note_updated: {
    label: "Nota actualizada",
    icon: Pencil,
    tone: "bg-[#F3F7FF] text-[#1D4ED8]",
  },
  note_deleted: {
    label: "Nota eliminada",
    icon: MessageSquare,
    tone: "bg-[#FEF4F4] text-[#B42318]",
  },
  archived: { label: "Cliente archivado", icon: Archive, tone: "bg-[#F1F5F9] text-[#475569]" },
  reactivated: {
    label: "Cliente reactivado",
    icon: PlayCircle,
    tone: "bg-[#F0FBF4] text-[#0A6B3D]",
  },
};

/**
 * Historial de auditoría del cliente.
 *
 * Consume `GET /customers/{id}/audit`.
 */
export default function CustomerAudit({ customerId }) {
  const { entries, error, isLoading } = useCustomerAudit(customerId);

  return (
    <Card>
      <CardHeader
        title="Historial de auditoría"
        description="Registro de los cambios realizados sobre la ficha del cliente."
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
            description="Cuando se actualice la ficha del cliente verás aquí el detalle de cada cambio."
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
                  <p className="mt-0.5 text-[12.5px] text-[#64748B]">
                    {entry.detail ?? "—"}
                  </p>
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
