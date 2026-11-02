"use client";

import { Button, Modal } from "@/components/ui";

/**
 * Confirmación de borrado de una tarea.
 *
 * Conecta con `DELETE /api/v1/tasks/{id}` cuando lo implementes.
 */
export default function DeleteTaskDialog({ open, task, isDeleting, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar tarea"
      description="Esta acción no se puede deshacer."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="md" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="danger" size="md" loading={isDeleting} onClick={onConfirm}>
            Eliminar tarea
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        ¿Seguro que quieres eliminar{" "}
        <span className="font-semibold text-[#0B1220]">“{task?.title ?? "esta tarea"}”</span>?
      </p>
    </Modal>
  );
}
