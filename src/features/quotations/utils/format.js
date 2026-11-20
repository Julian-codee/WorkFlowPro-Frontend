/**
 * Utilidades de formato para el módulo de cotizaciones.
 */

/** Formatea una fecha ISO como dd/mm/aaaa. */
export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Formatea una fecha ISO como dd/mm/aaaa hh:mm. */
export function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Formatea un importe con el símbolo de moneda. */
export function formatCurrency(value, currency = "USD", { decimals = 2 } = {}) {
  const amount = Number(value ?? 0);

  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-ES")}`;
  }
}

/** Importe sin símbolo de moneda (para tablas densas). */
export function formatAmount(value, decimals = 2) {
  const amount = Number(value ?? 0);

  return amount.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
