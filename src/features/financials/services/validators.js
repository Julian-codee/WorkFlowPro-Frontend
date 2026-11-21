/**
 * Validadores del módulo de Finanzas (movimientos, cuentas, cierres y ajustes).
 */

import {
  ADJUSTMENT_STATUSES,
  MOVEMENT_TYPES,
  PERIOD_STATUSES,
  parseISODate,
} from "../constants";

export function validateRequired(value, message) {
  return value === undefined || value === null || String(value).trim() === ""
    ? message
    : null;
}

export function validateConcept(value) {
  if (!value || !String(value).trim()) return "El concepto es obligatorio.";

  if (String(value).trim().length > 255) {
    return "El concepto no puede superar 255 caracteres.";
  }

  return null;
}

export function validateAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "El importe debe ser un número válido.";
  if (amount <= 0) return "El importe debe ser mayor que 0.";

  return null;
}

export function validateNonNegativeAmount(value, message = "El importe no puede ser negativo.") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "El importe debe ser un número válido.";
  if (amount < 0) return message;

  return null;
}

export function validateAccount(value) {
  return validateRequired(value, "Selecciona una cuenta financiera.");
}

export function validateCategory(value) {
  return validateRequired(value, "Selecciona una categoría.");
}

export function validateMovementDate(value) {
  if (!value) return "Indica la fecha del movimiento.";

  const date = parseISODate(value);

  if (!date || Number.isNaN(date.getTime())) return "Introduce una fecha válida.";

  return null;
}

export function validateNotes(value) {
  if (!value) return null;

  if (String(value).length > 500) return "Las observaciones no pueden superar 500 caracteres.";

  return null;
}

/**
 * FastAPI considera tardío un movimiento con fecha de al menos dos días
 * anterior al día UTC actual. El día anterior todavía se acepta sin motivo.
 */
export function isLateMovement(movementDate, referenceDate = new Date()) {
  if (!movementDate) return false;

  const movement = new Date(`${String(movementDate).slice(0, 10)}T00:00:00Z`);
  const reference = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  if (Number.isNaN(movement.getTime()) || Number.isNaN(reference.getTime())) return false;

  const yesterdayUtc = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate() - 1,
  );

  return movement.getTime() < yesterdayUtc;
}

/**
 * Valida el formulario completo de un movimiento.
 *
 * @param {{ type?: string }} values
 */
export function validateMovementForm(values = {}) {
  const errors = {
    type: validateRequired(values.type, "Selecciona el tipo de movimiento."),
    concept: validateConcept(values.concept),
    amount: validateAmount(values.amount),
    account_id: validateAccount(values.account_id),
    category: validateCategory(values.category),
    payment_method: validateRequired(values.payment_method, "Selecciona el método de pago."),
    movement_date: validateMovementDate(values.movement_date),
    description: validateNotes(values.description),
    reference:
      values.reference && String(values.reference).length > 255
        ? "La referencia no puede superar 255 caracteres."
        : null,
  };

  if (isLateMovement(values.movement_date)) {
    errors.late_entry_reason = validateRequired(
      values.late_entry_reason,
      "Justifica por qué se registra el movimiento con esta fecha.",
    );
  }

  return errors;
}

export function hasMovementErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cuentas
 * ────────────────────────────────────────────────────────────────────────── */

export function validateAccountForm(values = {}) {
  const errors = {
    name: validateRequired(values.name, "El nombre de la cuenta es obligatorio."),
    code: validateRequired(values.code, "El código de la cuenta es obligatorio."),
    type: validateRequired(values.type, "Selecciona el tipo de cuenta."),
    currency: validateRequired(values.currency, "Selecciona la moneda."),
    status: validateRequired(values.status, "Selecciona el estado de la cuenta."),
    description: validateNotes(values.description),
  };

  if (values.code && String(values.code).length > 20) {
    errors.code = "El código no puede superar 20 caracteres.";
  }

  return errors;
}

export function hasAccountErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cierres de caja y ajustes
 * ────────────────────────────────────────────────────────────────────────── */

export function validateClosureForm(values = {}) {
  return {
    expected_balance: Number.isFinite(Number(values.expected_balance))
      ? null
      : "El saldo esperado debe ser un número válido.",
    physical_balance: validateNonNegativeAmount(
      values.physical_balance,
      "El saldo real no puede ser negativo.",
    ),
    observations: validateNotes(values.observations),
  };
}

export function hasClosureErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

export function validateAdjustmentForm(values = {}) {
  const impact = Number(values.impact_on_balance);

  return {
    type: validateRequired(values.type, "Selecciona el tipo de ajuste."),
    movement_id: validateRequired(values.movement_id, "Selecciona el movimiento asociado."),
    amount: validateAmount(values.amount, "El importe del ajuste debe ser mayor que 0."),
    impact_on_balance: Number.isFinite(impact)
      ? null
      : "El impacto en saldo debe ser un número válido.",
    reason: validateRequired(values.reason, "Describe la causa del ajuste."),
  };
}

export function hasAdjustmentErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Restricciones sobre períodos y movimientos
 * ────────────────────────────────────────────────────────────────────────── */

/** Indica si un movimiento puede registrarse o editarse sobre un período. */
export function canModifyPeriod(period) {
  if (!period) return true;

  return period.status !== PERIOD_STATUSES.CLOSED;
}

/** Los movimientos vinculados a una tarea no se pueden eliminar desde Finanzas. */
export function canDeleteMovement(movement) {
  if (!movement) return false;

  return !movement.task_id;
}

export const ADJUSTMENT_STATUS_VALUES = Object.values(ADJUSTMENT_STATUSES);
export const MOVEMENT_TYPE_VALUES = Object.values(MOVEMENT_TYPES);
