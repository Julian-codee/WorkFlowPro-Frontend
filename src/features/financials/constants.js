/**
 * Catálogos, estados y helpers de cálculo del módulo de Finanzas.
 *
 * ⚠️ Los valores son una propuesta de UI: ajústalos al enum real del backend
 * (FastAPI) cuando conectes los endpoints de /financial.
 */

/** Moneda de referencia del módulo. */
export const FINANCIAL_CURRENCY = "COP";

/* ──────────────────────────────────────────────────────────────────────────
 * Cuentas financieras
 * ────────────────────────────────────────────────────────────────────────── */

export const ACCOUNT_TYPES = {
  CASH: "cash",
  BANK: "bank",
  DIGITAL_WALLET: "digital_wallet",
  SAVINGS: "savings",
  OTHER: "other",
};

export const ACCOUNT_TYPE_LIST = [
  { value: ACCOUNT_TYPES.CASH, label: "Caja", shortLabel: "Caja", tone: "success" },
  { value: ACCOUNT_TYPES.BANK, label: "Banco", shortLabel: "Banco", tone: "info" },
  {
    value: ACCOUNT_TYPES.DIGITAL_WALLET,
    label: "Billetera digital",
    shortLabel: "Billetera",
    tone: "purple",
  },
  { value: ACCOUNT_TYPES.SAVINGS, label: "Ahorro / fondo", shortLabel: "Ahorro", tone: "warning" },
  { value: ACCOUNT_TYPES.OTHER, label: "Otra cuenta", shortLabel: "Otra", tone: "neutral" },
];

export const ACCOUNT_TYPE_OPTIONS = ACCOUNT_TYPE_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const ACCOUNT_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
};

export const ACCOUNT_STATUS_LIST = [
  { value: ACCOUNT_STATUSES.ACTIVE, label: "Activa", tone: "success" },
  { value: ACCOUNT_STATUSES.ARCHIVED, label: "Archivada", tone: "neutral" },
];

export const ACCOUNT_STATUS_OPTIONS = ACCOUNT_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

/* ──────────────────────────────────────────────────────────────────────────
 * Movimientos
 * ────────────────────────────────────────────────────────────────────────── */

export const MOVEMENT_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "transfer",
};

export const MOVEMENT_TYPE_LIST = [
  { value: MOVEMENT_TYPES.INCOME, label: "Ingreso", shortLabel: "Ingreso", tone: "success" },
  { value: MOVEMENT_TYPES.EXPENSE, label: "Egreso", shortLabel: "Egreso", tone: "danger" },
  { value: MOVEMENT_TYPES.TRANSFER, label: "Transferencia", shortLabel: "Transferencia", tone: "info" },
];

export const MOVEMENT_TYPE_OPTIONS = MOVEMENT_TYPE_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const INCOME_CATEGORIES = [
  { value: "sales", label: "Ventas" },
  { value: "services", label: "Servicios" },
  { value: "products", label: "Productos" },
  { value: "investments", label: "Inversiones" },
  { value: "other_income", label: "Otros ingresos" },
];

export const EXPENSE_CATEGORIES = [
  { value: "rent", label: "Alquiler" },
  { value: "utilities", label: "Servicios básicos" },
  { value: "payroll", label: "Planilla" },
  { value: "supplies", label: "Suministros" },
  { value: "marketing", label: "Marketing" },
  { value: "transport", label: "Transporte" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "taxes", label: "Impuestos" },
  { value: "loans", label: "Préstamos" },
  { value: "other_expense", label: "Otros gastos" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "bank_transfer", label: "Transferencia bancaria" },
  { value: "card", label: "Tarjeta" },
  { value: "check", label: "Cheque" },
  { value: "digital_wallet", label: "Billetera digital" },
  { value: "crypto", label: "Cripto" },
  { value: "other", label: "Otro" },
];

export const PAYMENT_METHOD_OPTIONS = PAYMENT_METHODS.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const MOVEMENT_STATUSES = {
  REGISTERED: "registered",
  LATE: "late",
};

export const MOVEMENT_STATUS_LIST = [
  { value: MOVEMENT_STATUSES.REGISTERED, label: "Registrado", tone: "info" },
  { value: MOVEMENT_STATUSES.LATE, label: "Registro tardío", tone: "warning" },
];

export const MOVEMENT_STATUS_OPTIONS = MOVEMENT_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

/** Categorías según el tipo de movimiento. */
export function getCategoriesForType(type) {
  return type === MOVEMENT_TYPES.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryLabel(category) {
  const all = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  return all.find((item) => item.value === category)?.label ?? category ?? "Sin categoría";
}

/* ──────────────────────────────────────────────────────────────────────────
 * Períodos semanales y cierres
 * ────────────────────────────────────────────────────────────────────────── */

export const PERIOD_STATUSES = {
  OPEN: "open",
  CLOSING: "closing",
  CLOSED: "closed",
  ADJUSTED: "adjusted",
};

export const PERIOD_STATUS_LIST = [
  { value: PERIOD_STATUSES.OPEN, label: "Abierta", tone: "success" },
  { value: PERIOD_STATUSES.CLOSING, label: "En cierre", tone: "warning" },
  { value: PERIOD_STATUSES.CLOSED, label: "Cerrada", tone: "neutral" },
  { value: PERIOD_STATUSES.ADJUSTED, label: "Ajustada", tone: "info" },
];

export const CLOSURE_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ADJUSTED: "adjusted",
  DISPUTED: "disputed",
};

export const CLOSURE_STATUS_LIST = [
  { value: CLOSURE_STATUSES.PENDING, label: "En revisión", tone: "warning" },
  { value: CLOSURE_STATUSES.CONFIRMED, label: "Confirmado", tone: "success" },
  { value: CLOSURE_STATUSES.ADJUSTED, label: "Ajustado", tone: "info" },
  { value: CLOSURE_STATUSES.DISPUTED, label: "En disputa", tone: "danger" },
];

export const ADJUSTMENT_TYPES = {
  LATE_INCOME: "late_income",
  LATE_EXPENSE: "late_expense",
  CORRECTION: "correction",
  DISCREPANCY: "discrepancy",
};

export const ADJUSTMENT_TYPE_LIST = [
  { value: ADJUSTMENT_TYPES.LATE_INCOME, label: "Ingreso tardío", tone: "success" },
  { value: ADJUSTMENT_TYPES.LATE_EXPENSE, label: "Egreso tardío", tone: "danger" },
  { value: ADJUSTMENT_TYPES.CORRECTION, label: "Corrección", tone: "info" },
  { value: ADJUSTMENT_TYPES.DISCREPANCY, label: "Diferencia de caja", tone: "warning" },
];

export const ADJUSTMENT_STATUSES = {
  PENDING: "pending",
  RESOLVED: "resolved",
};

export const ADJUSTMENT_STATUS_LIST = [
  { value: ADJUSTMENT_STATUSES.PENDING, label: "Pendiente", tone: "warning" },
  { value: ADJUSTMENT_STATUSES.RESOLVED, label: "Resuelto", tone: "success" },
];

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers de estado
 * ────────────────────────────────────────────────────────────────────────── */

export function getAccountTypeMeta(value) {
  return (
    ACCOUNT_TYPE_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin tipo",
      shortLabel: value ?? "—",
      tone: "neutral",
    }
  );
}

export function getMovementTypeMeta(value) {
  return (
    MOVEMENT_TYPE_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin tipo",
      shortLabel: value ?? "—",
      tone: "neutral",
    }
  );
}

export function getPeriodStatusMeta(value) {
  return (
    PERIOD_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin estado",
      tone: "neutral",
    }
  );
}

export function getClosureStatusMeta(value) {
  return (
    CLOSURE_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin estado",
      tone: "neutral",
    }
  );
}

export function getAdjustmentTypeMeta(value) {
  return (
    ADJUSTMENT_TYPE_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin tipo",
      tone: "neutral",
    }
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Semanas (lunes a domingo) y calendario
 * ────────────────────────────────────────────────────────────────────────── */

/** Convierte "YYYY-MM-DD" en Date local (evita el corrimiento de zona horaria). */
export function parseISODate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

/** Formatea un Date como "YYYY-MM-DD" en hora local. */
export function toISODate(date) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Lunes de la semana a la que pertenece la fecha. */
export function getWeekStart(date) {
  const parsed = parseISODate(date);

  if (!parsed) return null;

  const day = parsed.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const start = new Date(parsed);
  start.setDate(parsed.getDate() + diff);

  return start;
}

/** Domingo de la semana a la que pertenece la fecha. */
export function getWeekEnd(date) {
  const start = getWeekStart(date);

  if (!start) return null;

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return end;
}

/** Clave estable de la semana: la fecha de su lunes ("YYYY-MM-DD"). */
export function getWeekKey(date) {
  return toISODate(getWeekStart(date));
}

/** Rango completo de la semana (lunes a domingo). */
export function getWeekRange(date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);

  if (!start || !end) return null;

  return { start: toISODate(start), end: toISODate(end), key: toISODate(start) };
}

/** Número de semana ISO (solo para etiquetar). */
export function getIsoWeekNumber(date) {
  const parsed = parseISODate(date);

  if (!parsed) return 0;

  const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7),
  );

  return 1 + Math.round((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
}

/** Etiqueta corta del mes: "nov 2026". */
export function getMonthLabel(year, month) {
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(date);
}

/**
 * Construye la matriz del calendario mensual.
 *
 * Devuelve semanas (lunes → domingo). Cada celda trae la fecha, si pertenece
 * al mes, y el resumen de ingresos/egresos del día.
 *
 * @param {{ year: number, month: number, summaries?: Record<string, { income: number, expense: number, count: number }> }} options
 */
export function buildMonthMatrix({ year, month, summaries = {} } = {}) {
  if (!year || !month) return [];

  const first = new Date(year, month - 1, 1);
  const gridStart = getWeekStart(first);

  const weeks = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const weekStart = new Date(gridStart);
    weekStart.setDate(gridStart.getDate() + weekIndex * 7);

    const days = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);

      const iso = toISODate(date);
      const summary = summaries[iso] ?? { income: 0, expense: 0, count: 0 };

      days.push({
        date: iso,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month - 1 && date.getFullYear() === year,
        isToday: iso === toISODate(new Date()),
        income: summary.income ?? 0,
        expense: summary.expense ?? 0,
        count: summary.count ?? 0,
      });
    }

    weeks.push({
      key: toISODate(weekStart),
      start: toISODate(weekStart),
      end: toISODate(getWeekEnd(weekStart)),
      number: getIsoWeekNumber(weekStart),
      days,
    });
  }

  return weeks;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cálculos financieros
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Acumula ingresos, egresos y balance de un conjunto de movimientos.
 * Los acumuladores de la semana parten de cero en cada lunes (reinicio semanal).
 */
export function summarizeMovements(movements = []) {
  let income = 0;
  let expense = 0;

  for (const movement of movements) {
    if (!movement || movement.status === MOVEMENT_STATUSES.VOID) continue;

    const amount = Number(movement.amount ?? 0);

    if (movement.type === MOVEMENT_TYPES.INCOME) income += amount;
    else if (movement.type === MOVEMENT_TYPES.EXPENSE) expense += amount;
  }

  return {
    income: round(income),
    expense: round(expense),
    balance: round(income - expense),
    count: movements.length,
  };
}

/** Acumuladores de una semana (se reinician en cero cada lunes). */
export function calculateWeekAccumulator(movements = []) {
  const summary = summarizeMovements(movements);

  return {
    weekIncome: summary.income,
    weekExpense: summary.expense,
    weekBalance: summary.balance,
    movementCount: summary.count,
  };
}

/** Signo visual de un importe según el tipo de movimiento. */
export function getMovementSign(type) {
  if (type === MOVEMENT_TYPES.INCOME) return "+";
  if (type === MOVEMENT_TYPES.TRANSFER) return "↔";
  return "−";
}

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
