/**
 * Validadores del formulario de cotizaciones (alta y edición).
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const QUOTATION_TITLE_MIN_LENGTH = 3;
export const QUOTATION_TITLE_MAX_LENGTH = 160;
export const QUOTATION_NOTES_MAX_LENGTH = 1000;
export const QUOTATION_ITEM_DESCRIPTION_MAX_LENGTH = 240;

export function validateRequired(value, message) {
  return value === undefined || value === null || String(value).trim() === ""
    ? message
    : null;
}

export function validateQuotationTitle(value) {
  if (!value || !String(value).trim()) return "El concepto de la cotización es obligatorio.";

  const title = String(value).trim();

  if (title.length < QUOTATION_TITLE_MIN_LENGTH) {
    return `El concepto debe tener al menos ${QUOTATION_TITLE_MIN_LENGTH} caracteres.`;
  }

  if (title.length > QUOTATION_TITLE_MAX_LENGTH) {
    return `El concepto no puede superar ${QUOTATION_TITLE_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateCustomer(value) {
  return validateRequired(value, "Selecciona un cliente para la cotización.");
}

export function validateValidUntil(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Introduce una fecha válida.";
  }

  return null;
}

export function validateItemDescription(value) {
  if (!value || !String(value).trim()) {
    return "Describe el concepto de la línea.";
  }

  if (String(value).trim().length > QUOTATION_ITEM_DESCRIPTION_MAX_LENGTH) {
    return `La descripción no puede superar ${QUOTATION_ITEM_DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateItemQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "La cantidad debe ser mayor que 0.";
  }

  return null;
}

export function validateItemUnitPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    return "El precio unitario no puede ser negativo.";
  }

  return null;
}

export function validateItemDiscount(value) {
  const discount = Number(value ?? 0);

  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return "El descuento debe estar entre 0 y 100.";
  }

  return null;
}

export function validateItemTaxRate(value) {
  const rate = Number(value ?? 0);

  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return "El impuesto debe estar entre 0 y 100.";
  }

  return null;
}

/**
 * Valida el formulario completo de cotización.
 *
 * @param {{ items?: object[] }} values
 */
export function validateQuotationForm(values = {}) {
  const items = Array.isArray(values.items) ? values.items : [];

  const errors = {
    title: validateQuotationTitle(values.title),
    customer_id: validateCustomer(values.customer_id),
    valid_until: validateValidUntil(values.valid_until),
  };

  if (items.length === 0) {
    errors.items = "Añade al menos una línea a la cotización.";
  } else {
    errors.items = null;
  }

  const itemErrors = items.map((item) => ({
    description: validateItemDescription(item.description),
    quantity: validateItemQuantity(item.quantity),
    unit_price: validateItemUnitPrice(item.unit_price),
    discount: validateItemDiscount(item.discount),
    tax_rate: validateItemTaxRate(item.tax_rate),
  }));

  const hasItemErrors = itemErrors.some((entry) => Object.values(entry).some(Boolean));

  return { ...errors, item_errors: hasItemErrors ? itemErrors : [] };
}

export function hasQuotationErrors(errors = {}) {
  return Object.entries(errors).some(([key, value]) => {
    if (key === "item_errors") return Array.isArray(value) && value.length > 0;
    return Boolean(value);
  });
}
