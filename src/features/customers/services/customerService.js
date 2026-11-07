/**
 * Servicio de clientes de WorkFlowPro.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  MODO MOCK: todavía NO se consumen los endpoints del backend.
 *
 * Todas las funciones tienen marcada la petición real que te faltará por
 * implementar. Para activar la integración basta con sustituir el cuerpo
 * `mock*` por la llamada marcada en cada función.
 *
 * Contrato del backend (FastAPI, prefijo /api/v1):
 *   POST   /customers/                    → crear (natural o legal)
 *   POST   /customers/natural             → crear persona natural
 *   POST   /customers/legal               → crear persona jurídica
 *   POST   /customers/check-duplicates    → verificar duplicados
 *   GET    /customers/                    → listar (filtros, paginación, búsqueda)
 *   GET    /customers/{id}                → obtener cliente
 *   GET    /customers/{id}/full           → cliente + notas + historial + financiero
 *   GET    /customers/{id}/financial       → resumen financiero
 *   PATCH  /customers/{id}                → actualizar parcialmente
 *   PATCH  /customers/{id}/status         → cambiar estado
 *   POST   /customers/{id}/reactivate     → reactivar archivado
 *   DELETE /customers/{id}                → archivar (soft delete)
 *   POST   /customers/{id}/notes          → agregar nota interna
 *   GET    /customers/{id}/notes          → listar notas
 *   PATCH  /customers/{id}/notes/{note_id}→ actualizar nota
 *   DELETE /customers/{id}/notes/{note_id}→ eliminar nota
 *   GET    /customers/{id}/audit          → historial de auditoría
 *
 * Todas las rutas (salvo login/register) requieren
 * `Authorization: Bearer <access_token>`: el cliente HTTP de `src/lib/api`
 * ya lo añade automáticamente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { del, get, patch, post } from "@/lib/api";

import { CUSTOMER_STATUSES, getCustomerDisplayName } from "../constants";
import { MOCK_AUDIT, MOCK_CUSTOMERS, MOCK_FINANCIAL, MOCK_NOTES, MOCK_STATS } from "./mockData";

/** Latencia simulada para que los estados de carga sean visibles. */
function mockDelay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Copia en memoria del store ficticio (permite crear/editar/archivar en la demo). */
let mockStore = MOCK_CUSTOMERS.map((customer) => ({ ...customer }));
let mockNotes = Object.fromEntries(
  Object.entries(MOCK_NOTES).map(([customerId, notes]) => [
    customerId,
    notes.map((note) => ({ ...note })),
  ]),
);
let mockAudit = Object.fromEntries(
  Object.entries(MOCK_AUDIT).map(([customerId, entries]) => [
    customerId,
    entries.map((entry) => ({ ...entry })),
  ]),
);

function clone(customer) {
  return { ...customer };
}

function notFound(id) {
  const error = new Error("No encontramos el cliente solicitado.");
  error.code = "CUSTOMER_NOT_FOUND";
  error.status = 404;
  return error;
}

function auditEntry(customerId, action, detail) {
  const entries = mockAudit[customerId] ?? [];
  const entry = {
    id: `aud_${String(entries.length + 1).padStart(3, "0")}`,
    action,
    actor: "Ana Morales",
    created_at: new Date().toISOString(),
    detail,
  };

  mockAudit = { ...mockAudit, [customerId]: [entry, ...entries] };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Listado y detalle
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista clientes con filtros, búsqueda y paginación.
 *
 * @param {{ type?: string, status?: string, search?: string, page?: number, pageSize?: number }} params
 * @returns {Promise<{ items: object[], total: number, page: number, pageSize: number, stats: object }>}
 */
export async function listCustomers(params = {}) {
  const { type = "", status = "", search = "", page = 1, pageSize = 10 } = params;

  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/customers/", {
  //   query: { type, status, search, page, page_size: pageSize },
  // });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay();

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = mockStore.filter((customer) => {
    if (type && customer.type !== type) return false;
    if (status && customer.status !== status) return false;

    if (normalizedSearch) {
      const haystack = [
        getCustomerDisplayName(customer),
        customer.email,
        customer.document_number,
        customer.tax_id,
        customer.phone,
        customer.city,
        customer.industry,
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
      natural: mockStore.filter((customer) => customer.type === "natural").length,
      legal: mockStore.filter((customer) => customer.type === "legal").length,
      active: mockStore.filter((customer) => customer.status === "active").length,
      inactive: mockStore.filter((customer) => customer.status === "inactive").length,
      archived: mockStore.filter((customer) => customer.status === "archived").length,
    },
  };
}

/**
 * Obtiene un cliente por su id.
 */
export async function getCustomer(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/customers/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(300);

  const customer = mockStore.find((item) => item.id === id);

  if (!customer) throw notFound(id);

  return clone(customer);
}

/**
 * Obtiene el cliente completo: datos + notas + historial + financiero.
 */
export async function getCustomerFull(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/customers/${id}/full`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const customer = mockStore.find((item) => item.id === id);

  if (!customer) throw notFound(id);

  return {
    customer: clone(customer),
    notes: (mockNotes[id] ?? []).map((note) => ({ ...note })),
    audit: (mockAudit[id] ?? []).map((entry) => ({ ...entry })),
    financial: { ...(MOCK_FINANCIAL[id] ?? emptyFinancial()) },
  };
}

/**
 * Resumen financiero del cliente.
 */
export async function getCustomerFinancial(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/customers/${id}/financial`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(350);

  const customer = mockStore.find((item) => item.id === id);

  if (!customer) throw notFound(id);

  return { ...(MOCK_FINANCIAL[id] ?? emptyFinancial()) };
}

function emptyFinancial() {
  return {
    currency: "USD",
    total_invoiced: 0,
    total_paid: 0,
    outstanding: 0,
    invoices_count: 0,
    pending_invoices: 0,
    average_ticket: 0,
    last_invoice_date: null,
    last_payment_date: null,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Alta
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Crea un cliente (natural o legal).
 * El backend decide la variante según `payload.type`.
 */
export async function createCustomer(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/customers/", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(600);

  const customer = buildCustomer(payload);

  mockStore = [customer, ...mockStore];
  mockNotes = { ...mockNotes, [customer.id]: [] };
  mockAudit = { ...mockAudit, [customer.id]: [] };
  auditEntry(customer.id, "created", "Cliente creado");

  return clone(customer);
}

/**
 * Crea una persona natural (POST /customers/natural).
 */
export async function createNaturalCustomer(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/customers/natural", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(600);

  const customer = buildCustomer({ ...payload, type: "natural" });

  mockStore = [customer, ...mockStore];
  mockNotes = { ...mockNotes, [customer.id]: [] };
  mockAudit = { ...mockAudit, [customer.id]: [] };
  auditEntry(customer.id, "created", "Cliente creado");

  return clone(customer);
}

/**
 * Crea una persona jurídica (POST /customers/legal).
 */
export async function createLegalCustomer(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/customers/legal", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(600);

  const customer = buildCustomer({ ...payload, type: "legal" });

  mockStore = [customer, ...mockStore];
  mockNotes = { ...mockNotes, [customer.id]: [] };
  mockAudit = { ...mockAudit, [customer.id]: [] };
  auditEntry(customer.id, "created", "Cliente creado");

  return clone(customer);
}

function buildCustomer(payload = {}) {
  const now = new Date().toISOString();

  return {
    id: `cus_${String(mockStore.length + 1).padStart(3, "0")}`,
    type: payload.type ?? "natural",
    first_name: payload.first_name ?? null,
    last_name: payload.last_name ?? null,
    business_name: payload.business_name ?? null,
    legal_name: payload.legal_name ?? null,
    tax_id: payload.tax_id ?? null,
    document_type: payload.document_type ?? "other",
    document_number: payload.document_number ?? "",
    email: payload.email ?? "",
    phone: payload.phone ?? "",
    birth_date: payload.birth_date || null,
    incorporation_date: payload.incorporation_date || null,
    industry: payload.industry ?? null,
    website: payload.website ?? null,
    address: payload.address ?? "",
    city: payload.city ?? "",
    state: payload.state ?? null,
    country: payload.country ?? "",
    contact_name: payload.contact_name ?? null,
    contact_email: payload.contact_email ?? null,
    contact_phone: payload.contact_phone ?? null,
    status: CUSTOMER_STATUSES.ACTIVE,
    tags: payload.tags ?? [],
    notes_count: 0,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Verifica si existen clientes con datos similares antes de crear.
 *
 * @param {{ document_number?: string, email?: string, name?: string, tax_id?: string }} payload
 * @returns {Promise<{ has_duplicates: boolean, duplicates: object[] }>}
 */
export async function checkDuplicates(payload = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/customers/check-duplicates", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(500);

  const documentNumber = (payload.document_number ?? "").trim().toLowerCase();
  const email = (payload.email ?? "").trim().toLowerCase();
  const taxId = (payload.tax_id ?? "").trim().toLowerCase();
  const name = (payload.name ?? "").trim().toLowerCase();

  const duplicates = mockStore.filter((customer) => {
    if (documentNumber && customer.document_number?.toLowerCase() === documentNumber) return true;
    if (taxId && customer.tax_id?.toLowerCase() === taxId) return true;
    if (email && customer.email?.toLowerCase() === email) return true;
    if (name && getCustomerDisplayName(customer).toLowerCase() === name) return true;

    return false;
  });

  return {
    has_duplicates: duplicates.length > 0,
    duplicates: duplicates.map((customer) => ({
      id: customer.id,
      type: customer.type,
      name: getCustomerDisplayName(customer),
      email: customer.email,
      document_number: customer.document_number,
      status: customer.status,
      match_reason:
        documentNumber && customer.document_number?.toLowerCase() === documentNumber
          ? "documento"
          : taxId && customer.tax_id?.toLowerCase() === taxId
            ? "identificador fiscal"
            : email && customer.email?.toLowerCase() === email
              ? "correo electrónico"
              : "nombre",
    })),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Edición, estado y archivo
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Actualiza parcialmente un cliente.
 */
export async function updateCustomer(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/customers/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(550);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  auditEntry(id, "updated", "Se actualizaron los datos del cliente");

  return clone(updated);
}

/**
 * Cambia el estado del cliente (active / inactive / archived).
 */
export async function updateCustomerStatus(id, status) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/customers/${id}/status`, { status });
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
  auditEntry(id, "status_changed", `Estado cambiado a ${status}`);

  return clone(updated);
}

/**
 * Reactiva un cliente archivado.
 */
export async function reactivateCustomer(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/customers/${id}/reactivate`, {});
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    status: CUSTOMER_STATUSES.ACTIVE,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  auditEntry(id, "reactivated", "Cliente reactivado");

  return clone(updated);
}

/**
 * Archiva un cliente (soft delete en el backend).
 */
export async function archiveCustomer(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return del(`/customers/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) throw notFound(id);

  const updated = {
    ...mockStore[index],
    status: CUSTOMER_STATUSES.ARCHIVED,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));
  auditEntry(id, "archived", "Cliente archivado");

  return clone(updated);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Notas internas
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista las notas internas de un cliente.
 */
export async function listCustomerNotes(id, params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/customers/${id}/notes`, { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(350);

  const customer = mockStore.find((item) => item.id === id);

  if (!customer) throw notFound(id);

  const notes = [...(mockNotes[id] ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { items: notes.map((note) => ({ ...note })), total: notes.length };
}

/**
 * Agrega una nota interna.
 */
export async function addCustomerNote(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post(`/customers/${id}/notes`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const customer = mockStore.find((item) => item.id === id);

  if (!customer) throw notFound(id);

  const notes = mockNotes[id] ?? [];
  const now = new Date().toISOString();

  const note = {
    id: `not_${Date.now().toString(36)}`,
    customer_id: id,
    content: payload.content,
    author: payload.author ?? "Ana Morales",
    created_at: now,
    updated_at: now,
  };

  mockNotes = { ...mockNotes, [id]: [note, ...notes] };
  mockStore = mockStore.map((item) =>
    item.id === id ? { ...item, notes_count: notes.length + 1 } : item,
  );
  auditEntry(id, "note_added", "Se agregó una nota interna");

  return { ...note };
}

/**
 * Actualiza una nota interna.
 */
export async function updateCustomerNote(id, noteId, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/customers/${id}/notes/${noteId}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  const notes = mockNotes[id] ?? [];
  const index = notes.findIndex((note) => note.id === noteId);

  if (index === -1) {
    const error = new Error("No encontramos la nota solicitada.");
    error.code = "NOTE_NOT_FOUND";
    error.status = 404;
    throw error;
  }

  const updated = {
    ...notes[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  mockNotes = {
    ...mockNotes,
    [id]: notes.map((note, noteIndex) => (noteIndex === index ? updated : note)),
  };
  auditEntry(id, "note_updated", "Se actualizó una nota interna");

  return { ...updated };
}

/**
 * Elimina una nota interna.
 */
export async function deleteCustomerNote(id, noteId) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return del(`/customers/${id}/notes/${noteId}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(400);

  const notes = mockNotes[id] ?? [];
  const exists = notes.some((note) => note.id === noteId);

  if (!exists) {
    const error = new Error("No encontramos la nota solicitada.");
    error.code = "NOTE_NOT_FOUND";
    error.status = 404;
    throw error;
  }

  mockNotes = { ...mockNotes, [id]: notes.filter((note) => note.id !== noteId) };
  mockStore = mockStore.map((item) =>
    item.id === id ? { ...item, notes_count: Math.max(0, item.notes_count - 1) } : item,
  );
  auditEntry(id, "note_deleted", "Se eliminó una nota interna");

  return { id: noteId };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Auditoría
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Historial de auditoría del cliente.
 */
export async function getCustomerAudit(id, params = {}) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/customers/${id}/audit`, { query: params });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(350);

  const customer = mockStore.find((item) => item.id === id);

  if (!customer) throw notFound(id);

  const entries = [...(mockAudit[id] ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { items: entries.map((entry) => ({ ...entry })), total: entries.length };
}

/**
 * Reinicia los stores ficticios (útil durante el desarrollo).
 */
export function resetMockCustomers() {
  mockStore = MOCK_CUSTOMERS.map((customer) => ({ ...customer }));
  mockNotes = Object.fromEntries(
    Object.entries(MOCK_NOTES).map(([customerId, notes]) => [
      customerId,
      notes.map((note) => ({ ...note })),
    ]),
  );
  mockAudit = Object.fromEntries(
    Object.entries(MOCK_AUDIT).map(([customerId, entries]) => [
      customerId,
      entries.map((entry) => ({ ...entry })),
    ]),
  );
}
