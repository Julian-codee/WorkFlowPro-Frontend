"use client";

import { useState } from "react";

import { Alert, Button, Input, Modal, Select, Textarea } from "@/components/ui";

import { ADJUSTMENT_TYPES, ADJUSTMENT_TYPE_LIST } from "../constants";
import { formatMoney } from "../utils/format";

const ADJUSTMENT_TYPE_OPTIONS = ADJUSTMENT_TYPE_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

function getDifferenceTone(value) {
  if (Number(value) > 0) return "text-[#0A6B3D]";
  if (Number(value) < 0) return "text-[#B42318]";
  return "text-[#64748B]";
}

function formatDifference(value) {
  const amount = Number(value ?? 0);
  const prefix = amount > 0 ? "+" : amount < 0 ? "−" : "";

  return `${prefix}${formatMoney(Math.abs(amount))}`;
}

/**
 * Diálogo de cierre semanal. Recoge el conteo físico de caja y las
 * observaciones antes de sellar el período.
 */
export function ClosePeriodDialog({
  open,
  period,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const expectedCash =
    Number(period?.opening_balance ?? 0) + Number(period?.cash_balance ?? period?.balance ?? 0);
  const [actualCash, setActualCash] = useState("");
  const [responsible, setResponsible] = useState("Ana Morales");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const parsedActualCash = Number(actualCash);
  const hasValidAmount = actualCash !== "" && Number.isFinite(parsedActualCash);
  const difference = hasValidAmount ? parsedActualCash - expectedCash : 0;

  function handleActualCashChange(event) {
    setActualCash(event.target.value);
    setFormError("");
  }

  function handleResponsibleChange(event) {
    setResponsible(event.target.value);
    setFormError("");
  }

  function handleNotesChange(event) {
    setNotes(event.target.value);
  }

  async function handleConfirm() {
    if (!hasValidAmount || parsedActualCash <= 0) {
      setFormError("Ingresa un saldo contado en caja mayor que cero.");
      return;
    }

    if (!responsible.trim()) {
      setFormError("Ingresa el responsable del cierre.");
      return;
    }

    await onConfirm({
      actual_cash: parsedActualCash,
      responsible: responsible.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cerrar semana y conciliar caja"
      description="Confirma el saldo contado en caja para cerrar el período semanal."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={handleConfirm}>
            Confirmar y cerrar
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="rounded-xl border border-[#E6EBF3] bg-[#FAFBFD] px-4 py-3">
          <p className="text-[12px] font-medium text-[#64748B]">Saldo esperado</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums text-[#0B1220]">
            {formatMoney(expectedCash)}
          </p>
        </div>

        <Input
          id="close-period-actual-cash"
          name="actual_cash"
          label="Saldo contado en caja"
          type="number"
          value={actualCash}
          onChange={handleActualCashChange}
          error={formError && !hasValidAmount ? formError : null}
          hint="Debe ser mayor que cero."
          required
          inputClassName="tabular-nums"
        />

        <Input
          id="close-period-responsible"
          name="responsible"
          label="Responsable del cierre"
          value={responsible}
          onChange={handleResponsibleChange}
          error={formError && !responsible.trim() ? formError : null}
          required
        />

        <Textarea
          id="close-period-notes"
          name="notes"
          label="Observaciones"
          value={notes}
          onChange={handleNotesChange}
          placeholder="Añade el detalle del conteo o cualquier incidencia."
          rows={4}
          maxLength={500}
        />

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#EEF1F6] bg-white px-4 py-3">
          <span className="text-[12.5px] font-semibold text-[#334155]">
            Diferencia calculada
          </span>
          <span className={`text-[14px] font-bold tabular-nums ${getDifferenceTone(difference)}`}>
            {hasValidAmount ? formatDifference(difference) : "—"}
          </span>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Diálogo de confirmación final de un cierre en borrador.
 */
export function ConfirmClosureDialog({
  open,
  closure,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const expectedCash = Number(closure?.expected_cash ?? 0);
  const [actualCash, setActualCash] = useState(() =>
    String(closure?.actual_cash ?? closure?.expected_cash ?? 0),
  );
  const [observations, setObservations] = useState(() => closure?.observations ?? "");
  const [formError, setFormError] = useState("");

  const parsedActualCash = Number(actualCash);
  const hasValidAmount = actualCash !== "" && Number.isFinite(parsedActualCash);
  const difference = hasValidAmount ? parsedActualCash - expectedCash : 0;

  function handleActualCashChange(event) {
    setActualCash(event.target.value);
    setFormError("");
  }

  function handleObservationsChange(event) {
    setObservations(event.target.value);
  }

  async function handleConfirm() {
    if (!hasValidAmount || parsedActualCash <= 0) {
      setFormError("Ingresa un saldo real mayor que cero.");
      return;
    }

    await onConfirm({
      actual_cash: parsedActualCash,
      expected_cash: expectedCash,
      observations: observations.trim(),
      notes: closure?.notes ?? "",
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar cierre de caja"
      description="Revisa el conteo final antes de confirmar el cierre."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={handleConfirm}>
            Confirmar cierre
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#E6EBF3] bg-[#FAFBFD] px-4 py-3">
            <p className="text-[12px] font-medium text-[#64748B]">Saldo esperado</p>
            <p className="mt-1 text-[16px] font-bold tabular-nums text-[#0B1220]">
              {formatMoney(expectedCash)}
            </p>
          </div>

          <div className="rounded-xl border border-[#E6EBF3] bg-[#FAFBFD] px-4 py-3">
            <p className="text-[12px] font-medium text-[#64748B]">Diferencia</p>
            <p className={`mt-1 text-[16px] font-bold tabular-nums ${getDifferenceTone(difference)}`}>
              {hasValidAmount ? formatDifference(difference) : "—"}
            </p>
          </div>
        </div>

        <Input
          id="confirm-closure-actual-cash"
          name="actual_cash"
          label="Saldo real contado en caja"
          type="number"
          value={actualCash}
          onChange={handleActualCashChange}
          error={formError && !hasValidAmount ? formError : null}
          required
          inputClassName="tabular-nums"
        />

        <Textarea
          id="confirm-closure-observations"
          name="observations"
          label="Observaciones del cierre"
          value={observations}
          onChange={handleObservationsChange}
          placeholder="Documenta cualquier diferencia o incidencia del conteo."
          rows={4}
          maxLength={500}
        />
      </div>
    </Modal>
  );
}

/**
 * Diálogo para registrar un ajuste posterior al cierre.
 */
export function AdjustmentDialog({
  open,
  closure,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const [type, setType] = useState(ADJUSTMENT_TYPES.SHORTAGE);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [justification, setJustification] = useState("");
  const [errors, setErrors] = useState({});

  function handleTypeChange(event) {
    setType(event.target.value);
    setErrors((current) => ({ ...current, type: null }));
  }

  function handleAmountChange(event) {
    setAmount(event.target.value);
    setErrors((current) => ({ ...current, amount: null }));
  }

  function handleReasonChange(event) {
    setReason(event.target.value);
    setErrors((current) => ({ ...current, reason: null }));
  }

  function handleJustificationChange(event) {
    setJustification(event.target.value);
    setErrors((current) => ({ ...current, justification: null }));
  }

  async function handleConfirm() {
    const parsedAmount = Number(amount);
    const nextErrors = {};

    if (!type) nextErrors.type = "Selecciona el tipo de ajuste.";
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Ingresa un importe mayor que cero.";
    }
    if (!reason.trim()) nextErrors.reason = "Ingresa la causa del ajuste.";
    if (!justification.trim()) {
      nextErrors.justification = "La justificación es obligatoria.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onConfirm({
      type,
      amount: parsedAmount,
      reason: reason.trim(),
      justification: justification.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar ajuste sobre el cierre"
      description={`Documenta una diferencia posterior al cierre de la semana ${closure?.number ?? ""}.`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={handleConfirm}>
            Registrar ajuste
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Alert variant="warning">
          El cierre original no se altera: el ajuste queda registrado como un movimiento posterior a la
          fecha de cierre.
        </Alert>

        <Select
          id="closure-adjustment-type"
          name="type"
          label="Tipo de ajuste"
          value={type}
          onChange={handleTypeChange}
          options={ADJUSTMENT_TYPE_OPTIONS}
          error={errors.type}
          required
        />

        <Input
          id="closure-adjustment-amount"
          name="amount"
          label="Importe"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          error={errors.amount}
          hint="Registra el valor absoluto del faltante o sobrante."
          required
          inputClassName="tabular-nums"
        />

        <Input
          id="closure-adjustment-reason"
          name="reason"
          label="Causa"
          value={reason}
          onChange={handleReasonChange}
          error={errors.reason}
          placeholder="Describe el motivo del ajuste"
          required
        />

        <Textarea
          id="closure-adjustment-justification"
          name="justification"
          label="Justificación del ajuste"
          value={justification}
          onChange={handleJustificationChange}
          error={errors.justification}
          placeholder="Explica cómo se regulariza y quién lo validó."
          rows={5}
          maxLength={500}
          required
        />
      </div>
    </Modal>
  );
}
