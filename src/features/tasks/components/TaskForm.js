"use client";

import { useEffect, useState } from "react";

import { Alert, Input, Select, Textarea } from "@/components/ui";

import { PAYMENT_METHOD_OPTIONS, TASK_PRIORITY_OPTIONS } from "../constants";
import { useTaskReferences } from "../hooks/useTaskReferences";
import { getPaymentPeriodContext } from "../services/taskService";
import { formatMoney } from "../utils/format";

/**
 * Formulario de alta/edición de tarea.
 *
 * El estado operativo se administra en el detalle. El precio y el abono
 * inicial usan exclusivamente los campos financieros aceptados por FastAPI.
 */
export default function TaskForm({
  values,
  errors,
  onChange,
  onBlur,
  onSubmit,
  isLoading,
  isEditing,
  totalPaid = 0,
  pendingBalance = 0,
}) {
  const {
    customers,
    accounts,
    isLoading: areReferencesLoading,
    customersError,
    accountsError,
  } = useTaskReferences();

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.full_name || customer.name,
  }));
  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} · ${account.currency}`,
  }));
  const hasInitialPayment =
    values.initial_payment_amount !== "" &&
    values.initial_payment_amount !== null &&
    values.initial_payment_amount !== undefined;
  const [initialPeriodContext, setInitialPeriodContext] = useState({
    accountId: "",
    date: "",
    period: null,
  });

  useEffect(() => {
    if (
      isEditing ||
      !hasInitialPayment ||
      !values.initial_payment_date ||
      !values.initial_payment_account_id
    ) {
      return undefined;
    }

    let active = true;
    const accountId = values.initial_payment_account_id;
    const date = values.initial_payment_date;

    getPaymentPeriodContext(date, accountId)
      .then((period) => {
        if (active) setInitialPeriodContext({ accountId, date, period });
      })
      .catch(() => {
        if (active) setInitialPeriodContext({ accountId, date, period: null });
      });

    return () => {
      active = false;
    };
  }, [
    hasInitialPayment,
    isEditing,
    values.initial_payment_account_id,
    values.initial_payment_date,
  ]);

  const canCheckInitialPeriod =
    !isEditing &&
    hasInitialPayment &&
    Boolean(values.initial_payment_date) &&
    Boolean(values.initial_payment_account_id);
  const isInitialPeriodClosed =
    canCheckInitialPeriod &&
    initialPeriodContext.accountId === values.initial_payment_account_id &&
    initialPeriodContext.date === values.initial_payment_date &&
    (initialPeriodContext.period?.status === "closed" ||
      initialPeriodContext.period?.status === "adjusted");

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="space-y-6"
    >
      <section className="space-y-5" aria-labelledby="task-general-section">
        <div>
          <h3 id="task-general-section" className="text-[13.5px] font-semibold text-[#0B1220]">
            Detalles del trabajo
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
            La prioridad y el vencimiento ayudan a organizar la operación.
          </p>
        </div>

        <Input
          id="task-title"
          name="title"
          label="Nombre del trabajo"
          placeholder="Ej. Revisión de la hoja de ruta del Q4"
          value={values.title}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.title}
          disabled={isLoading}
          required
        />

        <Textarea
          id="task-description"
          name="description"
          label="Descripción"
          placeholder="Contexto, alcance y criterios de aceptación"
          value={values.description}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.description}
          maxLength={1000}
          rows={5}
          disabled={isLoading}
          hint="Opcional. Máximo 1000 caracteres."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            id="task-priority"
            name="priority"
            label="Prioridad"
            value={values.priority}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.priority}
            options={TASK_PRIORITY_OPTIONS}
            disabled={isLoading}
          />

          <Input
            id="task-due-date"
            name="due_date"
            type="date"
            label="Fecha de vencimiento"
            value={values.due_date ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.due_date}
            disabled={isLoading}
          />
        </div>

        <Select
          id="task-customer"
          name="customer_id"
          label="Cliente"
          value={values.customer_id ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.customer_id}
          options={customerOptions}
          placeholder={areReferencesLoading ? "Cargando clientes…" : "Sin cliente asociado"}
          disabled={isLoading || areReferencesLoading}
          hint="El cliente permite identificar al deudor en Pagos pendientes."
        />
      </section>

      <section className="space-y-5 border-t border-[#EEF1F6] pt-6" aria-labelledby="task-finance-section">
        <div>
          <h3 id="task-finance-section" className="text-[13.5px] font-semibold text-[#0B1220]">
            Información financiera
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
            El saldo siempre lo calcula el backend. Puedes crear la tarea sin precio y registrar
            abonos después.
          </p>
        </div>

        {isEditing ? (
          <Alert variant="info" title="Valores ya registrados">
            Total abonado: {formatMoney(totalPaid)} · Saldo pendiente: {formatMoney(pendingBalance)}.
            El backend recalculará el saldo al guardar el nuevo precio.
          </Alert>
        ) : null}

        <Input
          id="task-total-price"
          name="total_price"
          type="number"
          min="0"
          step="0.01"
          label="Precio total"
          placeholder="0.00"
          value={values.total_price ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.total_price}
          disabled={isLoading}
          hint="Opcional. No se puede modificar un precio inferior al total ya abonado."
        />

        {!isEditing ? (
          <div className="space-y-5 rounded-2xl border border-[#E6EBF3] bg-[#FBFCFE] p-4 sm:p-5">
            <div>
              <h4 className="text-[13px] font-semibold text-[#0B1220]">Abono inicial</h4>
              <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
                El backend crea la tarea y su ingreso en una sola operación.
              </p>
            </div>

            {isInitialPeriodClosed ? (
              <Alert variant="warning" title="La fecha pertenece a un período cerrado">
                El backend asociará el movimiento a esa fecha. Añade el motivo en las
                observaciones para conservar la trazabilidad del cierre.
              </Alert>
            ) : null}

            <Input
              id="task-initial-payment-amount"
              name="initial_payment_amount"
              type="number"
              min="0"
              step="0.01"
              label="Valor del abono inicial"
              placeholder="0.00"
              value={values.initial_payment_amount ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.initial_payment_amount}
              disabled={isLoading}
              hint="Déjalo vacío si la tarea todavía no tiene abonos."
            />

            {hasInitialPayment ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  id="task-initial-payment-account"
                  name="initial_payment_account_id"
                  label="Cuenta receptora"
                  value={values.initial_payment_account_id ?? ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.initial_payment_account_id}
                  options={accountOptions}
                  placeholder={
                    areReferencesLoading ? "Cargando cuentas…" : "Selecciona una cuenta activa"
                  }
                  disabled={isLoading || areReferencesLoading}
                  required
                />

                <Select
                  id="task-initial-payment-method"
                  name="initial_payment_method"
                  label="Método de pago"
                  value={values.initial_payment_method ?? "cash"}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.initial_payment_method}
                  options={PAYMENT_METHOD_OPTIONS}
                  disabled={isLoading}
                  required
                />

                <Input
                  id="task-initial-payment-date"
                  name="initial_payment_date"
                  type="date"
                  label="Fecha del abono"
                  value={values.initial_payment_date ?? ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.initial_payment_date}
                  disabled={isLoading}
                  required
                />

                <Input
                  id="task-initial-payment-reference"
                  name="initial_payment_reference"
                  label="Referencia"
                  placeholder="Ej. FAC-2026-0123"
                  value={values.initial_payment_reference ?? ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.initial_payment_reference}
                  maxLength={255}
                  disabled={isLoading}
                />

                <Textarea
                  id="task-initial-payment-notes"
                  name="initial_payment_notes"
                  label="Observaciones"
                  placeholder="Detalle del abono inicial…"
                  value={values.initial_payment_notes ?? ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.initial_payment_notes}
                  rows={3}
                  disabled={isLoading}
                  className="sm:col-span-2"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {customersError ? (
        <Alert variant="warning" title="No se pudo cargar el directorio de clientes">
          Puedes crear la tarea sin cliente e intentarlo de nuevo más tarde.
        </Alert>
      ) : null}

      {accountsError && hasInitialPayment && !isEditing ? (
        <Alert variant="warning" title="No se pudieron cargar las cuentas">
          Selecciona una cuenta activa antes de registrar el abono inicial.
        </Alert>
      ) : null}

      {errors.title ? (
        <Alert variant="error">Revisa los campos marcados antes de guardar la tarea.</Alert>
      ) : null}
    </form>
  );
}
