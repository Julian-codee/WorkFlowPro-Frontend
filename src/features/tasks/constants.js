/**
 * Catálogos de estados, prioridades y pagos de tareas.
 *
 * Los valores coinciden con los enums reales del backend:
 *   TaskStatus, TaskPriority y PaymentStatus.
 */

export const TASK_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TASK_STATUS_LIST = [
  { value: TASK_STATUSES.PENDING, label: "Pendiente", tone: "neutral" },
  { value: TASK_STATUSES.IN_PROGRESS, label: "En curso", tone: "brand" },
  { value: TASK_STATUSES.IN_REVIEW, label: "En revisión", tone: "purple" },
  { value: TASK_STATUSES.COMPLETED, label: "Finalizada", tone: "success" },
  { value: TASK_STATUSES.CANCELLED, label: "Cancelada", tone: "danger" },
];

export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const TASK_PRIORITY_LIST = [
  { value: TASK_PRIORITIES.LOW, label: "Baja", tone: "neutral" },
  { value: TASK_PRIORITIES.MEDIUM, label: "Media", tone: "info" },
  { value: TASK_PRIORITIES.HIGH, label: "Alta", tone: "warning" },
  { value: TASK_PRIORITIES.URGENT, label: "Urgente", tone: "danger" },
];

export const TASK_STATUS_OPTIONS = TASK_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const TASK_PRIORITY_OPTIONS = TASK_PRIORITY_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const PAYMENT_STATUSES = {
  NO_PAYMENTS: "no_payments",
  PARTIALLY_PAID: "partially_paid",
  PAID: "paid",
};

export const PAYMENT_STATUS_LIST = [
  { value: PAYMENT_STATUSES.NO_PAYMENTS, label: "Sin abonos", tone: "warning" },
  { value: PAYMENT_STATUSES.PARTIALLY_PAID, label: "Parcialmente pagado", tone: "brand" },
  { value: PAYMENT_STATUSES.PAID, label: "Pagado", tone: "success" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "bank_transfer", label: "Transferencia bancaria" },
  { value: "card", label: "Tarjeta" },
  { value: "check", label: "Cheque" },
  { value: "digital_wallet", label: "Billetera digital" },
  { value: "crypto", label: "Criptomoneda" },
  { value: "other", label: "Otro" },
];

export const PAYMENT_METHOD_OPTIONS = PAYMENT_METHODS.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const TASK_SORT_OPTIONS = [
  { value: "priority", label: "Prioridad" },
  { value: "due_date", label: "Fecha de entrega" },
  { value: "created_at", label: "Fecha de creación" },
  { value: "pending_balance", label: "Saldo pendiente" },
];

/** Etiquetas legibles a partir del valor recibido del backend. */
export function getStatusMeta(value) {
  return (
    TASK_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin estado",
      tone: "neutral",
    }
  );
}

export function getPriorityMeta(value) {
  return (
    TASK_PRIORITY_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin prioridad",
      tone: "neutral",
    }
  );
}

export function getPaymentStatusMeta(value, totalPrice = null) {
  if (totalPrice === null || totalPrice === undefined || totalPrice === "") {
    return {
      value: value ?? PAYMENT_STATUSES.NO_PAYMENTS,
      label: "Sin precio asignado",
      tone: "neutral",
    };
  }

  return (
    PAYMENT_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin abonos",
      tone: "neutral",
    }
  );
}

/** El estado operativo no depende del estado financiero. */
export function isTaskFinalized(status) {
  return status === TASK_STATUSES.COMPLETED;
}
