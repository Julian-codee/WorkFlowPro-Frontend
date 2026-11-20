/**
 * Servicio HTTP de Finanzas.
 *
 * FastAPI es la fuente de verdad. Este módulo adapta los envelopes y nombres
 * de campos reales a los modelos que consumen los hooks y componentes.
 *
 * Contratos principales:
 *   GET    /financial/accounts
 *   POST   /financial/accounts
 *   GET    /financial/accounts/{id}
 *   PATCH  /financial/accounts/{id}
 *   GET    /financial/movements
 *   POST   /financial/movements
 *   GET    /financial/movements/{id}
 *   PATCH  /financial/movements/{id}
 *   DELETE /financial/movements/{id}
 *   GET    /financial/calendar/{year}/{month}
 *   GET    /financial/daily-summary
 *   GET    /financial/periods
 *   POST   /financial/periods
 *   GET    /financial/periods/current
 *   GET    /financial/periods/{id}
 *   PATCH  /financial/periods/{id}
 *   POST   /financial/periods/{id}/close
 *   GET    /financial/periods/{id}/summary
 *   GET    /financial/closures
 *   POST   /financial/closures
 *   GET    /financial/closures/{id}
 *   PATCH  /financial/closures/{id}
 *   GET    /financial/closures/by-period/{periodId}
 *   POST   /financial/closures/{id}/confirm
 *   GET    /financial/closures/{id}/adjustments
 *   POST   /financial/closures/{id}/adjustments
 *   PATCH  /financial/adjustments/{id}
 *   GET    /financial/closures-history
 */

import { del, get, patch, post } from "@/lib/api";
import { DATA_DOMAINS, invalidateData } from "@/lib/data/invalidation";

import {
  CLOSURE_STATUSES,
  MOVEMENT_STATUSES,
  MOVEMENT_TYPES,
  PERIOD_STATUSES,
  getIsoWeekNumber,
  getWeekRange,
  summarizeMovements,
  toISODate,
} from "../constants";

const PAGE_SIZE = 100;

function asNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function toApiDate(value, endOfDay = false) {
  if (!value) return undefined;

  const date = dateOnly(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return value;

  return `${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`;
}

function extractReference(concept) {
  const match = String(concept ?? "").match(/\(Ref:\s*([^)]+)\)\s*$/i);
  return match?.[1] ?? "";
}

function normalizeAccount(account) {
  return {
    ...account,
    id: account.id,
    name: account.name ?? "",
    code: account.code ?? "",
    description: account.description ?? "",
    type: account.account_type ?? account.type ?? "cash",
    currency: String(account.currency ?? "COP").toUpperCase(),
    status: account.is_active === false ? "archived" : "active",
    balance: asNumber(account.current_balance ?? account.balance),
    is_active: account.is_active !== false,
    created_at: account.created_at ?? null,
    updated_at: account.updated_at ?? null,
  };
}

function normalizeMovement(movement) {
  const concept = movement.concept ?? movement.description ?? "";
  const isLate = Boolean(movement.is_late_entry);

  return {
    ...movement,
    id: movement.id,
    type: movement.movement_type ?? movement.type ?? MOVEMENT_TYPES.EXPENSE,
    concept,
    description: movement.description ?? "",
    category: movement.category ?? "other_expense",
    amount: asNumber(movement.amount),
    account_id: movement.cash_account_id ?? movement.account_id ?? null,
    payment_method: movement.payment_method ?? "other",
    movement_date: movement.transaction_date ?? movement.movement_date ?? null,
    registered_at: movement.recorded_at ?? movement.registered_at ?? null,
    status: isLate ? MOVEMENT_STATUSES.LATE : MOVEMENT_STATUSES.REGISTERED,
    reference: movement.reference ?? extractReference(concept),
    notes: movement.description ?? "",
    origin: isLate ? "late" : "regular",
    is_late_entry: isLate,
    late_entry_reason: movement.late_entry_reason ?? null,
    task_id: movement.task_id ?? null,
    customer_id: movement.customer_id ?? null,
    quotation_id: movement.quotation_id ?? null,
    created_at: movement.created_at ?? null,
    updated_at: movement.updated_at ?? null,
  };
}

function normalizePeriod(period) {
  const startDate = period.start_date ?? null;
  const income = asNumber(period.total_income);
  const expense = asNumber(period.total_expense);
  const balance = asNumber(period.net_flow);

  return {
    ...period,
    id: period.id,
    number: Number(period.week_number ?? 0),
    week_key: dateOnly(startDate),
    start_date: startDate,
    end_date: period.end_date ?? null,
    year: Number(period.year ?? 0),
    status: period.status ?? PERIOD_STATUSES.OPEN,
    income,
    expense,
    balance,
    total_income: income,
    total_expense: expense,
    net_flow: balance,
    cash_income: income,
    cash_expense: expense,
    cash_balance: balance,
    opening_balance: asNumber(period.opening_balance),
    expected_balance: asNumber(period.expected_balance),
    movement_count: Number(period.movement_count ?? 0),
    cash_account_id: period.cash_account_id ?? null,
    closed_at: period.closed_at ?? null,
    closed_by_id: period.closed_by_id ?? null,
    created_at: period.created_at ?? null,
    updated_at: period.updated_at ?? null,
  };
}

function normalizeClosure(closure, period = null) {
  const normalizedPeriod = period ? normalizePeriod(period) : null;

  return {
    ...closure,
    id: closure.id,
    period_id: closure.weekly_period_id ?? closure.period_id ?? null,
    weekly_period_id: closure.weekly_period_id ?? closure.period_id ?? null,
    cash_account_id: closure.cash_account_id ?? null,
    week_key: normalizedPeriod?.week_key ?? "",
    start_date: normalizedPeriod?.start_date ?? null,
    end_date: normalizedPeriod?.end_date ?? null,
    number: normalizedPeriod?.number ?? 0,
    year: normalizedPeriod?.year ?? 0,
    status: closure.status ?? CLOSURE_STATUSES.PENDING,
    total_income: asNumber(closure.total_income),
    total_expense: asNumber(closure.total_expense),
    net: asNumber(closure.net_flow),
    net_flow: asNumber(closure.net_flow),
    opening_balance: asNumber(closure.opening_balance),
    expected_cash: asNumber(closure.expected_balance),
    expected_balance: asNumber(closure.expected_balance),
    actual_cash: asNumber(closure.physical_balance),
    physical_balance: asNumber(closure.physical_balance),
    difference: asNumber(closure.discrepancy),
    discrepancy: asNumber(closure.discrepancy),
    responsible: closure.closed_by_id ? "Responsable asignado" : "",
    closed_by_id: closure.closed_by_id ?? null,
    notes: closure.observations ?? "",
    observations: closure.observations ?? "",
    difference_explanation: closure.discrepancy_explanation ?? "",
    discrepancy_explanation: closure.discrepancy_explanation ?? "",
    confirmed_at: closure.confirmed_at ?? null,
    created_at: closure.created_at ?? null,
    updated_at: closure.updated_at ?? null,
    adjustment_count: Number(closure.adjustment_count ?? 0),
    adjustments: [],
    period: normalizedPeriod,
  };
}

function normalizeAdjustment(adjustment) {
  const isResolved = Boolean(adjustment.resolved_at || adjustment.resolution);

  return {
    ...adjustment,
    id: adjustment.id,
    type: adjustment.adjustment_type ?? adjustment.type ?? "discrepancy",
    adjustment_type: adjustment.adjustment_type ?? adjustment.type ?? "discrepancy",
    amount: asNumber(adjustment.amount),
    impact_on_balance: asNumber(adjustment.impact_on_balance),
    reason: adjustment.reason ?? "",
    justification: adjustment.reason ?? "",
    resolution: adjustment.resolution ?? "",
    status: isResolved ? "resolved" : "pending",
    cash_closure_id: adjustment.cash_closure_id ?? null,
    movement_id: adjustment.movement_id ?? null,
    resolved_by: adjustment.resolved_by_id ? "Responsable asignado" : "",
    resolved_by_id: adjustment.resolved_by_id ?? null,
    resolved_at: adjustment.resolved_at ?? null,
    created_at: adjustment.created_at ?? null,
    updated_at: adjustment.updated_at ?? null,
  };
}

function normalizeDailySummary(summary) {
  const income = asNumber(summary.total_income);
  const expense = asNumber(summary.total_expense);

  return {
    ...summary,
    date: summary.date ?? null,
    income,
    expense,
    balance: asNumber(summary.net_flow),
    net_flow: asNumber(summary.net_flow),
    count: Number(summary.movement_count ?? 0),
    movement_count: Number(summary.movement_count ?? 0),
  };
}

async function fetchAllPages(path, collectionKey, query = {}) {
  const items = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await get(path, {
      query: {
        ...query,
        page,
        page_size: PAGE_SIZE,
      },
    });

    const pageItems = Array.isArray(response?.[collectionKey]) ? response[collectionKey] : [];
    items.push(...pageItems);
    totalPages = Math.max(1, Number(response?.total_pages ?? 1));

    if (pageItems.length === 0) break;
    page += 1;
  } while (page <= totalPages);

  return items;
}

function buildAccountStats(accounts) {
  const active = accounts.filter((account) => account.status === "active");

  return {
    total: accounts.length,
    active: active.length,
    cash: accounts.filter((account) => account.type === "cash").length,
    bank: accounts.filter((account) => account.type === "bank").length,
    digital_wallet: accounts.filter((account) => account.type === "digital_wallet").length,
    total_balance: active.reduce((sum, account) => sum + account.balance, 0),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cuentas financieras
 * ────────────────────────────────────────────────────────────────────────── */

/** Lista cuentas y aplica en cliente los filtros que FastAPI no expone. */
export async function listAccounts(params = {}) {
  const { type = "", status = "", search = "" } = params;
  const rawAccounts = await fetchAllPages("/financial/accounts", "accounts");
  const allAccounts = rawAccounts.map(normalizeAccount);
  const normalizedSearch = search.trim().toLowerCase();

  const items = allAccounts.filter((account) => {
    if (type && account.type !== type) return false;
    if (status === "active" && !account.is_active) return false;
    if (status === "archived" && account.is_active) return false;

    if (normalizedSearch) {
      const haystack = [account.name, account.code, account.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedSearch)) return false;
    }

    return true;
  });

  return {
    items,
    accounts: items,
    total: items.length,
    stats: buildAccountStats(allAccounts),
  };
}

/** Obtiene una cuenta y compone sus movimientos y acumulados reales. */
export async function getAccount(id) {
  const [rawAccount, rawMovements] = await Promise.all([
    get(`/financial/accounts/${id}`),
    fetchAllPages("/financial/movements", "movements", { cash_account_id: id }),
  ]);

  const account = normalizeAccount(rawAccount);
  const movements = rawMovements.map(normalizeMovement);

  return {
    ...account,
    movements,
    stats: summarizeMovements(movements),
  };
}

/** Crea una cuenta usando exclusivamente los campos aceptados por FastAPI. */
export async function createAccount(payload) {
  const account = await post("/financial/accounts", {
    name: payload.name?.trim(),
    code: payload.code?.trim().toUpperCase(),
    description: payload.description?.trim() || null,
    account_type: payload.type ?? payload.account_type ?? "cash",
    currency: payload.currency ?? "COP",
    is_active: payload.status !== "archived",
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeAccount(account);
}

/** Actualiza una cuenta. El backend no permite cambiar su código. */
export async function updateAccount(id, payload) {
  const account = await patch(`/financial/accounts/${id}`, {
    name: payload.name?.trim(),
    description: payload.description?.trim() || null,
    account_type: payload.type ?? payload.account_type,
    currency: payload.currency,
    is_active: payload.status !== "archived",
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeAccount(account);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Movimientos
 * ────────────────────────────────────────────────────────────────────────── */

async function fetchAllMovements(params = {}) {
  const {
    type = "",
    accountId = "",
    category = "",
    paymentMethod = "",
    search = "",
    from = "",
    to = "",
    minAmount = null,
    maxAmount = null,
    isLateEntry = null,
    sortBy = "transaction_date",
    sortOrder = "desc",
  } = params;

  const rawMovements = await fetchAllPages("/financial/movements", "movements", {
    query: search.trim() || undefined,
    movement_type: type || undefined,
    category: category || undefined,
    payment_method: paymentMethod || undefined,
    cash_account_id: accountId || undefined,
    transaction_from: from ? toApiDate(from) : undefined,
    transaction_to: to ? toApiDate(to, true) : undefined,
    min_amount: minAmount === null || minAmount === undefined || minAmount === "" ? undefined : minAmount,
    max_amount: maxAmount === null || maxAmount === undefined || maxAmount === "" ? undefined : maxAmount,
    is_late_entry: isLateEntry === null || isLateEntry === undefined ? undefined : isLateEntry,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  return rawMovements.map(normalizeMovement);
}

/**
 * Lista movimientos con filtros, búsqueda, orden y paginación.
 * Las estadísticas se calculan sobre todas las páginas del filtro.
 */
export async function listMovements(params = {}) {
  const { page = 1, pageSize = 12 } = params;
  const movements = await fetchAllMovements(params);
  const total = movements.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = movements.slice(start, start + pageSize);

  return {
    items,
    movements: items,
    total,
    page,
    pageSize,
    totalPages,
    stats: summarizeMovements(movements),
  };
}

/** Obtiene un movimiento por su id. */
export async function getMovement(id) {
  const movement = await get(`/financial/movements/${id}`);
  return normalizeMovement(movement);
}

/** Crea un movimiento con el contrato real del backend. */
export async function createMovement(payload) {
  const notes = payload.notes?.trim() || payload.description?.trim() || null;
  const movement = await post("/financial/movements", {
    transaction_date: payload.movement_date ?? payload.transaction_date,
    movement_type: payload.type ?? payload.movement_type,
    category: payload.category,
    amount: Number(payload.amount),
    payment_method: payload.payment_method,
    cash_account_id: payload.account_id ?? payload.cash_account_id,
    concept: payload.concept?.trim(),
    description: notes,
    reference: payload.reference?.trim() || null,
    customer_id: payload.customer_id ?? null,
    task_id: payload.task_id ?? null,
    quotation_id: payload.quotation_id ?? null,
    is_late_entry: Boolean(payload.is_late_entry),
    late_entry_reason: notes,
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeMovement(movement);
}

/**
 * Actualiza un movimiento. FastAPI no admite cambios de referencia y el
 * movimiento se vincula a los campos reales del recurso.
 */
export async function updateMovement(id, payload) {
  const movement = await patch(`/financial/movements/${id}`, {
    transaction_date: payload.movement_date ?? undefined,
    movement_type: payload.type ?? undefined,
    category: payload.category ?? undefined,
    amount: payload.amount === undefined ? undefined : Number(payload.amount),
    payment_method: payload.payment_method ?? undefined,
    cash_account_id: payload.account_id ?? undefined,
    concept: payload.concept?.trim() || undefined,
    description: payload.notes?.trim() || undefined,
    customer_id: payload.customer_id ?? undefined,
    task_id: payload.task_id ?? undefined,
    quotation_id: payload.quotation_id ?? undefined,
    is_late_entry: payload.is_late_entry ?? undefined,
    late_entry_reason: payload.notes?.trim() || payload.late_entry_reason || undefined,
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeMovement(movement);
}

/** Elimina un movimiento no vinculado a una tarea. */
export async function deleteMovement(id) {
  const result = await del(`/financial/movements/${id}`);

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return { id: result?.id ?? id };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Calendario y resúmenes diarios
 * ────────────────────────────────────────────────────────────────────────── */

/** Calendario financiero mensual; los movimientos se consultan aparte. */
export async function getFinancialCalendar(year, month) {
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).toISOString().slice(0, 10);

  const [calendar, movements] = await Promise.all([
    get(`/financial/calendar/${year}/${month}`),
    fetchAllMovements({ from: firstDay, to: lastDay }),
  ]);

  const days = {};

  for (const day of calendar?.days ?? []) {
    const normalized = normalizeDailySummary(day);
    days[dateOnly(normalized.date)] = {
      income: normalized.income,
      expense: normalized.expense,
      balance: normalized.balance,
      count: normalized.count,
    };
  }

  return {
    year: Number(calendar?.year ?? year),
    month: Number(calendar?.month ?? month),
    from: firstDay,
    to: lastDay,
    days,
    totals: {
      income: asNumber(calendar?.total_income),
      expense: asNumber(calendar?.total_expense),
      balance: asNumber(calendar?.net_flow),
      count: Number(calendar?.total_movements ?? 0),
    },
    movements,
  };
}

/** Resúmenes diarios sparse para un rango inclusivo de fechas. */
export async function getDailySummaries(params = {}) {
  const now = new Date();
  const defaultFrom = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);
  const from = params.from ?? params.start_date ?? defaultFrom;
  const to = params.to ?? params.end_date ?? defaultTo;

  const response = await get("/financial/daily-summary", {
    query: {
      start_date: toApiDate(from),
      end_date: toApiDate(to, true),
    },
  });

  const items = (response?.daily_summaries ?? []).map(normalizeDailySummary);
  const totals = items.reduce(
    (summary, item) => ({
      income: summary.income + item.income,
      expense: summary.expense + item.expense,
      balance: summary.balance + item.balance,
      count: summary.count + item.count,
    }),
    { income: 0, expense: 0, balance: 0, count: 0 },
  );

  return { items, total: items.length, totals };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Períodos semanales
 * ────────────────────────────────────────────────────────────────────────── */

async function fetchAllPeriods(params = {}) {
  const { status = "", year = "", cashAccountId = "" } = params;
  const rawPeriods = await fetchAllPages("/financial/periods", "periods", {
    status: status || undefined,
    year: year || undefined,
    cash_account_id: cashAccountId || undefined,
    sort_by: "start_date",
    sort_order: "desc",
  });

  return rawPeriods.map(normalizePeriod);
}

/** Lista períodos por cuenta y aplica la búsqueda textual en cliente. */
export async function listPeriods(params = {}) {
  const { status = "", year = "", search = "", cashAccountId = "" } = params;
  const allPeriods = await fetchAllPeriods({ status, year, cashAccountId });
  const normalizedSearch = search.trim().toLowerCase();

  const items = allPeriods.filter((period) => {
    if (!normalizedSearch) return true;

    const haystack = [
      period.week_key,
      `semana ${period.number}`,
      period.start_date,
      period.end_date,
      period.cash_account_id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const closures = await listClosures({ cashAccountId });
  const closureByPeriod = new Map(closures.map((closure) => [closure.period_id, closure]));

  const periods = items.map((period) => ({
    ...period,
    closure: closureByPeriod.get(period.id) ?? null,
  }));

  return {
    items: periods,
    periods,
    total: periods.length,
    stats: {
      total: allPeriods.length,
      open: allPeriods.filter((period) => period.status === PERIOD_STATUSES.OPEN).length,
      closed: allPeriods.filter((period) => period.status === PERIOD_STATUSES.CLOSED).length,
      income: allPeriods.reduce((sum, period) => sum + period.income, 0),
      expense: allPeriods.reduce((sum, period) => sum + period.expense, 0),
    },
  };
}

/** Crea un período semanal con el contrato real del backend. */
export async function createPeriod(payload) {
  const startDate = payload.start_date ?? payload.startDate ?? toISODate(new Date());
  const range = getWeekRange(startDate);
  const year = payload.year ?? Number(String(startDate).slice(0, 4));
  const period = await post("/financial/periods", {
    week_number: payload.week_number ?? payload.number ?? getIsoWeekNumber(startDate),
    year,
    start_date: payload.start_date ?? range?.start,
    end_date: payload.end_date ?? range?.end,
    cash_account_id: payload.cash_account_id ?? payload.cashAccountId,
    opening_balance: Number(payload.opening_balance ?? 0),
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizePeriod(period);
}

/** Período semanal actual para una cuenta; FastAPI exige cash_account_id. */
export async function getCurrentPeriod(cashAccountId = "") {
  let accountId = cashAccountId;

  if (!accountId) {
    const accounts = await listAccounts({ status: "active" });
    const account = accounts.items.find((item) => item.type === "cash") ?? accounts.items[0];
    accountId = account?.id ?? "";
  }

  if (!accountId) return null;

  const period = await get("/financial/periods/current", {
    query: { cash_account_id: accountId },
  });

  return normalizePeriod(period);
}

/** Obtiene un período y compone movimientos y cierre. */
export async function getPeriod(id) {
  const rawPeriod = await get(`/financial/periods/${id}`);
  const period = normalizePeriod(rawPeriod);
  const [movements, closure] = await Promise.all([
    fetchAllMovements({
      accountId: period.cash_account_id,
      from: dateOnly(period.start_date),
      to: dateOnly(period.end_date),
    }),
    getClosureByPeriod(period.id),
  ]);

  return { ...period, movements, closure };
}

/** Actualiza un período con los campos editables reales. */
export async function updatePeriod(id, payload) {
  const period = await patch(`/financial/periods/${id}`, {
    start_date: payload.start_date ?? undefined,
    end_date: payload.end_date ?? undefined,
    status: payload.status ?? undefined,
    opening_balance:
      payload.opening_balance === undefined ? undefined : Number(payload.opening_balance),
    total_income: payload.total_income === undefined ? undefined : Number(payload.total_income),
    total_expense:
      payload.total_expense === undefined ? undefined : Number(payload.total_expense),
    net_flow: payload.net_flow === undefined ? undefined : Number(payload.net_flow),
    expected_balance:
      payload.expected_balance === undefined ? undefined : Number(payload.expected_balance),
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizePeriod(period);
}

/** Cierra el período; FastAPI toma al responsable del token. */
export async function closePeriod(id) {
  const period = await post(`/financial/periods/${id}/close`);

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizePeriod(period);
}

/** Resumen completo de un período, con movimientos y cierre reales. */
export async function getPeriodSummary(id) {
  const response = await get(`/financial/periods/${id}/summary`);
  const period = normalizePeriod(response?.period);
  const movements = await fetchAllMovements({
    accountId: period.cash_account_id,
    from: dateOnly(period.start_date),
    to: dateOnly(period.end_date),
  });

  let closure = null;
  const rawClosure = response?.cash_closure;

  if (rawClosure?.closure) {
    const adjustments = (rawClosure.adjustments ?? []).map(normalizeAdjustment);
    closure = {
      ...normalizeClosure(rawClosure.closure, response.period),
      adjustments,
    };
  } else {
    closure = await getClosureByPeriod(period.id);
  }

  const summary = summarizeMovements(movements);

  return {
    period,
    totals: {
      income: period.income,
      expense: period.expense,
      balance: period.balance,
      count: summary.count,
      cash_income: summary.income,
      cash_expense: summary.expense,
      cash_balance: summary.balance,
      cash_movements: movements.length,
    },
    movements,
    closure,
    daily_summaries: (response?.daily_summaries ?? []).map(normalizeDailySummary),
    total_adjustments: Number(response?.total_adjustments ?? 0),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Cierres de caja
 * ────────────────────────────────────────────────────────────────────────── */

async function fetchAllClosures(params = {}) {
  const {
    status = "",
    cashAccountId = "",
    from = "",
    to = "",
    minDifference = null,
    maxDifference = null,
  } = params;

  const rawClosures = await fetchAllPages("/financial/closures", "closures", {
    status: status || undefined,
    cash_account_id: cashAccountId || undefined,
    closed_from: from ? toApiDate(from) : undefined,
    closed_to: to ? toApiDate(to, true) : undefined,
    discrepancy_from:
      minDifference === null || minDifference === undefined || minDifference === ""
        ? undefined
        : minDifference,
    discrepancy_to:
      maxDifference === null || maxDifference === undefined || maxDifference === ""
        ? undefined
        : maxDifference,
    sort_by: "confirmed_at",
    sort_order: "desc",
  });

  const periods = await fetchAllPeriods({ cashAccountId });
  const periodById = new Map(periods.map((period) => [period.id, period]));

  return rawClosures.map((closure) =>
    normalizeClosure(closure, periodById.get(closure.weekly_period_id)),
  );
}

/** Lista cierres reales y conserva el contexto del período. */
export async function listClosures(params = {}) {
  const { status = "", search = "" } = params;
  const allClosures = await fetchAllClosures(params);
  const normalizedSearch = search.trim().toLowerCase();

  const items = allClosures.filter((closure) => {
    if (!normalizedSearch) return true;

    const haystack = [
      closure.responsible,
      closure.week_key,
      closure.notes,
      closure.observations,
      closure.cash_account_id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  return {
    items,
    closures: items,
    total: items.length,
    stats: {
      total: allClosures.length,
      confirmed: allClosures.filter((closure) => closure.status === CLOSURE_STATUSES.CONFIRMED).length,
      adjusted: allClosures.filter((closure) => closure.status === CLOSURE_STATUSES.ADJUSTED).length,
      pending: allClosures.filter((closure) => closure.status === CLOSURE_STATUSES.PENDING).length,
      pending_adjustments: allClosures.reduce(
        (sum, closure) => sum + Number(closure.adjustment_count ?? 0),
        0,
      ),
    },
  };
}

/** Crea el cierre de un período que ya fue cerrado. */
export async function createClosure(payload) {
  const periodId = payload.period_id ?? payload.weekly_period_id;
  const totalIncome = Number(payload.total_income ?? 0);
  const totalExpense = Number(payload.total_expense ?? 0);
  const netFlow = Number(payload.net_flow ?? totalIncome - totalExpense);
  const openingBalance = Number(payload.opening_balance ?? 0);
  const expectedBalance = Number(payload.expected_balance ?? payload.expected_cash ?? openingBalance + netFlow);
  const physicalBalance = Number(payload.physical_balance ?? payload.actual_cash ?? 0);
  const discrepancy = Number(payload.discrepancy ?? physicalBalance - expectedBalance);

  const closure = await post("/financial/closures", {
    weekly_period_id: periodId,
    cash_account_id: payload.cash_account_id,
    opening_balance: openingBalance,
    expected_balance: expectedBalance,
    physical_balance: physicalBalance,
    total_income: totalIncome,
    total_expense: totalExpense,
    net_flow: netFlow,
    discrepancy,
    observations: payload.observations ?? payload.notes ?? null,
    discrepancy_explanation: payload.discrepancy_explanation ?? null,
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeClosure(closure);
}

/** Obtiene un cierre con su período y ajustes. */
export async function getClosure(id) {
  const rawClosure = await get(`/financial/closures/${id}`);
  const period = await get(`/financial/periods/${rawClosure.weekly_period_id}`);
  const adjustments = await listClosureAdjustments(id);

  return {
    ...normalizeClosure(rawClosure, period),
    adjustments: adjustments.items,
  };
}

/** Actualiza el saldo físico y las observaciones del cierre. */
export async function updateClosure(id, payload) {
  const closure = await patch(`/financial/closures/${id}`, {
    physical_balance:
      payload.physical_balance === undefined && payload.actual_cash === undefined
        ? undefined
        : Number(payload.physical_balance ?? payload.actual_cash),
    discrepancy_explanation:
      payload.discrepancy_explanation ?? payload.difference_explanation ?? undefined,
    observations: payload.observations ?? payload.notes ?? undefined,
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeClosure(closure);
}

/** Obtiene el cierre de un período; devuelve null si aún no existe. */
export async function getClosureByPeriod(periodId) {
  try {
    const rawClosure = await get(`/financial/closures/by-period/${periodId}`);
    const period = await get(`/financial/periods/${periodId}`);
    return normalizeClosure(rawClosure, period);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
}

/** Confirma el cierre; el backend no admite cuerpo en esta operación. */
export async function confirmClosure(id) {
  const closure = await post(`/financial/closures/${id}/confirm`);

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeClosure(closure);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Ajustes de cierres
 * ────────────────────────────────────────────────────────────────────────── */

/** Lista los ajustes registrados sobre un cierre. */
export async function listClosureAdjustments(closureId, params = {}) {
  const rawAdjustments = await fetchAllPages(
    `/financial/closures/${closureId}/adjustments`,
    "adjustments",
    {
      movement_id: params.movementId || undefined,
      adjustment_type: params.adjustmentType || params.type || undefined,
    },
  );

  const items = rawAdjustments.map(normalizeAdjustment);
  return { items, adjustments: items, total: items.length };
}

/** Registra un ajuste con el movimiento y el impacto real del backend. */
export async function createClosureAdjustment(closureId, payload) {
  const adjustment = await post(`/financial/closures/${closureId}/adjustments`, {
    cash_closure_id: closureId,
    movement_id: payload.movement_id,
    adjustment_type: payload.adjustment_type ?? payload.type,
    amount: Number(payload.amount),
    impact_on_balance: Number(payload.impact_on_balance ?? 0),
    reason: payload.reason?.trim(),
    resolution: payload.resolution ?? null,
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeAdjustment(adjustment);
}

/** Resuelve un ajuste; `resolution` es un query param obligatorio. */
export async function resolveAdjustment(adjustmentId, payload = {}) {
  const resolution = payload.resolution ?? payload.justification;
  const adjustment = await patch(`/financial/adjustments/${adjustmentId}`, {
    query: { resolution },
  });

  invalidateData(DATA_DOMAINS.FINANCIALS);
  return normalizeAdjustment(adjustment);
}

/** Historial de cierres con los filtros reales del backend. */
export async function getClosuresHistory(params = {}) {
  const result = await listClosures(params);

  return {
    ...result,
    totals: {
      income: result.items.reduce((sum, closure) => sum + closure.total_income, 0),
      expense: result.items.reduce((sum, closure) => sum + closure.total_expense, 0),
      difference: result.items.reduce((sum, closure) => sum + closure.difference, 0),
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Vista de conjunto (dashboard)
 * ────────────────────────────────────────────────────────────────────────── */

/** Compone el dashboard con cuentas, movimientos, períodos y cierres reales. */
export async function getFinancialOverview() {
  const [accountResult, movements, periodResult, closureResult] = await Promise.all([
    listAccounts(),
    fetchAllMovements({ sortBy: "recorded_at", sortOrder: "desc" }),
    listPeriods(),
    listClosures(),
  ]);

  const accounts = accountResult.items;
  const activeAccounts = accounts.filter((account) => account.status === "active");
  const cashAccount = activeAccounts.find((account) => account.type === "cash") ?? activeAccounts[0];
  const currentPeriod = cashAccount ? await getCurrentPeriod(cashAccount.id) : null;

  const now = new Date();
  const monthPrefix = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const monthMovements = movements.filter((movement) =>
    String(movement.movement_date ?? "").startsWith(monthPrefix),
  );
  const weekMovements = currentPeriod
    ? movements.filter((movement) => {
        const timestamp = new Date(movement.movement_date).getTime();
        return (
          timestamp >= new Date(currentPeriod.start_date).getTime() &&
          timestamp <= new Date(currentPeriod.end_date).getTime()
        );
      })
    : [];

  const monthSummary = summarizeMovements(monthMovements);
  const weekSummary = summarizeMovements(weekMovements);
  const totalBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0);
  const cashBalance = activeAccounts
    .filter((account) => account.type === "cash")
    .reduce((sum, account) => sum + account.balance, 0);

  const confirmedClosures = closureResult.items.filter(
    (closure) => closure.status === CLOSURE_STATUSES.CONFIRMED,
  );
  const lastClosure = confirmedClosures[0] ?? closureResult.items[0] ?? null;
  const recentMovements = [...movements]
    .sort((left, right) =>
      String(left.registered_at ?? "").localeCompare(String(right.registered_at ?? "")),
    )
    .reverse()
    .slice(0, 8);
  const lastWeeks = [...periodResult.items]
    .sort((left, right) => String(right.start_date).localeCompare(String(left.start_date)))
    .slice(0, 6)
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
      cash_account_id: period.cash_account_id,
    }));

  return {
    currency: activeAccounts[0]?.currency ?? "COP",
    totals: {
      income: movements
        .filter((movement) => movement.type === MOVEMENT_TYPES.INCOME)
        .reduce((sum, movement) => sum + movement.amount, 0),
      expense: movements
        .filter((movement) => movement.type === MOVEMENT_TYPES.EXPENSE)
        .reduce((sum, movement) => sum + movement.amount, 0),
      available_balance: totalBalance,
      cash_balance: cashBalance,
    },
    week: {
      ...weekSummary,
      start_date: currentPeriod?.start_date ?? null,
      end_date: currentPeriod?.end_date ?? null,
      number: currentPeriod?.number ?? 0,
    },
    month: monthSummary,
    accounts,
    account_stats: accountResult.stats,
    last_closure: lastClosure,
    current_period: currentPeriod,
    recent_movements: recentMovements,
    last_weeks: lastWeeks,
  };
}
