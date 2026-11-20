"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Send, Share2, XCircle } from "lucide-react";

import { Button, Modal, Textarea } from "@/components/ui";

import { formatAmount } from "../utils/format";

/**
 * Diálogos de acciones sobre una cotización.
 *
 * Cada diálogo únicamente confirma la intención; la llamada HTTP vive en el
 * servicio (`quotationService`), invocado desde `QuotationDetailView`:
 *
 *   POST /quotations/{id}/send
 *   POST /quotations/{id}/accept
 *   POST /quotations/{id}/reject
 *   POST /quotations/{id}/duplicate
 *   POST /quotations/{id}/convert-to-task
 */

/** Confirmación de envío (draft → sent). */
export function SendQuotationDialog({ open, quotation, onClose, onConfirm, isSubmitting }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enviar cotización"
      description="La cotización pasará de borrador a enviada."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={onConfirm}>
            {!isSubmitting ? <Send className="h-4 w-4" aria-hidden="true" /> : null}
            Enviar
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        Se enviará <span className="font-semibold text-[#0B1220]">{quotation?.title}</span> al
        cliente <span className="font-semibold text-[#0B1220]">{quotation?.customer_name}</span> por
        un total de{" "}
        <span className="font-semibold text-[#0B1220]">
          {formatAmount(quotation?.total)} {quotation?.currency}
        </span>
        .
      </p>

      <p className="mt-3 text-[12px] leading-5 text-[#94A3B8]">
        En este entorno la acción es simulada. Al conectar el backend se ejecutará
        <span className="font-medium text-[#64748B]"> POST /quotations/{quotation?.id}/send</span>.
      </p>
    </Modal>
  );
}

/** Confirmación de aceptación. */
export function AcceptQuotationDialog({ open, quotation, onClose, onConfirm, isSubmitting }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aceptar cotización"
      description="Se marcará la cotización como aceptada."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={onConfirm}>
            {!isSubmitting ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
            Aceptar
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        ¿Confirmas que el cliente acepta{" "}
        <span className="font-semibold text-[#0B1220]">{quotation?.title}</span> por{" "}
        <span className="font-semibold text-[#0B1220]">
          {formatAmount(quotation?.total)} {quotation?.currency}
        </span>
        ?
      </p>
    </Modal>
  );
}

/**
 * Rechazo de la cotización.
 * El motivo es opcional y se envía como `reason`.
 *
 * El padre debe montar el diálogo con una `key` que cambie al abrirlo para que
 * el motivo se reinicie con el valor inicial (sin efectos de sincronización).
 */
export function RejectQuotationDialog({
  open,
  quotation,
  onClose,
  onConfirm,
  isSubmitting,
  initialReason = "",
}) {
  const [reason, setReason] = useState(initialReason);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar cotización"
      description="Indica el motivo para mantener el seguimiento."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="danger" loading={isSubmitting} onClick={() => onConfirm(reason.trim())}>
            {!isSubmitting ? <XCircle className="h-4 w-4" aria-hidden="true" /> : null}
            Rechazar
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        Se marcará <span className="font-semibold text-[#0B1220]">{quotation?.title}</span> como
        rechazada.
      </p>

      <div className="mt-4">
        <Textarea
          id="quotation-rejection-reason"
          name="reason"
          label="Motivo del rechazo"
          placeholder="Ej. El presupuesto se aplazará al próximo ejercicio."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={isSubmitting}
          rows={3}
          maxLength={500}
          hint="Opcional. Se guardará en el historial de la cotización."
        />
      </div>
    </Modal>
  );
}

/** Duplicar la cotización creando una nueva en borrador. */
export function DuplicateQuotationDialog({ open, quotation, onClose, onConfirm, isSubmitting }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Duplicar cotización"
      description="Se creará una copia en estado borrador."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={onConfirm}>
            {!isSubmitting ? <Copy className="h-4 w-4" aria-hidden="true" /> : null}
            Duplicar
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        Se creará una nueva cotización con las mismas líneas, cliente y condiciones que{" "}
        <span className="font-semibold text-[#0B1220]">{quotation?.number}</span>.
      </p>

      <p className="mt-3 text-[12px] leading-5 text-[#94A3B8]">
        La copia tendrá un número nuevo y quedará en borrador, lista para que la edites y la
        envíes.
      </p>
    </Modal>
  );
}

/** Convertir la cotización en una tarea del módulo de tareas. */
export function ConvertToTaskDialog({ open, quotation, onClose, onConfirm, isSubmitting }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convertir en tarea"
      description="Se generará una tarea a partir de esta cotización."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={onConfirm}>
            {!isSubmitting ? <Share2 className="h-4 w-4" aria-hidden="true" /> : null}
            Convertir
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-6 text-[#475569]">
        La tarea heredará el concepto{" "}
        <span className="font-semibold text-[#0B1220]">{quotation?.title}</span>, el cliente{" "}
        <span className="font-semibold text-[#0B1220]">{quotation?.customer_name}</span> y el importe
        de{" "}
        <span className="font-semibold text-[#0B1220]">
          {formatAmount(quotation?.total)} {quotation?.currency}
        </span>
        .
      </p>

      <p className="mt-3 text-[12px] leading-5 text-[#94A3B8]">
        En este entorno la acción es simulada. Al conectar el backend se ejecutará
        <span className="font-medium text-[#64748B]">
          {" "}
          POST /quotations/{quotation?.id}/convert-to-task
        </span>
        .
      </p>
    </Modal>
  );
}
