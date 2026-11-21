/**
 * Servicio de cotizaciones de WorkFlowPro.
 *
 * Conectado al backend de FastAPI (prefijo /api/v1).
 *
 * Contrato del backend:
 *   POST   /quotations/                    → crear
 *   POST   /quotations/calculate           → calcular totales (vista previa)
 *   GET    /quotations/                    → listar (filtros, paginación, búsqueda)
 *   GET    /quotations/{id}                → obtener cotización
 *   GET    /quotations/{id}/full           → completa + items + historial + financiero
 *   PATCH  /quotations/{id}                → actualizar parcialmente
 *   PATCH  /quotations/{id}/status         → cambiar estado
 *   POST   /quotations/{id}/send           → enviar (draft → sent)
 *   POST   /quotations/{id}/accept         → aceptar
 *   POST   /quotations/{id}/reject         → rechazar
 *   POST   /quotations/{id}/duplicate      → duplicar
 *   POST   /quotations/{id}/convert-to-task→ convertir a tarea
 *   POST   /quotations/{id}/items          → agregar ítem
 *   PATCH  /quotations/{id}/items/{item_id}→ actualizar ítem
 *   DELETE /quotations/{id}/items/{item_id}→ eliminar ítem
 *
 * Todas las rutas requieren `Authorization: Bearer <access_token>`.
 */

import { del, get, patch, post } from "@/lib/api";

import {
  QUOTATION_STATUSES,
  calculateQuotationTotals,
} from "../constants";

/** Copia profunda de una cotización. */
function clone(quotation) {
  return { ...quotation, items: quotation.items.map((item) => ({ ...item })) };
}

function notFound(id) {
  const error = new Error("No encontramos la cotización solicitada.");
  error.code = "QUOTATION_NOT_FOUND";
  error.status = 404;
  return error;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Mapeo de campos: frontend ↔ backend
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Convierte la forma del frontend a la forma del backend para crear.
 *
 * @param {object} payload - datos del formulario frontend
 * @returns {object} cuerpo listo para enviar a FastAPI
 */
function toBackendCreate(payload) {
  const items = (payload.items ?? []).map((item) => ({
    item_type: "service",
    name: item.description ?? "",
    description: item.description ?? "",
    quantity: Number(item.quantity ?? 1),
    unit_price: Number(item.unit_price ?? 0),
    discount_percent: Number(item.discount ?? 0),
  }));

  const expiryDate = payload.valid_until
    ? new Date(payload.valid_until).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    customer_id: payload.customer_id,
    title: payload.title ?? "",
    description: payload.notes ?? undefined,
    observations: payload.notes ?? undefined,
    payment_terms: payload.payment_terms ?? undefined,
    expiry_date: expiryDate,
    items,
  };
}

/**
 * Convierte un ítem del frontend a la forma del backend.
 */
function toBackendItem(item) {
  return {
    item_type: "service",
    name: item.description ?? "",
    description: item.description ?? "",
    quantity: Number(item.quantity ?? 1),
    unit_price: Number(item.unit_price ?? 0),
    discount_percent: Number(item.discount ?? 0),
  };
}

/**
 * Convierte la respuesta del backend a la forma interna del frontend.
 *
 * @param {object} quotation - objeto devuelto por FastAPI
 * @returns {object} cotización en forma de frontend
 */
function fromBackend(quotation) {
  if (!quotation) return null;

  const items = Array.isArray(quotation.items)
    ? quotation.items.map((item) => ({
        id: item.id,
        description: item.name ?? item.description ?? "",
        quantity: Number(item.quantity ?? 1),
        unit_price: Number(item.unit_price ?? 0),
        discount: Number(item.discount_percent ?? 0),
        tax_rate: 0,
        line_total: Number(item.line_total ?? 0),
      }))
    : [];

  const totals = calculateQuotationTotals(items, quotation.currency ?? "USD");
  // Sobrescribimos con los valores reales del backend cuando estén disponibles.
  if (quotation.subtotal !== undefined) totals.subtotal = Number(quotation.subtotal);
  if (quotation.tax_amount !== undefined) totals.tax_total = Number(quotation.tax_amount);
  if (quotation.discount_amount !== undefined) totals.discount_total = Number(quotation.discount_amount);
  if (quotation.total !== undefined) totals.total = Number(quotation.total);

  return {
    ...quotation,
    id: quotation.id,
    number: quotation.quotation_number ?? quotation.number,
    type: "natural",
    customer_id: quotation.customer_id ?? null,
    customer_name:
      (quotation.customer?.full_name ||
        quotation.customer?.display_name ||
        quotation.customer_name) ??
      "",
    customer_email: quotation.customer?.email ?? quotation.customer_email ?? "",
    title: quotation.title ?? "",
    status: quotation.status ?? QUOTATION_STATUSES.DRAFT,
    currency: quotation.currency ?? "USD",
    items,
    valid_until: quotation.expiry_date ?? null,
    notes: quotation.observations ?? quotation.notes ?? "",
    payment_terms: quotation.payment_terms ?? "",
    subtotal: totals.subtotal,
    discount_total: totals.discount_total,
    tax_total: totals.tax_total,
    total: totals.total,
    sent_at: quotation.sent_at ?? null,
    accepted_at: quotation.accepted_at ?? null,
    rejected_at: quotation.rejected_at ?? null,
    rejection_reason: null,
    created_at: quotation.created_at ?? null,
    updated_at: quotation.updated_at ?? null,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Listado y detalle
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista cotizaciones con filtros, búsqueda y paginación.
 *
 * @param {{ status?: string, type?: string, customerId?: string, search?: string, page?: number, pageSize?: number }} params
 */
export async function listQuotations(params = {}) {
  const { status = "", type = "", customerId = "", search = "", page = 1, pageSize = 10 } = params;

  const response = await get("/quotations/", {
    query: {
      status: status || undefined,
      customer_id: customerId || undefined,
      search: search || undefined,
      page,
      page_size: pageSize,
      sort_by: "issue_date",
      sort_order: "desc",
    },
  });

  const raw = response?.quotations ?? [];
  const items = raw.map(fromBackend);

  return {
    items,
    total: Number(response?.total ?? raw.length),
    page: Number(response?.page ?? page),
    pageSize: Number(response?.page_size ?? pageSize),
    stats: {
      total: Number(response?.total ?? raw.length),
      draft: raw.filter((q) => q.status === "draft").length,
      sent: raw.filter((q) => q.status === "sent").length,
      accepted: raw.filter((q) => q.status === "accepted").length,
      rejected: raw.filter((q) => q.status === "rejected").length,
      amount: raw
        .filter((q) => q.status !== "cancelled")
        .reduce((acc, q) => acc + Number(q.total ?? 0), 0),
    },
  };
}

/**
 * Obtiene una cotización por su id.
 */
export async function getQuotation(id) {
  const quotation = await get(`/quotations/${id}`);

  if (!quotation) throw notFound(id);

  return fromBackend(quotation);
}

/**
 * Obtiene la cotización completa: datos + items + historial + financiero.
 */
export async function getQuotationFull(id) {
  const full = await get(`/quotations/${id}/full`);

  if (!full) throw notFound(id);

  return {
    quotation: fromBackend(full?.quotation ?? full),
    items: Array.isArray(full?.items) ? full.items.map((i) => ({ ...i })) : [],
    history: [],
    financial: { ...(full?.financial ?? {}) },
  };
}

/**
 * Resumen financiero de la cotización.
 */
export async function getQuotationFinancial(id) {
  const financial = await get(`/quotations/${id}/financial`);

  if (!financial) throw notFound(id);

  return {
    currency: financial.currency ?? "USD",
    total: Number(financial.total ?? 0),
    invoiced: Number(financial.invoiced ?? 0),
    paid: Number(financial.paid ?? 0),
    outstanding: Number(financial.outstanding ?? 0),
    invoices_count: 0,
    pending_invoices: 0,
    average_ticket: 0,
    last_invoice_date: null,
    last_payment_date: null,
    win_probability: 0,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Alta y cálculo
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Crea una cotización (natural o legal).
 */
export async function createQuotation(payload) {
  const body = toBackendCreate(payload);
  const created = await post("/quotations/", body);

  return fromBackend(created);
}

/**
 * Calcula los totales de una cotización sin guardarla (vista previa).
 *
 * @param {{ items?: object[], currency?: string }} payload
 * @returns {Promise<{ subtotal: number, discount_total: number, tax_total: number, total: number, currency: string }>}
 */
export async function calculateQuotation(payload) {
  const response = await post("/quotations/calculate", {
    items: (payload?.items ?? []).map(toBackendItem),
    profit_margin: 0,
    tax_rate: Number(payload?.tax_rate ?? 19),
    discount_amount: 0,
  });

  return {
    subtotal: Number(response?.subtotal ?? 0),
    discount_total: Number(response?.discount_amount ?? 0),
    tax_total: Number(response?.tax_amount ?? 0),
    total: Number(response?.total ?? 0),
    currency: payload?.currency ?? "USD",
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Edición, estado y transiciones
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Actualiza parcialmente una cotización.
 */
export async function updateQuotation(id, payload) {
  const body = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.notes !== undefined) {
    body.description = payload.notes;
    body.observations = payload.notes;
  }
  if (payload.payment_terms !== undefined) body.payment_terms = payload.payment_terms;
  if (payload.valid_until !== undefined)
    body.expiry_date = new Date(payload.valid_until).toISOString();
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.items) {
    body.items = payload.items.map(toBackendItem);
  }

  const updated = await patch(`/quotations/${id}`, body);

  return fromBackend(updated);
}

/**
 * Cambia el estado de la cotización.
 */
export async function updateQuotationStatus(id, status) {
  const updated = await patch(`/quotations/${id}/status`, { status });

  return fromBackend(updated);
}

/**
 * Envía la cotización (draft → sent).
 */
export async function sendQuotation(id) {
  const updated = await post(`/quotations/${id}/send`, {});

  return fromBackend(updated);
}

/**
 * El cliente acepta la cotización.
 */
export async function acceptQuotation(id) {
  const updated = await post(`/quotations/${id}/accept`, {});

  return fromBackend(updated);
}

/**
 * El cliente rechaza la cotización.
 *
 * @param {{ reason?: string }} payload
 */
export async function rejectQuotation(id, payload = {}) {
  const updated = await post(`/quotations/${id}/reject`, {
    reason: payload.reason ?? "",
  });

  return fromBackend(updated);
}

/**
 * Duplica una cotización creando una nueva en borrador.
 */
export async function duplicateQuotation(id) {
  const duplicated = await post(`/quotations/${id}/duplicate`, {});

  return fromBackend(duplicated);
}

/**
 * Convierte la cotización en una tarea.
 *
 * El backend crea el registro en el módulo de tareas; no genera ingresos
 * financieros automáticamente.
 */
export async function convertQuotationToTask(id, payload = {}) {
  const task = await post(`/quotations/${id}/convert-to-task`, {
    task_title: payload.title,
    task_description: payload.description,
    task_priority: payload.priority ?? "medium",
  });

  return task;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Ítems
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Agrega un ítem a la cotización.
 */
export async function addQuotationItem(id, payload) {
  const item = await post(`/quotations/${id}/items`, toBackendItem(payload));

  return {
    id: item.id,
    description: item.name ?? item.description ?? "",
    quantity: Number(item.quantity ?? 1),
    unit_price: Number(item.unit_price ?? 0),
    discount: Number(item.discount_percent ?? 0),
    tax_rate: 0,
    line_total: Number(item.line_total ?? 0),
  };
}

/**
 * Actualiza un ítem de la cotización.
 */
export async function updateQuotationItem(id, itemId, payload) {
  const item = await patch(`/quotations/${id}/items/${itemId}`, toBackendItem(payload));

  return {
    id: item.id,
    description: item.name ?? item.description ?? "",
    quantity: Number(item.quantity ?? 1),
    unit_price: Number(item.unit_price ?? 0),
    discount: Number(item.discount_percent ?? 0),
    tax_rate: 0,
    line_total: Number(item.line_total ?? 0),
  };
}

/**
 * Elimina un ítem de la cotización.
 */
export async function deleteQuotationItem(id, itemId) {
  await del(`/quotations/${id}/items/${itemId}`);

  return { id: itemId };
}
