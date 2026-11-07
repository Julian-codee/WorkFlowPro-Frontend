"use client";

import { Button, Modal } from "@/components/ui";

import { CUSTOMER_STATUS_LIST } from "../constants";
import { cn } from "@/lib/utils/cn";

const STATUS_DESCRIPTIONS = {
  active: "El cliente está activo y opera con normalidad.",
  inactive: "El cliente se encuentra inactivo temporalmente.",
  archived: "El cliente se archiva y deja de operar (soft delete).",
};

/**
 * Cambio de estado del cliente.
 *
 * Conecta con `PATCH /api/v1/customers/{id}/status`.
 */
export default function CustomerStatusDialog({
  open,
  customer,
  currentStatus,
  selectedStatus,
  onSelectStatus,
  onConfirm,
  onClose,
  isUpdating,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cambiar estado"
      description={
        customer ? `Selecciona el nuevo estado de ${customer.business_name ?? customer.first_name ?? "este cliente"}.` : undefined
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button
            loading={isUpdating}
            disabled={isUpdating || !selectedStatus || selectedStatus === currentStatus}
            onClick={onConfirm}
          >
            Actualizar estado
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {CUSTOMER_STATUS_LIST.map((status) => {
          const isSelected = status.value === selectedStatus;
          const isCurrent = status.value === currentStatus;

          return (
            <label
              key={status.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                isSelected
                  ? "border-[#2E6BFF] bg-[#F4F7FF]"
                  : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]",
              )}
            >
              <input
                type="radio"
                name="customer-status"
                value={status.value}
                checked={isSelected}
                onChange={() => onSelectStatus?.(status.value)}
                disabled={isUpdating}
                className="sr-only"
              />

              <span
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition",
                  isSelected ? "border-[#2E6BFF]" : "border-[#CBD5E1]",
                )}
              >
                {isSelected ? (
                  <span className="block h-2 w-2 translate-x-[3px] translate-y-[3px] rounded-full bg-[#2E6BFF]" />
                ) : null}
              </span>

              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#0B1220]">{status.label}</span>
                  {isCurrent ? (
                    <span className="rounded-full bg-[#EDF1F7] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-[#64748B]">
                      Actual
                    </span>
                  ) : null}
                </span>

                <span className="mt-0.5 block text-[12px] leading-5 text-[#64748B]">
                  {STATUS_DESCRIPTIONS[status.value] ?? ""}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}
