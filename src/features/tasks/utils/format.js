const CURRENCY_FORMATTERS = new Map();

/** Formatea un importe usando la moneda de la cuenta o el tenant. */
export function formatMoney(value, currency = "PEN") {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "—";

  const normalizedCurrency = String(currency || "PEN").toUpperCase();
  let formatter = CURRENCY_FORMATTERS.get(normalizedCurrency);

  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      formatter = new Intl.NumberFormat("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    CURRENCY_FORMATTERS.set(normalizedCurrency, formatter);
  }

  return formatter.format(amount);
}

export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

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

/** Una tarea está vencida cuando su fecha límite ya pasó y sigue operativa. */
export function isTaskOverdue(task) {
  if (!task?.due_date) return false;
  if (task.status === "completed" || task.status === "cancelled") return false;

  const dueDate = new Date(task.due_date);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

/** Etiqueta del responsable sin inventar nombres cuando solo existe el id. */
export function getAssigneeLabel(task) {
  const name = task?.assignee_name || task?.assignee;

  if (typeof name === "string" && name.trim()) return name;
  if (task?.assignee_id) return "Responsable asignado";
  return "Sin asignar";
}

/** Recorta una descripción sin cortar palabras cuando es posible. */
export function summarizeDescription(value, maxLength = 120) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");

  if (!text || text.length <= maxLength) return text;

  const shortened = text.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(" ");

  return `${shortened.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength).trim()}…`;
}

/** Convierte un campo date de HTML en el datetime ISO que espera FastAPI. */
export function toApiDateTime(value, endOfDay = false) {
  if (!value) return null;

  const datePart = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const suffix = endOfDay ? "T23:59:59.000Z" : "T00:00:00.000Z";
  const date = new Date(`${datePart}${suffix}`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Fecha local YYYY-MM-DD usada por los inputs. */
export function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Extrae una referencia guardada por el backend dentro del concepto. */
export function extractPaymentReference(payment) {
  if (payment?.reference) return payment.reference;

  const concept = String(payment?.concept ?? "");
  const match = concept.match(/\(Ref:\s*([^)]+)\)\s*$/i);

  return match?.[1] ?? "";
}
