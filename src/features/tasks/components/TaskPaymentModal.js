"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, Button, Input, Modal, Select, Textarea, useToast } from "@/components/ui";

import { PAYMENT_METHOD_OPTIONS } from "../constants";
import {
  addTaskPayment,
  getPaymentPeriodContext,
  listPaymentAccounts,
} from "../services/taskService";
import { hasPaymentErrors, validatePaymentForm } from "../services/validators";
import { formatMoney, toApiDateTime, toDateInputValue } from "../utils/format";

function createInitialValues() {
  return {
    amount: "",
    transaction_date: toDateInputValue(new Date()),
    cash_account_id: "",
    payment_method: "cash",
    reference: "",
    notes: "",
  };
}

/**
 * Modal único para registrar abonos.
 *
 * Puede abrirse desde Tareas, el detalle de una tarea o Pagos pendientes.
 * La escritura se realiza únicamente en `POST /tasks/{id}/payments`.
 */
export default function TaskPaymentModal({ open, task, onClose, onSuccess }) {
  const toast = useToast();
  const [values, setValues] = useState(createInitialValues);
  const [errors, setErrors] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [periodContext, setPeriodContext] = useState({
    cashAccountId: "",
    transactionDate: "",
    period: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const pendingBalance = Number(task?.pending_balance ?? 0);
  const period =
    periodContext.cashAccountId === values.cash_account_id &&
    periodContext.transactionDate === values.transaction_date
      ? periodContext.period
      : null;
  const isClosedPeriod = period?.status === "closed" || period?.status === "adjusted";

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    listPaymentAccounts()
      .then((result) => {
        if (!active) return;
        setAccounts(result.items ?? []);
      })
      .catch((error) => {
        if (!active) return;
        setFormError(error?.message ?? "No pudimos cargar las cuentas financieras.");
      });

    return () => {
      active = false;
    };
  }, [open, task?.id]);

  useEffect(() => {
    if (!open || !values.transaction_date || !values.cash_account_id) {
      return undefined;
    }

    let active = true;
    const cashAccountId = values.cash_account_id;
    const transactionDate = values.transaction_date;

    getPaymentPeriodContext(transactionDate, cashAccountId)
      .then((result) => {
        if (!active) return;
        setPeriodContext({ cashAccountId, transactionDate, period: result });
      })
      .catch(() => {
        if (!active) return;
        setPeriodContext({ cashAccountId, transactionDate, period: null });
      });

    return () => {
      active = false;
    };
  }, [open, values.cash_account_id, values.transaction_date]);

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: `${account.name} · ${account.currency}`,
      })),
    [accounts],
  );

  const selectedAccount = accounts.find((account) => account.id === values.cash_account_id);
  const currency = selectedAccount?.currency ?? "PEN";

  function setFieldValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: null }));
    setFormError(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFieldValue(name, value);
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    const fieldErrors = validatePaymentForm(nextValues, pendingBalance, {
      requiresJustification: isClosedPeriod,
    });

    setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
  }

  function resetForm() {
    setValues(createInitialValues());
    setErrors({});
    setFormError(null);
    setPeriodContext({ cashAccountId: "", transactionDate: "", period: null });
  }

  async function handleSubmit() {
    const fieldErrors = validatePaymentForm(values, pendingBalance, {
      requiresJustification: isClosedPeriod,
    });

    setErrors(fieldErrors);
    setFormError(null);

    if (hasPaymentErrors(fieldErrors)) return;

    setIsSubmitting(true);

    try {
      const payment = await addTaskPayment(task.id, {
        amount: Number(values.amount),
        transaction_date: toApiDateTime(values.transaction_date),
        cash_account_id: values.cash_account_id,
        payment_method: values.payment_method,
        reference: values.reference.trim() || null,
        notes: values.notes.trim() || null,
      });

      toast.success("Abono registrado. Finanzas y la tarea ya están actualizadas.");
      onSuccess?.(payment);
      resetForm();
      onClose?.();
    } catch (error) {
      setFormError(error?.message ?? "No pudimos registrar el abono.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose?.();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Registrar abono"
      description={task ? `Trabajo: ${task.title}` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="brand"
            loading={isSubmitting}
            disabled={isSubmitting || pendingBalance <= 0}
            onClick={handleSubmit}
          >
            Registrar abono
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E6EBF3] bg-[#FBFCFE] p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
              Total abonado
            </p>
            <p className="mt-1 text-[15px] font-bold tabular-nums text-[#0A6B3D]">
              {formatMoney(task?.total_paid ?? 0, currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
              Saldo pendiente
            </p>
            <p className="mt-1 text-[15px] font-bold tabular-nums text-[#B42318]">
              {formatMoney(pendingBalance, currency)}
            </p>
          </div>
        </div>

        {isClosedPeriod ? (
          <Alert variant="warning" title="La fecha pertenece a un período cerrado">
            El pago quedará asociado al movimiento de esa fecha. Explica el motivo en las
            observaciones para conservar la trazabilidad del cierre.
          </Alert>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="task-payment-amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            label="Valor del abono"
            placeholder="0.00"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.amount}
            disabled={isSubmitting}
            required
            hint={`Saldo máximo: ${formatMoney(pendingBalance, currency)}`}
          />

          <Input
            id="task-payment-date"
            name="transaction_date"
            type="date"
            label="Fecha del pago"
            value={values.transaction_date}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.transaction_date}
            disabled={isSubmitting}
            required
          />

          <Select
            id="task-payment-account"
            name="cash_account_id"
            label="Cuenta receptora"
            value={values.cash_account_id}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.cash_account_id}
            options={accountOptions}
            placeholder={accounts.length === 0 ? "No hay cuentas activas" : "Selecciona una cuenta"}
            disabled={isSubmitting || accounts.length === 0}
            required
          />

          <Select
            id="task-payment-method"
            name="payment_method"
            label="Método de pago"
            value={values.payment_method}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.payment_method}
            options={PAYMENT_METHOD_OPTIONS}
            disabled={isSubmitting}
            required
          />

          <Input
            id="task-payment-reference"
            name="reference"
            label="Referencia"
            placeholder="Ej. REC-2026-045"
            value={values.reference}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.reference}
            maxLength={255}
            disabled={isSubmitting}
          />

          <Textarea
            id="task-payment-notes"
            name="notes"
            label="Observaciones"
            placeholder={isClosedPeriod ? "Justifica el pago en el período cerrado…" : "Detalle del abono…"}
            value={values.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.notes}
            rows={4}
            disabled={isSubmitting}
            className="sm:col-span-2"
          />
        </div>

        <div className="flex items-start justify-between gap-3 rounded-xl border border-[#EEF1F6] bg-white px-4 py-3">
          <p className="text-[12px] leading-5 text-[#64748B]">
            Al guardar, el backend actualiza la deuda y crea un único ingreso en Finanzas.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFieldValue("amount", String(pendingBalance))}
            disabled={isSubmitting || pendingBalance <= 0}
          >
            Saldo completo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
