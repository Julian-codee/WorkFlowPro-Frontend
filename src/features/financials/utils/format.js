/**
 * Utilidades de formato del módulo de Finanzas.
 */

import { FINANCIAL_CURRENCY } from "../constants";

/** Formatea un importe con símbolo de moneda. */
export function formatMoney(value, currency = FINANCIAL_CURRENCY, { decimals = 2 } = {}) {
  const amount = Number(value ?? 0);

  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-PE")}`;
  }
}

/** Importe con signo explícito (+ / −) para listados de movimientos. */
export function formatSignedMoney(value, type, currency = FINANCIAL_CURRENCY) {
  const amount = Number(value ?? 0);
  const prefix = type === "income" ? "+" : "−";

  return `${prefix}${formatMoney(Math.abs(amount), currency)}`;
}

/** Importe sin símbolo de moneda (para tablas densas). */
export function formatAmount(value, decimals = 2) {
  return Number(value ?? 0).toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Fecha en formato dd/mm/yyyy. */
export function formatDate(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : parseDate(value);

  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Fecha corta dd/mm. */
export function formatShortDate(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : parseDate(value);

  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(date);
}

/** Fecha y hora dd/mm/yyyy hh:mm. */
export function formatDateTime(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : parseDate(value);

  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Hora hh:mm. */
export function formatTime(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : parseDate(value);

  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** Etiqueta de la semana: "10 – 16 nov 2026". */
export function formatWeekRange(start, end) {
  if (!start || !end) return "—";

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate) return "—";

  const dayFormatter = new Intl.DateTimeFormat("es-ES", { day: "2-digit" });
  const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "short" });

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    return `${dayFormatter.format(startDate)} – ${dayFormatter.format(endDate)} ${monthFormatter.format(endDate)} ${endDate.getFullYear()}`;
  }

  return `${dayFormatter.format(startDate)} ${monthFormatter.format(startDate)} – ${dayFormatter.format(endDate)} ${monthFormatter.format(endDate)} ${endDate.getFullYear()}`;
}

/** Etiqueta larga del día: "lunes, 16 de noviembre de 2026". */
export function formatLongDate(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : parseDate(value);

  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Porcentaje con decimales. */
export function formatPercent(value, decimals = 0) {
  return `${Number(value ?? 0).toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * Convierte una fecha en Date local.
 *
 * Acepta "YYYY-MM-DD" y también marcas de tiempo ISO ("YYYY-MM-DDTHH:mm:ssZ").
 * En las marcas de tiempo se conserva la fecha y la hora tal como se registran,
 * sin aplicar la conversión de zona horaria: así el "hora de registro" que
 * muestra la interfaz es exactamente la que dejó el usuario.
 */
export function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  const [datePart, timePart] = String(value).split("T");
  const [year, month, day] = datePart.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  if (!timePart) return new Date(year, month - 1, day);

  const timeOnly = timePart.replace(/[Zz]$/, "");
  const [hours = 0, minutes = 0, seconds = 0] = timeOnly.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds);
}
