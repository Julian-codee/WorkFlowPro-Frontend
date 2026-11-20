/**
 * Servicio de cotizaciones de WorkFlowPro.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  MODO MOCK: todavía NO se consumen los endpoints del backend.
 *
 * Todas las funciones tienen marcada la petición real que te faltará por
 * implementar. Para activar la integración basta con sustituir el cuerpo
 * `mock*` por la llamada marcada en cada función.
 *
 * Contrato del backend (FastAPI, prefijo /api/v1):
 *   POST   /quotations/                    → crear (natural/legal)
 *   POST   /quotations/calculate           → calcular totales (vista previa)
 *   GET    /quotations/                    → listar (filtros, paginación, búsqueda)
 *   GET    /quotations/{id}                → obtener cotización
 *   GET    /quotations/{id}/full           → completa + items + historial + financiero
 *   GET    /quotations/{id}/financial      → resumen financiero
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
 * Todas las rutas requieren `Authorization: Bearer <access_token>`
 * (el cliente HTTP de `src/lib/api` ya lo añade automáticamente).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { del, get, patch, post } from "@/lib/api";

import {
  QUOTATION_STATUSES,
  calculateQuotationTotals,
} from "../constants";
import { MOCK_FINANCIAL, MOCK_HISTORY, MOCK_QUOTATIONS, MOCK_STATS } from "./mockData";

/** Latencia simulada para que los estados de carga sean visibles. */
function mockDelay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Copia en memoria del store ficticio. */
let mockStore = MOCK_QUOTATIONS.map((quotation) => ({
  ...quotation,
  items: quotation.items.map((item) => ({ ...item })),
}));
let mockHistory = Object.fromEntries(
  Object.entries(MOCK_HISTORY).map(([quotationId, entries]) => [
    quotationId,
    entries.map((entry) => ({ ...entry })),
  ]),
);

function clone(quotation) {
  return { ...quotation, items: quotation.items.map((item) => ({ ...item })) };
}

/** Contador incremental: genera ids únicos para los ítems creados en mock. */
let mockItemSequence = 0;

function nextItemId() {
  mockItemSequence += 1;
  return `itm_mock_${mockItemSequence}`;
}

function notFound(id) {
  const error = new Error("No encontramos la cotización solicitada.");
  error.code = "QUOTATION_NOT_FOUND";
  error.status = 404;
  return error;
}

function historyEntry(quotationId, action, detail) {
  const entries = mockHistory[quotationId] ?? [];
  const entry = {
    id: `hst_${String(entries.length + 1).padStart(3, "0")}`,
    action,
    actor: "Ana Morales",
    created_at: new Date().toISOString(),
    detail,
  };

  mockHistory = { ...mockHistory, [quotationId]: [entry, ...entries] };
}

function recalculate(quotation) {
  return {
    ...quotation,
    ...calculateQuotationTotals(quotation.items, quotation.currency),
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

  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/quotations/", {
  //   query: { status, type, customer_id: customerId, search, page, page_size: pageSize },
  // });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay();

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = mockStore.filter((quotation) => {
    if (status && quotation.status !== status) return false;
    if (type && quotation.type !== type) return false;
    if (customerId && quotation.customer_id !== customerId) return false;

    if (normalizedSearch) {
      const haystack = [
        quotation.number,
        quotation.title,
        quotation.customer_name,
        quotation.customer_email,
        quotation.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedSearch)) return false;
    }

    return true;
  });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(clone);

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
    stats: {
      ...MOCK_STATS,
      total: mockStore.length,
      draft: mockStore.filter((quotation) => quotation.status === "draft").length,
      sent: mockStore.filter((quotation) => quotation.status === "sent").length,
      accepted: mockStore.filter((quotation) => quotation.status === "accepted").length,
      rejected: mockStore.filter((quotation) => quotation.status === "rejected").length,
      amount: mockStore
        .filter((quotation) => quotation.status !== "cancelled")
        .reduce((acc, quotation) => acc + quotation.total, 0),
    },
  };
}

/**
 * Obtiene una cotización por su id.
 */
export async function getQuotation(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/quotations/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(300);

  const quotation = mockStore.find((item) => item.id === id);

  if (!quotation) throw notFound(id);

  return clone(quotation);
}

/**
 * Obtiene la cotización completa: datos + items + historial + financiero.
 */
export async function getQuotationFull(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/quotations/${id}/full`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const quotation = mockStore.find((item) => item.id === id);

  if (!quotation) throw notFound(id);

  return {
    quotation: clone(quotation),
    items: quotation.items.map((item) => ({ ...item })),
    history: (mockHistory[id] ?? []).map((entry) => ({ ...entry })),
    financial: { ...(MOCK_FINANCIAL[id] ?? emptyFinancial(quotation.currency)) },
  };
}

/**
 * Resumen financiero de la cotización.
 */
export async function getQuotationFinancial(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/quotations/${id}/financial`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(350);

  const quotation = mockStore.find((item) => item.id === id);

  if (!quotation) throw notFound(id);

  return { ...(MOCK_FINANCIAL[id] ?? emptyFinancial(quotation.currency)) };
}

function emptyFinancial(currency = "USD") {
  return {
    currency,
    total: 0,
    invoiced: 0,
    paid: 0,
    outstanding: 0,
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
 * El backend decide la variante según `payload.type`.
 */
export async function createQuotation(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/quotations/", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(650);

  const now = new Date().toISOString();

  const quotation = recalculate({
    id: `quo_${String(mockStore.length + 1).padStart(3, "0")}`,
    number: `COT-${new Date().getFullYear()}-${String(mockStore.length + 1).padStart(4, "0")}`,
    type: payload.type ?? "natural",
    customer_id: payload.customer_id ?? null,
    customer_name: payload.customer_name ?? "",
    customer_email: payload.customer_email ?? "",
    title: payload.title ?? "",
    status: QUOTATION_STATUSES.DRAFT,
    currency: payload.currency ?? "USD",
    items: (payload.items ?? []).map((item, index) => ({
      id: nextItemId(),
      description: item.description ?? "",
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      discount: Number(item.discount ?? 0),
      tax_rate: Number(item.tax_rate ?? 0),
    })),
    valid_until: payload.valid_until || null,
    notes: payload.notes ?? "",
    payment_terms: payload.payment_terms ?? "",
    created_at: now,
    updated_at: now,
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
  });

  mockStore = [quotation, ...mockStore];
  mockHistory = { ...mockHistory, [quotation.id]: [] };
  historyEntry(quotation.id, "created", "Cotización creada");

  return clone(quotation);
}

/**
 * Calcula los totales de una cotización sin guardarla (vista previa).
 *
 * @param {{ items?: object[], currency?: string }} payload
 * @returns {Promise<{ subtotal: number, discount_total: number, tax_total: number, total: number, currency: string }>}
 */
export async function calculateQuotation(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/quotations/calculate", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  return calculateQuotationTotals(payload?.items ?? [], payload?.currency ?? "USD");
}

/* ──────────────────────────────────────────────────────────────────────────
 * Edición, estado y transiciones
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Actualiza parcialmente una cotización.
 */
export async function updateQuotation(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/quotations/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(550);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const next = {
    ...mockStore[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  if (payload.items) {
    next.items = payload.items.map((item, itemIndex) => ({
      id: item.id ?? `itm_${String(itemIndex + 1).padStart(3, "0")}`,
      description: item.description ?? "",
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      discount: Number(item.discount ?? 0),
      tax_rate: Number(item.tax_rate ?? 0),
    }));
  }

  const updated = recalculate(next);

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  historyEntry(id, "updated", "Se actualizaron los datos de la cotización");

  return clone(updated);
}

/**
 * Cambia el estado de la cotización.
 */
export async function updateQuotationStatus(id, status) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/quotations/${id}/status`, { status });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    status,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  historyEntry(id, "status_changed", `Estado cambiado a ${status}`);

  return clone(updated);
}

/**
 * Envía la cotización (draft → sent).
 */
export async function sendQuotation(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/quotations/${id}/send`, {});
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    status: QUOTATION_STATUSES.SENT,
    sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  historyEntry(id, "sent", "Cotización enviada al cliente");

  return clone(updated);
}

/**
 * El cliente acepta la cotización.
 */
export async function acceptQuotation(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/quotations/${id}/accept`, {});
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    status: QUOTATION_STATUSES.ACCEPTED,
    accepted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  historyEntry(id, "accepted", "Cotización aceptada por el cliente");

  return clone(updated);
}

/**
 * El cliente rechaza la cotización.
 *
 * @param {{ reason?: string }} payload
 */
export async function rejectQuotation(id, payload = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/quotations/${id}/reject`, { reason: payload.reason });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    status: QUOTATION_STATUSES.REJECTED,
    rejected_at: new Date().toISOString(),
    rejection_reason: payload.reason ?? "",
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  historyEntry(id, "rejected", "Cotización rechazada por el cliente");

  return clone(updated);
}

/**
 * Duplica una cotización creando una nueva en borrador.
 */
export async function duplicateQuotation(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/quotations/${id}/duplicate`, {});
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(550);

  const source = mockStore.find((item) => item.id === id);

  if (!source) throw notFound(id);

  const now = new Date().toISOString();

  const duplicated = recalculate({
    ...source,
    id: `quo_${String(mockStore.length + 1).padStart(3, "0")}`,
    number: `COT-${new Date().getFullYear()}-${String(mockStore.length + 1).padStart(4, "0")}`,
    status: QUOTATION_STATUSES.DRAFT,
    items: source.items.map((item) => ({ ...item, id: nextItemId() })),
    created_at: now,
    updated_at: now,
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
  });

  mockStore = [duplicated, ...mockStore];
  mockHistory = { ...mockHistory, [duplicated.id]: [] };
  historyEntry(duplicated.id, "duplicated", `Duplicada desde ${source.number}`);

  return clone(duplicated);
}

/**
 * Convierte la cotización en una tarea.
 *
 * En el backend, este endpoint crea el registro en el módulo de tareas
 * (POST /tasks/); el frontend solo necesita conocer el id devuelto.
 */
export async function convertQuotationToTask(id, payload = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // const task = await post(`/quotations/${id}/convert-to-task`, payload);
  // return task;
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(600);

  const quotation = mockStore.find((item) => item.id === id);

  if (!quotation) throw notFound(id);

  historyEntry(id, "converted", "Cotización convertida en tarea");

  return {
    id: `task_${Date.now().toString(36)}`,
    quotation_id: quotation.id,
    title: payload.title ?? quotation.title,
    description: payload.description ?? quotation.notes,
    status: "todo",
    priority: "medium",
    due_date: quotation.valid_until ?? null,
    project: quotation.customer_name,
    assignee: "Ana Morales",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Ítems
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Agrega un ítem a la cotización.
 */
export async function addQuotationItem(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/quotations/${id}/items`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const item = {
    id: nextItemId(),
    description: payload.description ?? "",
    quantity: Number(payload.quantity ?? 1),
    unit_price: Number(payload.unit_price ?? 0),
    discount: Number(payload.discount ?? 0),
    tax_rate: Number(payload.tax_rate ?? 0),
  };

  const updated = recalculate({
    ...mockStore[index],
    items: [...mockStore[index].items, item],
    updated_at: new Date().toISOString(),
  });

  mockStore = mockStore.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
  historyEntry(id, "item_added", `Se agregó la línea “${item.description}”`);

  return { ...item };
}

/**
 * Actualiza un ítem de la cotización.
 */
export async function updateQuotationItem(id, itemId, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/quotations/${id}/items/${itemId}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const items = mockStore[index].items;
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    const error = new Error("No encontramos la línea solicitada.");
    error.code = "ITEM_NOT_FOUND";
    error.status = 404;
    throw error;
  }

  const updated = recalculate({
    ...mockStore[index],
    items: items.map((item, currentIndex) =>
      currentIndex === itemIndex
        ? {
            ...item,
            ...payload,
            quantity: Number(payload.quantity ?? item.quantity),
            unit_price: Number(payload.unit_price ?? item.unit_price),
            discount: Number(payload.discount ?? item.discount),
            tax_rate: Number(payload.tax_rate ?? item.tax_rate),
          }
        : item,
    ),
    updated_at: new Date().toISOString(),
  });

  mockStore = mockStore.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
  historyEntry(id, "item_updated", `Se actualizó la línea “${updated.items[itemIndex].description}”`);

  return { ...updated.items[itemIndex] };
}

/**
 * Elimina un ítem de la cotización.
 */
export async function deleteQuotationItem(id, itemId) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return del(`/quotations/${id}/items/${itemId}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const items = mockStore[index].items;
  const removed = items.find((item) => item.id === itemId);

  if (!removed) {
    const error = new Error("No encontramos la línea solicitada.");
    error.code = "ITEM_NOT_FOUND";
    error.status = 404;
    throw error;
  }

  const updated = recalculate({
    ...mockStore[index],
    items: items.filter((item) => item.id !== itemId),
    updated_at: new Date().toISOString(),
  });

  mockStore = mockStore.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
  historyEntry(id, "item_deleted", `Se eliminó la línea “${removed.description}”`);

  return { id: itemId };
}

/**
 * Reinicia los stores ficticios (útil durante el desarrollo).
 */
export function resetMockQuotations() {
  mockStore = MOCK_QUOTATIONS.map((quotation) => ({
    ...quotation,
    items: quotation.items.map((item) => ({ ...item })),
  }));
  mockHistory = Object.fromEntries(
    Object.entries(MOCK_HISTORY).map(([quotationId, entries]) => [
      quotationId,
      entries.map((entry) => ({ ...entry })),
    ]),
  );
}
