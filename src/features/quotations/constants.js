/**
 * Catálogo de estados, tipos y monedas de cotización.
 *
 * ⚠️ Los valores son una propuesta de UI: ajústalos al enum real del backend
 * (FastAPI) cuando conectes los endpoints de /quotations.
 */

export const QUOTATION_STATUSES = {
  DRAFT: "draft",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

export const QUOTATION_STATUS_LIST = [
  { value: QUOTATION_STATUSES.DRAFT, label: "Borrador", tone: "neutral" },
  { value: QUOTATION_STATUSES.SENT, label: "Enviada", tone: "brand" },
  { value: QUOTATION_STATUSES.ACCEPTED, label: "Aceptada", tone: "success" },
  { value: QUOTATION_STATUSES.REJECTED, label: "Rechazada", tone: "danger" },
  { value: QUOTATION_STATUSES.EXPIRED, label: "Vencida", tone: "warning" },
  { value: QUOTATION_STATUSES.CANCELLED, label: "Cancelada", tone: "neutral" },
];

export const QUOTATION_TYPES = {
  NATURAL: "natural",
  LEGAL: "legal",
};

export const QUOTATION_TYPE_LIST = [
  { value: QUOTATION_TYPES.NATURAL, label: "Persona natural", shortLabel: "Natural", tone: "info" },
  { value: QUOTATION_TYPES.LEGAL, label: "Persona jurídica", shortLabel: "Jurídica", tone: "purple" },
];

export const QUOTATION_CURRENCIES = [
  { value: "USD", label: "USD · Dólar americano" },
  { value: "PEN", label: "PEN · Sol peruano" },
  { value: "EUR", label: "EUR · Euro" },
];

/** Tasas de impuesto habituales (la real la define el backend). */
export const QUOTATION_TAX_RATES = [
  { value: "0", label: "Sin impuesto (0%)" },
  { value: "5", label: "5%" },
  { value: "10", label: "10%" },
  { value: "18", label: "18% (IGV)" },
  { value: "21", label: "21%" },
];

export const QUOTATION_STATUS_OPTIONS = QUOTATION_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const QUOTATION_TYPE_OPTIONS = QUOTATION_TYPE_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

/** Etiqueta legible a partir del valor recibido del backend. */
export function getQuotationStatusMeta(value) {
  return (
    QUOTATION_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin estado",
      tone: "neutral",
    }
  );
}

export function getQuotationTypeMeta(value) {
  return (
    QUOTATION_TYPE_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin tipo",
      shortLabel: value ?? "—",
      tone: "neutral",
    }
  );
}

/**
 * Acciones disponibles según el estado de la cotización.
 * Refleja el flujo del backend: send (draft→sent), accept, reject…
 */
export function getQuotationActions(status) {
  const isDraft = status === QUOTATION_STATUSES.DRAFT;
  const isSent = status === QUOTATION_STATUSES.SENT;
  const isClosed =
    status === QUOTATION_STATUSES.ACCEPTED ||
    status === QUOTATION_STATUSES.REJECTED ||
    status === QUOTATION_STATUSES.CANCELLED;

  return {
    canEdit: isDraft,
    canSend: isDraft,
    canAccept: isSent,
    canReject: isSent,
    canDuplicate: !isClosed,
    canConvert: isSent || status === QUOTATION_STATUSES.ACCEPTED,
    canArchive: !isClosed,
  };
}

/** Calcula los totales de una cotización a partir de sus ítems. */
export function calculateQuotationTotals(items = [], currency = "USD") {
  const parsed = items.map((item) => ({
    quantity: Number(item.quantity ?? 0) || 0,
    unitPrice: Number(item.unit_price ?? 0) || 0,
    discount: Number(item.discount ?? 0) || 0,
    taxRate: Number(item.tax_rate ?? 0) || 0,
  }));

  const subtotal = parsed.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const discountTotal = parsed.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice * (item.discount / 100),
    0,
  );
  const taxable = subtotal - discountTotal;
  const taxTotal = parsed.reduce((acc, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineDiscount = lineSubtotal * (item.discount / 100);
    return acc + (lineSubtotal - lineDiscount) * (item.taxRate / 100);
  }, 0);

  return {
    currency,
    subtotal: round(subtotal),
    discount_total: round(discountTotal),
    tax_total: round(taxTotal),
    total: round(taxable + taxTotal),
  };
}

/** Total de una línea (sin descuento ni impuesto). */
export function calculateLineTotal(item = {}) {
  const quantity = Number(item.quantity ?? 0) || 0;
  const unitPrice = Number(item.unit_price ?? 0) || 0;
  const discount = Number(item.discount ?? 0) || 0;
  const taxRate = Number(item.tax_rate ?? 0) || 0;

  const lineSubtotal = quantity * unitPrice;
  const lineDiscount = lineSubtotal * (discount / 100);
  const taxable = lineSubtotal - lineDiscount;
  const tax = taxable * (taxRate / 100);

  return {
    subtotal: round(lineSubtotal),
    discount: round(lineDiscount),
    tax: round(tax),
    total: round(taxable + tax),
  };
}

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
