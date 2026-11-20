/**
 * Validadores del formulario de tareas y del registro de abonos.
 * Se reutilizan en alta, edición, detalle y Pagos pendientes.
 */

export const TASK_TITLE_MIN_LENGTH = 3;
export const TASK_TITLE_MAX_LENGTH = 255;
export const TASK_DESCRIPTION_MAX_LENGTH = 1000;
export const TASK_REFERENCE_MAX_LENGTH = 255;

export function validateTaskTitle(title) {
  const value = (title ?? "").trim();

  if (!value) {
    return "El nombre del trabajo es obligatorio.";
  }

  if (value.length < TASK_TITLE_MIN_LENGTH) {
    return `El nombre debe tener al menos ${TASK_TITLE_MIN_LENGTH} caracteres.`;
  }

  if (value.length > TASK_TITLE_MAX_LENGTH) {
    return `El nombre no puede superar ${TASK_TITLE_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateTaskDescription(description) {
  const value = (description ?? "").trim();

  if (value.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return `La descripción no puede superar ${TASK_DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateDueDate(dueDate) {
  if (!dueDate) return null;

  if (Number.isNaN(new Date(dueDate).getTime())) {
    return "Introduce una fecha válida.";
  }

  return null;
}

export function validateTotalPrice(value) {
  if (value === "" || value === null || value === undefined) return null;

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Introduce un precio válido.";
  }

  if (amount < 0) {
    return "El precio no puede ser negativo.";
  }

  return null;
}

export function validateInitialPayment(values = {}) {
  const amountValue = values.initial_payment_amount;
  const hasAmount = amountValue !== "" && amountValue !== null && amountValue !== undefined;

  if (!hasAmount) return null;

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "El abono inicial debe ser mayor que cero.";
  }

  const hasPrice = values.total_price !== "" && values.total_price !== null && values.total_price !== undefined;
  if (!hasPrice) {
    return "Indica el precio total antes de registrar un abono inicial.";
  }

  const totalPrice = Number(values.total_price);

  if (Number.isFinite(totalPrice) && amount > totalPrice) {
    return "El abono inicial no puede superar el precio total.";
  }

  return null;
}

export function validateTaskForm(values = {}, { isEditing = false, totalPaid = 0 } = {}) {
  const totalPriceError = validateTotalPrice(values.total_price);
  const totalPrice = values.total_price === "" ? null : Number(values.total_price);
  const hasInitialPayment =
    values.initial_payment_amount !== "" &&
    values.initial_payment_amount !== null &&
    values.initial_payment_amount !== undefined;

  return {
    title: validateTaskTitle(values.title),
    description: validateTaskDescription(values.description),
    due_date: validateDueDate(values.due_date),
    customer_id: null,
    total_price:
      totalPriceError ||
      (isEditing && totalPrice !== null && totalPrice < Number(totalPaid ?? 0)
        ? `El precio no puede ser inferior al total ya abonado (${Number(totalPaid ?? 0)}).`
        : null),
    initial_payment_amount: isEditing ? null : validateInitialPayment(values),
    initial_payment_account_id:
      isEditing || !hasInitialPayment
        ? null
        : values.initial_payment_account_id
          ? null
          : "Selecciona la cuenta que recibirá el abono inicial.",
    initial_payment_method:
      isEditing || !hasInitialPayment
        ? null
        : values.initial_payment_method
          ? null
          : "Selecciona el método de pago del abono inicial.",
    initial_payment_date:
      isEditing || !hasInitialPayment
        ? null
        : values.initial_payment_date
          ? validateDueDate(values.initial_payment_date)
          : "Indica la fecha del abono inicial.",
    initial_payment_reference:
      isEditing || !hasInitialPayment
        ? null
        : (values.initial_payment_reference ?? "").length > TASK_REFERENCE_MAX_LENGTH
          ? `La referencia no puede superar ${TASK_REFERENCE_MAX_LENGTH} caracteres.`
          : null,
  };
}

export function hasTaskErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}

export function validatePaymentAmount(amount, pendingBalance) {
  if (amount === "" || amount === null || amount === undefined) {
    return "Ingresa el valor del abono.";
  }

  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return "El abono debe ser mayor que cero.";
  }

  if (value > Number(pendingBalance ?? 0)) {
    return "El abono no puede superar el saldo pendiente.";
  }

  return null;
}

export function validatePaymentForm(
  values = {},
  pendingBalance = 0,
  { requiresJustification = false } = {},
) {
  return {
    amount: validatePaymentAmount(values.amount, pendingBalance),
    cash_account_id: values.cash_account_id ? null : "Selecciona la cuenta receptora.",
    payment_method: values.payment_method ? null : "Selecciona el método de pago.",
    transaction_date: values.transaction_date
      ? validateDueDate(values.transaction_date)
      : "Indica la fecha del pago.",
    reference:
      (values.reference ?? "").length > TASK_REFERENCE_MAX_LENGTH
        ? `La referencia no puede superar ${TASK_REFERENCE_MAX_LENGTH} caracteres.`
        : null,
    notes:
      requiresJustification && !(values.notes ?? "").trim()
        ? "Justifica el pago en un período ya cerrado."
        : null,
  };
}

export function hasPaymentErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}
