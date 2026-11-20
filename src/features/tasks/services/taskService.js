/**
 * Servicio HTTP de tareas y sus cobros.
 *
 * Contratos verificados contra FastAPI:
 *   POST   /tasks/
 *   GET    /tasks/
 *   GET    /tasks/{task_id}
 *   PATCH  /tasks/{task_id}
 *   PATCH  /tasks/{task_id}/status
 *   PATCH  /tasks/{task_id}/priority
 *   DELETE /tasks/{task_id}
 *   POST   /tasks/{task_id}/payments
 *   GET    /tasks/{task_id}/payments
 *   GET    /tasks/pending-payments
 *
 * El frontend nunca crea un movimiento paralelo: el backend genera el ingreso
 * al registrar el abono y actualiza la tarea en la misma operación.
 */

import { del, get, patch, post } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/tokenStore";
import { DATA_DOMAINS, invalidateData } from "@/lib/data/invalidation";

import { PAYMENT_STATUSES } from "../constants";

const TASK_PAGE_SIZE = 20;
const REFERENCE_PAGE_SIZE = 100;

let pendingPaymentsRouteState = "unknown";

function asNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function asNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeCustomer(customer) {
  const name = customer?.full_name || customer?.display_name || customer?.business_name || "Cliente";

  return {
    ...customer,
    id: customer.id,
    name,
    full_name: customer.full_name ?? name,
    display_name: customer.display_name ?? name,
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    type: customer.customer_type ?? customer.type ?? "natural",
    status: customer.status ?? "active",
  };
}

function normalizeTask(task, { customers = [], currentUser = null } = {}) {
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  const customer = task.customer_id ? customerMap.get(task.customer_id) : null;
  const assigneeName =
    task.assignee_name ||
    task.assignee?.full_name ||
    (task.assignee_id && task.assignee_id === currentUser?.id
      ? currentUser.full_name || currentUser.name || currentUser.username
      : "") ||
    (typeof task.assignee === "string" ? task.assignee : "") ||
    "";

  const totalPrice = asNullableNumber(task.total_price);
  const totalPaid = asNumber(task.total_paid);
  const pendingBalance = asNumber(task.pending_balance);

  return {
    ...task,
    id: task.id,
    title: task.title ?? "",
    description: task.description ?? "",
    status: task.status ?? "pending",
    priority: task.priority ?? "medium",
    due_date: task.due_date ?? null,
    customer_id: task.customer_id ?? null,
    customer_name: task.customer_name || customer?.name || "",
    customer_phone: task.customer_phone || customer?.phone || "",
    customer_email: task.customer_email || customer?.email || "",
    assignee_id: task.assignee_id ?? null,
    assignee_name: assigneeName,
    total_price: totalPrice,
    total_paid: totalPaid,
    pending_balance: pendingBalance,
    payment_status: task.payment_status ?? PAYMENT_STATUSES.NO_PAYMENTS,
    has_pending_balance:
      typeof task.has_pending_balance === "boolean"
        ? task.has_pending_balance
        : pendingBalance > 0,
    last_payment_date: task.last_payment_date ?? null,
    created_at: task.created_at ?? null,
    updated_at: task.updated_at ?? null,
    completed_at: task.completed_at ?? null,
  };
}

function extractReference(concept) {
  const match = String(concept ?? "").match(/\(Ref:\s*([^)]+)\)\s*$/i);
  return match?.[1] ?? "";
}

function normalizePayment(payment, accountNames = new Map()) {
  return {
    ...payment,
    id: payment.id,
    task_id: payment.task_id,
    amount: asNumber(payment.amount),
    transaction_date: payment.transaction_date,
    recorded_at: payment.recorded_at,
    cash_account_id: payment.cash_account_id,
    cash_account_name:
      payment.cash_account_name ?? accountNames.get(payment.cash_account_id) ?? "",
    payment_method: payment.payment_method ?? "other",
    concept: payment.concept ?? "",
    description: payment.description ?? "",
    reference: payment.reference ?? extractReference(payment.concept),
    created_by_id: payment.created_by_id,
    created_by_name: payment.created_by_name ?? "",
    is_late_entry: Boolean(payment.is_late_entry),
    status: payment.status ?? "registered",
  };
}

function normalizeFinancialMovementAsPayment(movement, accountNames = new Map()) {
  return normalizePayment(
    {
      ...movement,
      task_id: movement.task_id,
      amount: movement.amount,
      transaction_date: movement.transaction_date,
      recorded_at: movement.recorded_at,
      cash_account_id: movement.cash_account_id,
      payment_method: movement.payment_method,
      concept: movement.concept,
      description: movement.description,
      reference: extractReference(movement.concept),
      created_by_id: movement.created_by_id,
      is_late_entry: movement.is_late_entry,
      status: "registered",
    },
    accountNames,
  );
}

async function fetchCustomerDirectory({ activeOnly = false } = {}) {
  try {
    const response = await get("/customers/", {
      query: {
        page: 1,
        page_size: REFERENCE_PAGE_SIZE,
        status: activeOnly ? "active" : undefined,
      },
    });

    return (response?.customers ?? []).map(normalizeCustomer);
  } catch {
    // La ficha de tarea sigue siendo útil aunque el tenant no permita listar clientes.
    return [];
  }
}

async function fetchAllTasks(params = {}) {
  const tasks = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await get("/tasks/", {
      query: {
        page,
        page_size: TASK_PAGE_SIZE,
        status: params.status || undefined,
        priority: params.priority || undefined,
        assignee_id: params.assigneeId || undefined,
        search: params.search || undefined,
        sort_by: params.sortBy || "created_at",
        sort_order: params.sortOrder || "desc",
      },
    });

    const pageItems = response?.tasks ?? [];
    tasks.push(...pageItems);
    totalPages = Math.max(1, Number(response?.total_pages ?? 1));

    if (pageItems.length === 0) break;
    page += 1;
  } while (page <= totalPages);

  return tasks;
}

/**
 * Lista tareas con filtros, búsqueda, orden y paginación del backend.
 */
export async function listTasks(params = {}) {
  const {
    status = "",
    priority = "",
    assigneeId = "",
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    pageSize = 8,
  } = params;

  const [response, customers] = await Promise.all([
    get("/tasks/", {
      query: {
        page,
        page_size: pageSize,
        status: status || undefined,
        priority: priority || undefined,
        assignee_id: assigneeId || undefined,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      },
    }),
    fetchCustomerDirectory(),
  ]);

  const currentUser = getCurrentUser();
  const items = (response?.tasks ?? []).map((task) =>
    normalizeTask(task, { customers, currentUser }),
  );

  return {
    items,
    tasks: items,
    total: Number(response?.total ?? items.length),
    page: Number(response?.page ?? page),
    pageSize: Number(response?.page_size ?? pageSize),
    totalPages: Number(response?.total_pages ?? 1),
    stats: null,
  };
}

/** Obtiene una tarea y enriquece sus datos de cliente y responsable. */
export async function getTask(id) {
  const [task, customers] = await Promise.all([
    get(`/tasks/${id}`),
    fetchCustomerDirectory(),
  ]);

  return normalizeTask(task, { customers, currentUser: getCurrentUser() });
}

/**
 * Crea una tarea. El abono inicial se envía en el mismo POST y el backend crea
 * un único movimiento financiero asociado.
 */
export async function createTask(payload) {
  const task = await post("/tasks/", payload);
  const customers = await fetchCustomerDirectory();

  invalidateData(DATA_DOMAINS.TASKS);

  if (asNumber(payload.initial_payment_amount) > 0) {
    invalidateData(DATA_DOMAINS.FINANCIALS);
  }

  return normalizeTask(task, { customers, currentUser: getCurrentUser() });
}

/** Actualiza los campos editables de una tarea, incluido el precio. */
export async function updateTask(id, payload) {
  const task = await patch(`/tasks/${id}`, payload);
  const customers = await fetchCustomerDirectory();

  invalidateData(DATA_DOMAINS.TASKS, DATA_DOMAINS.FINANCIALS);

  return normalizeTask(task, { customers, currentUser: getCurrentUser() });
}

/** Cambia el estado operativo sin tocar el historial financiero. */
export async function updateTaskStatus(id, status) {
  const task = await patch(`/tasks/${id}/status`, { status });
  const customers = await fetchCustomerDirectory();

  invalidateData(DATA_DOMAINS.TASKS, DATA_DOMAINS.FINANCIALS);

  return normalizeTask(task, { customers, currentUser: getCurrentUser() });
}

/** Cambia la prioridad de la tarea. */
export async function updateTaskPriority(id, priority) {
  const task = await patch(`/tasks/${id}/priority`, { priority });
  const customers = await fetchCustomerDirectory();

  invalidateData(DATA_DOMAINS.TASKS);

  return normalizeTask(task, { customers, currentUser: getCurrentUser() });
}

/** Elimina la tarea según los permisos y restricciones del backend. */
export async function deleteTask(id) {
  const result = await del(`/tasks/${id}`);

  invalidateData(DATA_DOMAINS.TASKS, DATA_DOMAINS.FINANCIALS);

  return result;
}

/** Registra un abono; el backend actualiza tarea y movimiento de forma atómica. */
export async function addTaskPayment(id, payload) {
  const response = await post(`/tasks/${id}/payments`, payload);
  const payment = response?.payments?.[0];

  if (!payment) {
    const error = new Error("El backend no devolvió el abono registrado.");
    error.code = "TASK_PAYMENT_NOT_RETURNED";
    throw error;
  }

  invalidateData(DATA_DOMAINS.TASKS, DATA_DOMAINS.FINANCIALS);

  return normalizePayment(payment);
}

/**
 * Consulta el historial de abonos de una tarea.
 *
 * `GET /financial/movements?task_id=...` conserva el filtro antes de paginar y
 * es la fuente principal. El endpoint specialized se conserva como fallback
 * para tenants sin permiso de lectura de movimientos; su paginación actual
 * del backend se aplica después del filtro y no debe preferirse.
 */
export async function getTaskPayments(id, params = {}) {
  const { page = 1, pageSize = 20 } = params;
  let financialResponse = null;
  let specializedResponse = null;

  try {
    financialResponse = await get("/financial/movements", {
      query: {
        task_id: id,
        page,
        page_size: pageSize,
        sort_by: "transaction_date",
        sort_order: "desc",
      },
    });
  } catch (financialError) {
    try {
      specializedResponse = await get(`/tasks/${id}/payments`, {
        query: { page, page_size: pageSize },
      });
    } catch {
      throw financialError;
    }
  }

  const accountResult = await listPaymentAccounts();
  const accountNames = new Map(accountResult.items.map((account) => [account.id, account.name]));

  if (financialResponse) {
    const payments = (financialResponse?.movements ?? []).map((movement) =>
      normalizeFinancialMovementAsPayment(movement, accountNames),
    );

    return {
      items: payments,
      payments,
      total: Number(financialResponse?.total ?? payments.length),
      page: Number(financialResponse?.page ?? page),
      pageSize: Number(financialResponse?.page_size ?? pageSize),
      totalPages: Number(financialResponse?.total_pages ?? 1),
    };
  }

  const payments = (specializedResponse?.payments ?? []).map((payment) =>
    normalizePayment(payment, accountNames),
  );

  return {
    items: payments,
    payments,
    total: Number(specializedResponse?.total ?? payments.length),
    page: Number(specializedResponse?.page ?? page),
    pageSize: Number(specializedResponse?.page_size ?? pageSize),
    totalPages: Number(specializedResponse?.total_pages ?? 1),
  };
}

/**
 * Lista clientes disponibles para asociar una tarea o filtrar sus cobros.
 */
export async function listTaskCustomers(params = {}) {
  const { search = "", page = 1, pageSize = REFERENCE_PAGE_SIZE } = params;
  const response = await get("/customers/", {
    query: {
      page,
      page_size: pageSize,
      status: "active",
      query: search || undefined,
    },
  });

  return {
    items: (response?.customers ?? []).map(normalizeCustomer),
    total: Number(response?.total ?? 0),
  };
}

/** Lista cuentas activas que pueden recibir un abono. */
export async function listPaymentAccounts() {
  const response = await get("/financial/accounts", {
    query: { page: 1, page_size: REFERENCE_PAGE_SIZE, is_active: true },
  });

  const items = (response?.accounts ?? []).map((account) => ({
    ...account,
    id: account.id,
    name: account.name,
    type: account.account_type,
    status: account.is_active ? "active" : "archived",
    currency: account.currency,
    balance: asNumber(account.current_balance),
    opening_balance: 0,
  }));

  return { items, total: Number(response?.total ?? items.length) };
}

/**
 * Busca el período semanal real que contiene una fecha de movimiento para la
 * cuenta receptora. Se usa para advertir y justificar registros sobre cierres.
 */
export async function getPaymentPeriodContext(date, cashAccountId = "") {
  if (!date || !cashAccountId) return null;

  const year = Number(String(date).slice(0, 4));
  if (!year) return null;

  try {
    const response = await get("/financial/periods", {
      query: {
        year,
        cash_account_id: cashAccountId,
        page: 1,
        page_size: REFERENCE_PAGE_SIZE,
        sort_by: "start_date",
        sort_order: "desc",
      },
    });

    const periods = response?.periods ?? [];
    const timestamp = new Date(`${String(date).slice(0, 10)}T12:00:00`).getTime();

    return (
      periods.find((period) => {
        const start = new Date(period.start_date).getTime();
        const end = new Date(period.end_date).getTime();

        return Number.isFinite(start) && Number.isFinite(end) && timestamp >= start && timestamp <= end;
      }) ?? null
    );
  } catch {
    return null;
  }
}

function isPendingRouteValidationError(error) {
  return (
    error?.status === 422 &&
    Array.isArray(error?.details?.detail) &&
    error.details.detail.some((item) => item?.loc?.includes("task_id"))
  );
}

async function fetchAllPendingPaymentsFromEndpoint(params) {
  const tasks = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await get("/tasks/pending-payments", {
      query: {
        page,
        page_size: REFERENCE_PAGE_SIZE,
        customer_id: params.customerId || undefined,
        status: params.status || undefined,
        min_pending_balance:
          params.minBalance === null || params.minBalance === undefined || params.minBalance === ""
            ? undefined
            : params.minBalance,
        max_pending_balance:
          params.maxBalance === null || params.maxBalance === undefined || params.maxBalance === ""
            ? undefined
            : params.maxBalance,
        only_active: params.onlyActive ? true : undefined,
        only_completed: params.onlyCompleted ? true : undefined,
        search: params.search || undefined,
        sort_by: params.sortBy || "created_at",
        sort_order: params.sortOrder || "desc",
      },
    });

    const pageItems = response?.tasks ?? [];
    tasks.push(...pageItems);
    totalPages = Math.max(1, Number(response?.total_pages ?? 1));

    if (pageItems.length === 0) break;
    page += 1;
  } while (page <= totalPages);

  pendingPaymentsRouteState = "available";
  return tasks;
}

function compareNullableDates(left, right, direction) {
  const leftTime = left ? new Date(left).getTime() : Number.POSITIVE_INFINITY;
  const rightTime = right ? new Date(right).getTime() : Number.POSITIVE_INFINITY;

  if (leftTime === rightTime) return 0;
  if (Number.isNaN(leftTime)) return 1;
  if (Number.isNaN(rightTime)) return -1;

  const comparison = leftTime - rightTime;
  return direction === "asc" ? comparison : -comparison;
}

/**
 * Lista todos los trabajos con deuda.
 *
 * El backend actual declara `/pending-payments` después de `/{task_id}`, por lo
 * que esa ruta puede ser interceptada por el parámetro UUID. Se intenta el
 * endpoint oficial y, solo ante ese 422 concreto, se usa `GET /tasks/` y se
 * filtra por el campo autoritativo `has_pending_balance`. No se generan datos
 * locales ni se recalculan saldos en el frontend.
 */
export async function listPendingPayments(params = {}) {
  const {
    customerId = "",
    status = "",
    search = "",
    dueFrom = "",
    dueTo = "",
    minBalance = null,
    maxBalance = null,
    onlyActive = false,
    onlyCompleted = false,
    sortBy = "due_date",
    sortOrder = "asc",
    page = 1,
    pageSize = 10,
  } = params;

  let rawTasks;

  try {
    if (pendingPaymentsRouteState === "unavailable") {
      throw new Error("PENDING_PAYMENTS_ROUTE_UNAVAILABLE");
    }

    rawTasks = await fetchAllPendingPaymentsFromEndpoint({
      customerId,
      status,
      search,
      minBalance,
      maxBalance,
      onlyActive,
      onlyCompleted,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    const isUnavailable =
      pendingPaymentsRouteState === "unavailable" ||
      isPendingRouteValidationError(error);

    if (!isUnavailable) throw error;

    pendingPaymentsRouteState = "unavailable";

    const allTasks = await fetchAllTasks({
      sortBy: "created_at",
      sortOrder: "desc",
    });

    rawTasks = allTasks.filter(
      (task) => task.has_pending_balance === true || asNumber(task.pending_balance) > 0,
    );
  }

  const customers = await fetchCustomerDirectory();
  const currentUser = getCurrentUser();
  let items = rawTasks.map((task) => normalizeTask(task, { customers, currentUser }));

  if (customerId) {
    items = items.filter((task) => task.customer_id === customerId);
  }

  if (status) {
    items = items.filter((task) => task.status === status);
  }

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();

    items = items.filter((task) =>
      [task.title, task.description, task.customer_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }

  if (dueFrom) {
    const from = new Date(`${dueFrom}T00:00:00`);
    items = items.filter((task) => task.due_date && new Date(task.due_date) >= from);
  }

  if (dueTo) {
    const to = new Date(`${dueTo}T23:59:59`);
    items = items.filter((task) => task.due_date && new Date(task.due_date) <= to);
  }

  if (minBalance !== null && minBalance !== undefined && minBalance !== "") {
    items = items.filter((task) => task.pending_balance >= Number(minBalance));
  }

  if (maxBalance !== null && maxBalance !== undefined && maxBalance !== "") {
    items = items.filter((task) => task.pending_balance <= Number(maxBalance));
  }

  if (onlyActive) {
    items = items.filter((task) => task.status !== "completed");
  }

  if (onlyCompleted) {
    items = items.filter((task) => task.status === "completed");
  }

  items.sort((left, right) => {
    let comparison = 0;

    if (sortBy === "pending_balance") {
      comparison = left.pending_balance - right.pending_balance;
    } else if (sortBy === "due_date") {
      comparison = compareNullableDates(left.due_date, right.due_date, sortOrder);
    } else if (sortBy === "created_at") {
      comparison = compareNullableDates(left.created_at, right.created_at, sortOrder);
    } else {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      comparison = (priorityOrder[left.priority] ?? 0) - (priorityOrder[right.priority] ?? 0);
      if (sortOrder === "desc") comparison *= -1;
    }

    if (comparison === 0) {
      comparison = compareNullableDates(left.due_date, right.due_date, "asc");
    }

    return comparison;
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = items.filter(
    (task) =>
      task.due_date &&
      new Date(task.due_date) < today &&
      task.status !== "completed" &&
      task.status !== "cancelled",
  );

  return {
    items: pageItems,
    tasks: pageItems,
    total,
    page,
    pageSize,
    totalPages,
    stats: {
      pending_total: items.reduce((sum, task) => sum + task.pending_balance, 0),
      jobs_with_debt: items.length,
      active_jobs_with_debt: items.filter((task) => task.status !== "completed").length,
      completed_jobs_with_debt: items.filter((task) => task.status === "completed").length,
      overdue_jobs: overdueTasks.length,
      overdue_total: overdueTasks.reduce((sum, task) => sum + task.pending_balance, 0),
    },
  };
}

/** Extrae errores de campo enviados por FastAPI. */
export function getTaskApiFieldErrors(error) {
  const details = error?.details?.detail;

  if (!Array.isArray(details)) return {};

  return details.reduce((errors, item) => {
    const field = item?.loc?.at(-1);

    if (typeof field === "string" && item?.msg) {
      errors[field] = item.msg;
    }

    return errors;
  }, {});
}
