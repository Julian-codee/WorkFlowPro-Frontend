/**
 * Servicio de Finanzas de WorkFlowPro.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  MODO MOCK: todavía NO se consumen los endpoints del backend.
 *
 * Todas las funciones tienen marcada la petición real que falta por
 * implementar. Para activar la integración basta con sustituir el cuerpo
 * `mock*` por la llamada marcada en cada función.
 *
 * Contrato del backend (FastAPI, prefijo /financial):
 *   GET    /financial/accounts                  → listar cuentas
 *   POST   /financial/accounts                  → crear cuenta
 *   GET    /financial/accounts/{id}             → obtener cuenta
 *   PATCH  /financial/accounts/{id}             → actualizar cuenta
 *   GET    /financial/movements                 → listar movimientos (filtros)
 *   POST   /financial/movements                 → crear movimiento
 *   GET    /financial/movements/{id}            → obtener movimiento
 *   PATCH  /financial/movements/{id}            → actualizar movimiento
 *   DELETE /financial/movements/{id}            → eliminar movimiento
 *   GET    /financial/calendar/{year}/{month}   → calendario mensual
 *   GET    /financial/daily-summary             → resúmenes por rango de fechas
 *   GET    /financial/periods                   → listar períodos semanales
 *   POST   /financial/periods                   → crear período
 *   GET    /financial/periods/current           → período en curso
 *   GET    /financial/periods/{id}              → obtener período
 *   PATCH  /financial/periods/{id}              → actualizar período
 *   POST   /financial/periods/{id}/close        → cerrar período
 *   GET    /financial/periods/{id}/summary      → resumen completo del período
 *   GET    /financial/closures                  → listar cierres
 *   POST   /financial/closures                  → crear cierre
 *   GET    /financial/closures/{id}             → obtener cierre
 *   PATCH  /financial/closures/{id}             → actualizar cierre
 *   GET    /financial/closures/by-period/{period_id} → cierre de un período
 *   POST   /financial/closures/{id}/confirm     → confirmar cierre
 *   GET    /financial/closures/{id}/adjustments → ajustes del cierre
 *   POST   /financial/closures/{id}/adjustments → registrar ajuste
 *   PATCH  /financial/adjustments/{id}          → resolver ajuste
 *   GET    /financial/closures-history          → historial de cierres
 *
 * Todas las rutas requieren `Authorization: Bearer <access_token>`
 * (el cliente HTTP de `src/lib/api` ya lo añade automáticamente).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { del, get, patch, post } from "@/lib/api";

import {
  CLOSURE_STATUSES,
  MOVEMENT_STATUSES,
  MOVEMENT_TYPES,
  PERIOD_STATUSES,
  getWeekKey,
  getWeekRange,
  summarizeMovements,
  toISODate,
  parseISODate,
} from "../constants";
import {
  MOCK_ACCOUNTS,
  MOCK_CLOSURES,
  MOCK_MOVEMENTS,
  MOCK_PERIODS,
  MOCK_TODAY,
} from "./mockData";

/** Latencia simulada para que los estados de carga sean visibles. */
function mockDelay(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ──────────────────────────────────────────────────────────────────────────
 * Store en memoria
 * ────────────────────────────────────────────────────────────────────────── */

let mockAccounts = MOCK_ACCOUNTS.map((account) => ({ ...account }));
let mockMovements = MOCK_MOVEMENTS.map((movement) => ({ ...movement }));
let mockPeriods = MOCK_PERIODS.map((period) => ({ ...period }));
let mockClosures = MOCK_CLOSURES.map((closure) => ({
  ...closure,
  adjustments: closure.adjustments.map((adjustment) => ({ ...adjustment })),
}));

let movementSequence = mockMovements.length;
let accountSequence = mockAccounts.length;
let closureSequence = mockClosures.length;

// Los saldos de las cuentas y los acumuladores de cada semana parten ya
// calculados a partir de los movimientos simulados.
syncStore();

function cloneMovement(movement) {
  return { ...movement };
}

function cloneAccount(account) {
  return { ...account };
}

function clonePeriod(period) {
  return { ...period };
}

function cloneClosure(closure) {
  return {
    ...closure,
    adjustments: closure.adjustments.map((adjustment) => ({ ...adjustment })),
  };
}

function notFound(entity, id) {
  const error = new Error(`No encontramos ${entity} solicitado.`);
  error.code = "FINANCIAL_NOT_FOUND";
  error.status = 404;
  error.id = id;
  return error;
}

function todayISO() {
  return toISODate(new Date());
}

/**
 * Recalcula los saldos de las cuentas a partir de los movimientos.
 * El saldo de una cuenta = saldo inicial + ingresos − egresos de esa cuenta.
 */
function recalculateBalances() {
  mockAccounts = mockAccounts.map((account) => {
    const movements = mockMovements.filter(
      (movement) => movement.account_id === account.id && movement.status !== MOVEMENT_STATUSES.VOID,
    );

    const summary = summarizeMovements(movements);
    const balance = Number(account.opening_balance ?? 0) + summary.balance;

    return { ...account, balance: Math.round((balance + Number.EPSILON) * 100) / 100 };
  });
}

/** Ids de las cuentas de efectivo que componen el arqueo de caja. */
function getCashAccountIds() {
  return new Set(
    mockAccounts
      .filter((account) => account.type === "cash" && account.status === "active")
      .map((account) => account.id),
  );
}

function round2(value) {
  return Math.round((Number(value ?? 0) + Number.EPSILON) * 100) / 100;
}

/**
 * Recalcula los acumuladores de cada período semanal.
 * Los acumuladores se reinician en cero cada lunes (reinicio semanal automático).
 *
 * Además distingue los totales de la semana (todas las cuentas) de los
 * movimientos de efectivo que alimentan el arqueo de caja.
 */
function recalculatePeriods() {
  const cashAccountIds = getCashAccountIds();

  const ordered = [...mockPeriods].sort((a, b) => (a.week_key < b.week_key ? -1 : 1));

  // Saldo de caja con el que arranca la primera semana simulada.
  let cashOpening = mockAccounts
    .filter((account) => cashAccountIds.has(account.id))
    .reduce((acc, account) => acc + Number(account.opening_balance ?? 0), 0);

  const updated = new Map();

  for (const period of ordered) {
    const movements = mockMovements.filter(
      (movement) =>
        movement.movement_date >= period.start_date && movement.movement_date <= period.end_date,
    );

    const summary = summarizeMovements(movements);
    const cashSummary = summarizeMovements(
      movements.filter((movement) => cashAccountIds.has(movement.account_id)),
    );

    updated.set(period.id, {
      ...period,
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
      movement_count: summary.count,
      cash_income: cashSummary.income,
      cash_expense: cashSummary.expense,
      cash_balance: cashSummary.balance,
      opening_balance: round2(cashOpening),
    });

    cashOpening += cashSummary.balance;
  }

  mockPeriods = mockPeriods.map((period) => updated.get(period.id) ?? period);
}

function syncStore() {
  recalculateBalances();
  recalculatePeriods();
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cuentas financieras
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista las cuentas financieras con filtros.
 *
 * @param {{ type?: string, status?: string, search?: string }} params
 */
export async function listAccounts(params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/accounts", { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay();

  const { type = "", status = "", search = "" } = params;
  const normalizedSearch = search.trim().toLowerCase();

  const items = mockAccounts
    .filter((account) => {
      if (type && account.type !== type) return false;
      if (status && account.status !== status) return false;

      if (normalizedSearch) {
        const haystack = [account.name, account.branch, account.owner]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    })
    .map(cloneAccount);

  return {
    items,
    total: items.length,
    stats: {
      total: mockAccounts.length,
      active: mockAccounts.filter((account) => account.status === "active").length,
      cash: mockAccounts.filter((account) => account.type === "cash").length,
      bank: mockAccounts.filter((account) => account.type === "bank").length,
      digital_wallet: mockAccounts.filter((account) => account.type === "digital_wallet").length,
      total_balance: mockAccounts
        .filter((account) => account.status === "active")
        .reduce((acc, account) => acc + account.balance, 0),
    },
  };
}

/**
 * Obtiene una cuenta por su id (con sus últimos movimientos).
 */
export async function getAccount(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/accounts/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(280);

  const account = mockAccounts.find((item) => item.id === id);

  if (!account) throw notFound("la cuenta", id);

  const movements = mockMovements
    .filter((movement) => movement.account_id === id)
    .sort((a, b) => (a.movement_date < b.movement_date ? 1 : -1));

  return {
    ...cloneAccount(account),
    movements: movements.map(cloneMovement),
    stats: summarizeMovements(movements),
  };
}

/**
 * Crea una cuenta financiera.
 */
export async function createAccount(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/financial/accounts", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(520);

  accountSequence += 1;

  const account = {
    id: `acc_${String(accountSequence).padStart(3, "0")}`,
    name: payload.name ?? "",
    type: payload.type ?? "cash",
    currency: payload.currency ?? "PEN",
    opening_balance: Number(payload.opening_balance ?? 0),
    balance: Number(payload.opening_balance ?? 0),
    owner: payload.owner ?? "Ana Morales",
    branch: payload.branch ?? "",
    status: payload.status ?? "active",
    notes: payload.notes ?? "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockAccounts = [...mockAccounts, account];

  return cloneAccount(account);
}

/**
 * Actualiza parcialmente una cuenta.
 */
export async function updateAccount(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/financial/accounts/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(480);

  const index = mockAccounts.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("la cuenta", id);

  const updated = {
    ...mockAccounts[index],
    ...payload,
    opening_balance:
      payload.opening_balance !== undefined
        ? Number(payload.opening_balance)
        : mockAccounts[index].opening_balance,
    updated_at: new Date().toISOString(),
  };

  mockAccounts = mockAccounts.map((item, itemIndex) => (itemIndex === index ? updated : item));

  recalculateBalances();

  return cloneAccount(updated);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Movimientos
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista movimientos con filtros, búsqueda, orden y paginación.
 *
 * @param {{ type?: string, accountId?: string, category?: string, paymentMethod?: string,
 *           status?: string, from?: string, to?: string, minAmount?: number,
 *           maxAmount?: number, search?: string, page?: number, pageSize?: number }} params
 */
export async function listMovements(params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/movements", {
  //   query: {
  //     type, account_id: accountId, category, payment_method: paymentMethod,
  //     status, from, to, min_amount: minAmount, max_amount: maxAmount,
  //     search, page, page_size: pageSize,
  //   },
  // });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay();

  const {
    type = "",
    accountId = "",
    category = "",
    paymentMethod = "",
    status = "",
    from = "",
    to = "",
    minAmount = null,
    maxAmount = null,
    search = "",
    page = 1,
    pageSize = 12,
  } = params;

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = mockMovements
    .filter((movement) => {
      if (type && movement.type !== type) return false;
      if (accountId && movement.account_id !== accountId) return false;
      if (category && movement.category !== category) return false;
      if (paymentMethod && movement.payment_method !== paymentMethod) return false;
      if (status && movement.status !== status) return false;
      if (from && movement.movement_date < from) return false;
      if (to && movement.movement_date > to) return false;

      if (minAmount !== null && minAmount !== "" && movement.amount < Number(minAmount)) {
        return false;
      }

      if (maxAmount !== null && maxAmount !== "" && movement.amount > Number(maxAmount)) {
        return false;
      }

      if (normalizedSearch) {
        const haystack = [movement.concept, movement.reference, movement.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.movement_date === b.movement_date) {
        return (a.registered_at ?? "") < (b.registered_at ?? "") ? 1 : -1;
      }

      return a.movement_date < b.movement_date ? 1 : -1;
    });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(cloneMovement);

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
    stats: summarizeMovements(filtered),
  };
}

/**
 * Obtiene un movimiento por su id.
 */
export async function getMovement(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/movements/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(260);

  const movement = mockMovements.find((item) => item.id === id);

  if (!movement) throw notFound("el movimiento", id);

  return cloneMovement(movement);
}

/**
 * Crea un movimiento (ingreso o egreso).
 *
 * `movement_date` es la fecha del hecho económico; `registered_at` es la fecha
 * de registro: si difieren, el movimiento es tardío.
 */
export async function createMovement(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/financial/movements", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(560);

  movementSequence += 1;

  const movementDate = payload.movement_date ?? todayISO();

  // Un movimiento es tardío cuando su fecha pertenece a una semana ya cerrada:
  // se registra con su fecha de registro actual y no altera el cierre original.
  const period = mockPeriods.find((item) => item.week_key === getWeekKey(movementDate));
  const isLate = period
    ? period.status === PERIOD_STATUSES.CLOSED
    : getWeekKey(movementDate) < getWeekKey(MOCK_TODAY);

  const movement = {
    id: `mov_${String(movementSequence).padStart(4, "0")}`,
    type: payload.type ?? MOVEMENT_TYPES.EXPENSE,
    concept: payload.concept ?? "",
    category: payload.category ?? "",
    amount: Number(payload.amount ?? 0),
    account_id: payload.account_id ?? null,
    payment_method: payload.payment_method ?? "cash",
    movement_date: movementDate,
    registered_at: payload.registered_at ?? new Date().toISOString(),
    status: payload.status ?? MOVEMENT_STATUSES.REGISTERED,
    reference: payload.reference || `MOV-${String(movementSequence).padStart(4, "0")}`,
    notes: payload.notes ?? "",
    origin: payload.origin ?? (isLate ? "late" : "regular"),
  };

  mockMovements = [...mockMovements, movement];

  syncStore();

  return cloneMovement(movement);
}

/**
 * Actualiza parcialmente un movimiento.
 */
export async function updateMovement(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/financial/movements/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(520);

  const index = mockMovements.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("el movimiento", id);

  const movementDate = payload.movement_date ?? mockMovements[index].movement_date;
  const period = mockPeriods.find((item) => item.week_key === getWeekKey(movementDate));
  const isLate = period
    ? period.status === PERIOD_STATUSES.CLOSED
    : getWeekKey(movementDate) < getWeekKey(MOCK_TODAY);

  const updated = {
    ...mockMovements[index],
    ...payload,
    amount:
      payload.amount !== undefined ? Number(payload.amount) : mockMovements[index].amount,
    movement_date: movementDate,
    origin: payload.origin ?? (isLate ? "late" : "regular"),
    updated_at: new Date().toISOString(),
  };

  mockMovements = mockMovements.map((item, itemIndex) => (itemIndex === index ? updated : item));

  syncStore();

  return cloneMovement(updated);
}

/**
 * Elimina un movimiento.
 */
export async function deleteMovement(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return del(`/financial/movements/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(420);

  const index = mockMovements.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("el movimiento", id);

  const [removed] = mockMovements.splice(index, 1);

  syncStore();

  return { id: removed.id };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Calendario y resúmenes diarios
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Calendario financiero del mes: días con ingresos, egresos y balance.
 */
export async function getFinancialCalendar(year, month) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/calendar/${year}/${month}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(380);

  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const from = toISODate(first);
  const to = toISODate(last);

  const monthMovements = mockMovements.filter(
    (movement) => movement.movement_date >= from && movement.movement_date <= to,
  );

  const byDate = {};

  for (const movement of monthMovements) {
    const entry = byDate[movement.movement_date] ?? { income: 0, expense: 0, count: 0 };

    if (movement.status === MOVEMENT_STATUSES.VOID) continue;

    const amount = Number(movement.amount ?? 0);

    if (movement.type === MOVEMENT_TYPES.INCOME) entry.income += amount;
    else entry.expense += amount;

    entry.count += 1;

    byDate[movement.movement_date] = entry;
  }

  const rounded = Object.fromEntries(
    Object.entries(byDate).map(([key, value]) => [
      key,
      {
        income: Math.round(value.income * 100) / 100,
        expense: Math.round(value.expense * 100) / 100,
        count: value.count,
      },
    ]),
  );

  return {
    year,
    month,
    from,
    to,
    days: rounded,
    totals: summarizeMovements(monthMovements),
    movements: monthMovements.map(cloneMovement),
  };
}

/**
 * Resúmenes diarios para un rango de fechas.
 */
export async function getDailySummaries(params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/daily-summary", { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(360);

  const { from = "", to = "" } = params;

  const movements = mockMovements.filter((movement) => {
    if (from && movement.movement_date < from) return false;
    if (to && movement.movement_date > to) return false;
    return true;
  });

  const grouped = {};

  for (const movement of movements) {
    const entry = grouped[movement.movement_date] ?? {
      date: movement.movement_date,
      income: 0,
      expense: 0,
      count: 0,
      movements: [],
    };

    if (movement.status !== MOVEMENT_STATUSES.VOID) {
      const amount = Number(movement.amount ?? 0);

      if (movement.type === MOVEMENT_TYPES.INCOME) entry.income += amount;
      else entry.expense += amount;

      entry.count += 1;
    }

    entry.movements.push(cloneMovement(movement));
    grouped[movement.movement_date] = entry;
  }

  const items = Object.values(grouped)
    .map((entry) => ({
      ...entry,
      income: Math.round(entry.income * 100) / 100,
      expense: Math.round(entry.expense * 100) / 100,
      balance: Math.round((entry.income - entry.expense) * 100) / 100,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return { items, total: items.length, totals: summarizeMovements(movements) };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Períodos semanales
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista los períodos semanales con sus acumuladores.
 */
export async function listPeriods(params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/periods", { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(320);

  const { status = "", year = "", search = "" } = params;
  const normalizedSearch = search.trim().toLowerCase();

  const items = mockPeriods
    .filter((period) => {
      if (status && period.status !== status) return false;
      if (year && String(period.year) !== String(year)) return false;

      if (normalizedSearch) {
        const haystack = [period.week_key, `semana ${period.number}`, period.start_date]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    })
    .sort((a, b) => (a.week_key < b.week_key ? 1 : -1))
    .map((period) => {
      const closure = mockClosures.find((item) => item.period_id === period.id);

      return {
        ...clonePeriod(period),
        closure: closure ? cloneClosure(closure) : null,
      };
    });

  return {
    items,
    total: items.length,
    stats: {
      total: mockPeriods.length,
      open: mockPeriods.filter((period) => period.status === PERIOD_STATUSES.OPEN).length,
      closed: mockPeriods.filter((period) => period.status === PERIOD_STATUSES.CLOSED).length,
      income: mockPeriods.reduce((acc, period) => acc + period.income, 0),
      expense: mockPeriods.reduce((acc, period) => acc + period.expense, 0),
    },
  };
}

/**
 * Crea un período semanal.
 */
export async function createPeriod(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/financial/periods", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(480);

  const startDate = payload.start_date ?? getWeekKey(new Date());
  const range = getWeekRange(startDate);

  const period = {
    id: `per_${range.key}`,
    week_key: range.key,
    start_date: range.start,
    end_date: range.end,
    number: range.number ?? 0,
    year: parseISODate(range.start)?.getFullYear() ?? new Date().getFullYear(),
    status: PERIOD_STATUSES.OPEN,
    income: 0,
    expense: 0,
    balance: 0,
    movement_count: 0,
    cash_income: 0,
    cash_expense: 0,
    cash_balance: 0,
    opening_balance: 0,
    closed_at: null,
    closed_by: null,
  };

  mockPeriods = [...mockPeriods, period];

  return clonePeriod(period);
}

/**
 * Período semanal en curso (el que contiene la fecha de hoy).
 */
export async function getCurrentPeriod() {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/periods/current");
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(240);

  const currentKey = getWeekKey(MOCK_TODAY);
  const period = mockPeriods.find((item) => item.week_key === currentKey);

  if (!period) {
    const created = await createPeriod({ start_date: currentKey });
    return { ...created, movements: [] };
  }

  const movements = mockMovements.filter(
    (movement) => movement.movement_date >= period.start_date && movement.movement_date <= period.end_date,
  );

  return { ...clonePeriod(period), movements: movements.map(cloneMovement) };
}

/**
 * Obtiene un período semanal.
 */
export async function getPeriod(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/periods/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(280);

  const period = mockPeriods.find((item) => item.id === id || item.week_key === id);

  if (!period) throw notFound("el período", id);

  const movements = mockMovements.filter(
    (movement) => movement.movement_date >= period.start_date && movement.movement_date <= period.end_date,
  );

  const closure = mockClosures.find((item) => item.period_id === period.id);

  return {
    ...clonePeriod(period),
    movements: movements.map(cloneMovement),
    closure: closure ? cloneClosure(closure) : null,
  };
}

/**
 * Actualiza parcialmente un período.
 */
export async function updatePeriod(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/financial/periods/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(460);

  const index = mockPeriods.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("el período", id);

  const updated = { ...mockPeriods[index], ...payload, updated_at: new Date().toISOString() };

  mockPeriods = mockPeriods.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return clonePeriod(updated);
}

/**
 * Cierra un período semanal (acumula y sella los totales de la semana).
 */
export async function closePeriod(id, payload = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/financial/periods/${id}/close`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(560);

  const index = mockPeriods.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("el período", id);

  const updated = {
    ...mockPeriods[index],
    status: PERIOD_STATUSES.CLOSED,
    closed_at: new Date().toISOString(),
    closed_by: payload.closed_by ?? "Ana Morales",
  };

  mockPeriods = mockPeriods.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return clonePeriod(updated);
}

/**
 * Resumen completo del período: acumuladores, movimientos y cierre asociado.
 */
export async function getPeriodSummary(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/periods/${id}/summary`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(420);

  const period = mockPeriods.find((item) => item.id === id || item.week_key === id);

  if (!period) throw notFound("el período", id);

  const movements = mockMovements.filter(
    (movement) => movement.movement_date >= period.start_date && movement.movement_date <= period.end_date,
  );

  const closure = mockClosures.find((item) => item.period_id === period.id);
  const summary = summarizeMovements(movements);
  const cashAccountIds = getCashAccountIds();
  const cashMovements = movements.filter((movement) => cashAccountIds.has(movement.account_id));
  const cashSummary = summarizeMovements(cashMovements);

  return {
    period: clonePeriod(period),
    totals: {
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
      count: summary.count,
      cash_income: cashSummary.income,
      cash_expense: cashSummary.expense,
      cash_balance: cashSummary.balance,
      cash_movements: cashMovements.length,
    },
    movements: movements.map(cloneMovement),
    closure: closure ? cloneClosure(closure) : null,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cierres de caja
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista los cierres de caja con filtros.
 */
export async function listClosures(params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/closures", { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(320);

  const { status = "", year = "", periodId = "", search = "" } = params;
  const normalizedSearch = search.trim().toLowerCase();

  const items = mockClosures
    .filter((closure) => {
      if (status && closure.status !== status) return false;
      if (year && String(closure.year) !== String(year)) return false;
      if (periodId && closure.period_id !== periodId) return false;

      if (normalizedSearch) {
        const haystack = [closure.responsible, closure.week_key, closure.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    })
    .sort((a, b) => (a.week_key < b.week_key ? 1 : -1))
    .map(cloneClosure);

  return {
    items,
    total: items.length,
    stats: {
      total: mockClosures.length,
      confirmed: mockClosures.filter((closure) => closure.status === CLOSURE_STATUSES.CONFIRMED).length,
      adjusted: mockClosures.filter((closure) => closure.status === CLOSURE_STATUSES.ADJUSTED).length,
      draft: mockClosures.filter((closure) => closure.status === CLOSURE_STATUSES.DRAFT).length,
      pending_adjustments: mockClosures.reduce(
        (acc, closure) =>
          acc + closure.adjustments.filter((adjustment) => adjustment.status === "pending").length,
        0,
      ),
    },
  };
}

/**
 * Crea un cierre de caja para un período.
 */
export async function createClosure(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/financial/closures", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(520);

  const period = mockPeriods.find(
    (item) => item.id === payload.period_id || item.week_key === payload.period_id,
  );

  if (!period) throw notFound("el período", payload.period_id);

  closureSequence += 1;

  const expectedCash = Number(
    payload.expected_cash ?? period.opening_balance + (period.cash_balance ?? period.balance),
  );
  const actualCash = Number(payload.actual_cash ?? expectedCash);

  const closure = {
    id: `clo_${period.week_key}`,
    period_id: period.id,
    week_key: period.week_key,
    start_date: period.start_date,
    end_date: period.end_date,
    number: period.number,
    year: period.year,
    status: CLOSURE_STATUSES.DRAFT,
    total_income: period.income,
    total_expense: period.expense,
    net: period.balance,
    expected_cash: expectedCash,
    actual_cash: actualCash,
    difference: Math.round((actualCash - expectedCash) * 100) / 100,
    responsible: payload.responsible ?? "Ana Morales",
    notes: payload.notes ?? "",
    observations: payload.observations ?? "",
    created_at: new Date().toISOString(),
    confirmed_at: null,
    adjustments: [],
  };

  mockClosures = [closure, ...mockClosures.filter((item) => item.period_id !== period.id)];

  return cloneClosure(closure);
}

/**
 * Obtiene un cierre por su id.
 */
export async function getClosure(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/closures/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(280);

  const closure = mockClosures.find((item) => item.id === id);

  if (!closure) throw notFound("el cierre", id);

  const period = mockPeriods.find((item) => item.id === closure.period_id);

  return {
    ...cloneClosure(closure),
    period: period ? clonePeriod(period) : null,
  };
}

/**
 * Actualiza parcialmente un cierre.
 */
export async function updateClosure(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/financial/closures/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(480);

  const index = mockClosures.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("el cierre", id);

  const updated = {
    ...mockClosures[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  if (payload.expected_cash !== undefined || payload.actual_cash !== undefined) {
    updated.difference =
      Math.round((Number(updated.actual_cash) - Number(updated.expected_cash)) * 100) / 100;
  }

  mockClosures = mockClosures.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return cloneClosure(updated);
}

/**
 * Obtiene el cierre asociado a un período.
 */
export async function getClosureByPeriod(periodId) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/closures/by-period/${periodId}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(260);

  const closure = mockClosures.find((item) => item.period_id === periodId);

  if (!closure) return null;

  return cloneClosure(closure);
}

/**
 * Confirma un cierre: sella el conteo y deja el período como cerrado.
 */
export async function confirmClosure(id, payload = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/financial/closures/${id}/confirm`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(560);

  const index = mockClosures.findIndex((item) => item.id === id);

  if (index === -1) throw notFound("el cierre", id);

  const updated = {
    ...mockClosures[index],
    ...payload,
    actual_cash:
      payload.actual_cash !== undefined
        ? Number(payload.actual_cash)
        : mockClosures[index].actual_cash,
    expected_cash:
      payload.expected_cash !== undefined
        ? Number(payload.expected_cash)
        : mockClosures[index].expected_cash,
    status:
      mockClosures[index].adjustments.length > 0
        ? CLOSURE_STATUSES.ADJUSTED
        : CLOSURE_STATUSES.CONFIRMED,
    confirmed_at: new Date().toISOString(),
  };

  updated.difference =
    Math.round((Number(updated.actual_cash) - Number(updated.expected_cash)) * 100) / 100;

  mockClosures = mockClosures.map((item, itemIndex) => (itemIndex === index ? updated : item));

  const periodIndex = mockPeriods.findIndex((item) => item.id === updated.period_id);

  if (periodIndex !== -1) {
    const period = {
      ...mockPeriods[periodIndex],
      status: PERIOD_STATUSES.CLOSED,
      closed_at: new Date().toISOString(),
      closed_by: updated.responsible,
    };

    mockPeriods = mockPeriods.map((item, itemIndex) =>
      itemIndex === periodIndex ? period : item,
    );
  }

  return cloneClosure(updated);
}

/**
 * Lista los ajustes registrados sobre un cierre.
 */
export async function listClosureAdjustments(closureId) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/financial/closures/${closureId}/adjustments`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(240);

  const closure = mockClosures.find((item) => item.id === closureId);

  if (!closure) throw notFound("el cierre", closureId);

  return { items: closure.adjustments.map((item) => ({ ...item })), total: closure.adjustments.length };
}

/**
 * Registra un ajuste sobre un cierre cerrado.
 * El cierre original no se altera: solo se añade la justificación del ajuste.
 */
export async function createClosureAdjustment(closureId, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/financial/closures/${closureId}/adjustments`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(500);

  const index = mockClosures.findIndex((item) => item.id === closureId);

  if (index === -1) throw notFound("el cierre", closureId);

  const adjustment = {
    id: `adj_${closureId}_${mockClosures[index].adjustments.length + 1}`,
    type: payload.type ?? "shortage",
    amount: Number(payload.amount ?? 0),
    reason: payload.reason ?? "",
    justification: payload.justification ?? "",
    status: payload.status ?? "pending",
    created_at: new Date().toISOString(),
    resolved_at: null,
    resolved_by: null,
  };

  const updated = {
    ...mockClosures[index],
    adjustments: [adjustment, ...mockClosures[index].adjustments],
    status: CLOSURE_STATUSES.ADJUSTED,
  };

  mockClosures = mockClosures.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return { ...adjustment };
}

/**
 * Resuelve (o actualiza) un ajuste.
 */
export async function resolveAdjustment(adjustmentId, payload = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/financial/adjustments/${adjustmentId}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(460);

  for (const closure of mockClosures) {
    const index = closure.adjustments.findIndex((item) => item.id === adjustmentId);

    if (index === -1) continue;

    const updated = {
      ...closure.adjustments[index],
      ...payload,
      amount:
        payload.amount !== undefined
          ? Number(payload.amount)
          : closure.adjustments[index].amount,
      status: payload.status ?? "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: payload.resolved_by ?? "Ana Morales",
    };

    const adjustments = closure.adjustments.map((item, itemIndex) =>
      itemIndex === index ? updated : item,
    );

    mockClosures = mockClosures.map((item) =>
      item.id === closure.id ? { ...item, adjustments } : item,
    );

    return { ...updated };
  }

  throw notFound("el ajuste", adjustmentId);
}

/**
 * Historial de cierres con filtros (mismo origen que /financial/closures).
 */
export async function getClosuresHistory(params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/financial/closures-history", { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(300);

  const { from = "", to = "", status = "", search = "" } = params;
  const normalizedSearch = search.trim().toLowerCase();

  const items = mockClosures
    .filter((closure) => {
      if (from && closure.end_date < from) return false;
      if (to && closure.start_date > to) return false;
      if (status && closure.status !== status) return false;

      if (normalizedSearch) {
        const haystack = [closure.responsible, closure.week_key, closure.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    })
    .sort((a, b) => (a.week_key < b.week_key ? 1 : -1))
    .map(cloneClosure);

  return {
    items,
    total: items.length,
    totals: {
      income: items.reduce((acc, closure) => acc + closure.total_income, 0),
      expense: items.reduce((acc, closure) => acc + closure.total_expense, 0),
      difference: items.reduce((acc, closure) => acc + closure.difference, 0),
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Vista de conjunto (dashboard)
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Resumen general del dashboard financiero.
 *
 * No es un endpoint propio: compone `GET /financial/movements`,
 * `GET /financial/periods` y `GET /financial/closures-history`.
 */
export async function getFinancialOverview() {
  await mockDelay(420);

  const currentPeriod = await getCurrentPeriod();
  const [accounts, closures] = await Promise.all([listAccounts(), listClosures()]);
  const movements = mockMovements.map(cloneMovement);

  const currentWeekMovements = movements.filter(
    (movement) =>
      movement.movement_date >= currentPeriod.start_date &&
      movement.movement_date <= currentPeriod.end_date,
  );

  const weekSummary = summarizeMovements(currentWeekMovements);
  const monthMovements = movements.filter((movement) =>
    movement.movement_date.startsWith(`${currentPeriod.start_date.slice(0, 7)}`),
  );

  const activeAccounts = accounts.items.filter((account) => account.status === "active");
  const totalBalance = activeAccounts.reduce((acc, account) => acc + account.balance, 0);
  const cashBalance = activeAccounts
    .filter((account) => account.type === "cash")
    .reduce((acc, account) => acc + account.balance, 0);

  // El panel "último cierre" muestra el último cierre ya confirmado.
  const lastClosure =
    closures.items.find((closure) => closure.status !== CLOSURE_STATUSES.DRAFT) ??
    closures.items[0] ??
    null;

  const recentMovements = [...movements]
    .sort((a, b) => (a.registered_at ?? "") < (b.registered_at ?? "") ? 1 : -1)
    .slice(0, 8)
    .map(cloneMovement);

  const lastWeeks = [...mockPeriods]
    .sort((a, b) => (a.week_key < b.week_key ? 1 : -1))
    .slice(0, 6)
    .reverse()
    .map((period) => ({
      id: period.id,
      week_key: period.week_key,
      start_date: period.start_date,
      end_date: period.end_date,
      number: period.number,
      status: period.status,
      income: period.income,
      expense: period.expense,
      balance: period.balance,
    }));

  return {
    totals: {
      income: movements
        .filter((movement) => movement.type === MOVEMENT_TYPES.INCOME)
        .reduce((acc, movement) => acc + movement.amount, 0),
      expense: movements
        .filter((movement) => movement.type === MOVEMENT_TYPES.EXPENSE)
        .reduce((acc, movement) => acc + movement.amount, 0),
      available_balance: totalBalance,
      cash_balance: cashBalance,
    },
    week: {
      ...weekSummary,
      start_date: currentPeriod.start_date,
      end_date: currentPeriod.end_date,
      number: currentPeriod.number,
    },
    month: summarizeMovements(monthMovements),
    accounts: accounts.items,
    account_stats: accounts.stats,
    last_closure: lastClosure,
    current_period: currentPeriod,
    recent_movements: recentMovements,
    last_weeks: lastWeeks,
  };
}

/**
 * Reinicia los stores ficticios (útil durante el desarrollo).
 */
export function resetMockFinancials() {
  mockAccounts = MOCK_ACCOUNTS.map(cloneAccount);
  mockMovements = MOCK_MOVEMENTS.map(cloneMovement);
  mockPeriods = MOCK_PERIODS.map(clonePeriod);
  mockClosures = MOCK_CLOSURES.map(cloneClosure);

  movementSequence = mockMovements.length;
  accountSequence = mockAccounts.length;
  closureSequence = mockClosures.length;

  syncStore();
}
