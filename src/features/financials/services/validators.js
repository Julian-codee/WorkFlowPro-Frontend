/**
 * Validadores del módulo de Finanzas (movimientos, cuentas, cierres y ajustes).
 */

import {
  ADJUSTMENT_STATUSES,
  MOVEMENT_STATUSES,
  MOVEMENT_TYPES,
  PERIOD_STATUSES,
} from "../constants";
import { getWeekRange, parseISODate } from "../constants";

export function validateRequired(value, message) {
  return value === undefined || value === null || String(value).trim() === ""
    ? message
    : null;
}

export function validateConcept(value) {
  if (!value || !String(value).trim()) return "El concepto es obligatorio.";

  if (String(value).trim().length > 160) return "El concepto no puede superar 160 caracteres.";

  return null;
}

export function validateAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "El importe debe ser un número válido.";
  if (amount <= 0) return "El importe debe ser mayor que 0.";

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
 * Valida el formulario completo de un movimiento.
 *
 * @param {{ type?: string }} values
 */
export function validateMovementForm(values = {}) {
  return {
    type: validateRequired(values.type, "Selecciona el tipo de movimiento."),
    concept: validateConcept(values.concept),
    amount: validateAmount(values.amount),
    account_id: validateAccount(values.account_id),
    category: validateCategory(values.category),
    payment_method: validateRequired(values.payment_method, "Selecciona el método de pago."),
    movement_date: validateMovementDate(values.movement_date),
    notes: validateNotes(values.notes),
  };
}

export function hasMovementErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cuentas
 * ────────────────────────────────────────────────────────────────────────── */

export function validateAccountForm(values = {}) {
  return {
    name: validateRequired(values.name, "El nombre de la cuenta es obligatorio."),
    type: validateRequired(values.type, "Selecciona el tipo de cuenta."),
    currency: validateRequired(values.currency, "Selecciona la moneda."),
    opening_balance: validateAmount(values.opening_balance ?? 0, "El saldo inicial no puede ser negativo."),
    notes: validateNotes(values.notes),
  };
}

export function hasAccountErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cierres de caja y ajustes
 * ────────────────────────────────────────────────────────────────────────── */

export function validateClosureForm(values = {}) {
  const errors = {
    expected_cash: validateAmount(values.expected_cash ?? 0, "El saldo esperado debe ser mayor que 0."),
    actual_cash: validateAmount(values.actual_cash ?? 0, "El saldo real debe ser mayor que 0."),
    notes: validateNotes(values.notes),
  };

  if (values.responsible) {
    errors.responsible = validateRequired(values.responsible, "Indica el responsable del cierre.");
  }

  return errors;
}

export function hasClosureErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

export function validateAdjustmentForm(values = {}) {
  return {
    type: validateRequired(values.type, "Selecciona el tipo de diferencia."),
    amount: validateAmount(values.amount, "El importe de la diferencia debe ser mayor que 0."),
    reason: validateRequired(values.reason, "Describe la causa de la diferencia."),
    justification: validateRequired(
      values.justification,
      "Registra la justificación del ajuste.",
    ),
  };
}

export function hasAdjustmentErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Restricciones sobre períodos cerrados
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Indica si un movimiento puede registrarse o editarse sobre un período.
 * Los períodos cerrados solo admiten movimientos tardíos con justificación.
 */
export function canModifyPeriod(period) {
  if (!period) return true;

  return period.status !== PERIOD_STATUSES.CLOSED;
}

/** Un movimiento es "tardío" si su fecha es anterior a la semana en curso. */
export function isLateMovement(movementDate, referenceDate = new Date()) {
  const movement = parseISODate(movementDate);
  const reference = parseISODate(referenceDate);

  if (!movement || !reference) return false;

  const movementWeek = getWeekRange(movement);
  const referenceWeek = getWeekRange(reference);

  if (!movementWeek || !referenceWeek) return false;

  return movementWeek.key < referenceWeek.key;
}

/** Un movimiento no se puede eliminar si ya fue conciliado. */
export function canDeleteMovement(movement) {
  if (!movement) return false;

  return movement.status !== MOVEMENT_STATUSES.RECONCILED;
}

/** Un movimiento no se puede anular si pertenece a un período confirmado. */
export function canVoidMovement(movement) {
  if (!movement) return false;

  return movement.status === MOVEMENT_STATUSES.REGISTERED;
}

export const MOVEMENT_STATUS_VALUES = Object.values(MOVEMENT_STATUSES);
export const ADJUSTMENT_STATUS_VALUES = Object.values(ADJUSTMENT_STATUSES);
export const MOVEMENT_TYPE_VALUES = Object.values(MOVEMENT_TYPES);
