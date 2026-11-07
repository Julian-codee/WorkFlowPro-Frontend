"use client";

import { Button, Modal } from "@/components/ui";

import { getCustomerDisplayName } from "../constants";

/**
 * Confirmación de archivado de un cliente (soft delete).
 *
 * Conecta con `DELETE /api/v1/customers/{id}`.
 */
export default function ArchiveCustomerDialog({
  open,
  customer,
  isArchiving,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Archivar cliente"
      description="El cliente dejará de aparecer en los listados activos."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isArchiving}>
            Cancelar
          </Button>
          <Button variant="danger" loading={isArchiving} onClick={onConfirm}>
            Archivar cliente
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        ¿Seguro que quieres archivar a{" "}
        <span className="font-semibold text-[#0B1220]">
          {getCustomerDisplayName(customer)}
        </span>
        ?
      </p>

      <p className="mt-3 rounded-xl bg-[#F7F9FC] px-3.5 py-3 text-[12.5px] leading-5 text-[#64748B]">
        El archivado es un borrado lógico: el historial, las notas y el resumen financiero se
        conservan y podrás reactivar el cliente cuando quieras.
      </p>
    </Modal>
  );
}
