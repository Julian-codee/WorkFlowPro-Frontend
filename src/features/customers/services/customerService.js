/**
 * Servicio de clientes de WorkFlowPro.
 *
 * Conectado al backend de FastAPI (prefijo /api/v1).
 *
 * Contrato del backend:
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
 */

import { del, get, patch, post } from "@/lib/api";

import { CUSTOMER_STATUSES, getCustomerDisplayName } from "../constants";

/** Copia superficial de un cliente. */
function clone(customer) {
  return { ...customer };
}

function notFound(id) {
  const error = new Error("No encontramos el cliente solicitado.");
  error.code = "CUSTOMER_NOT_FOUND";
  error.status = 404;
  return error;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Mapeo de campos: frontend ↔ backend
 *
 * El formulario del frontend usa nombres de campo propios; el backend de
 * FastAPI expone el esquema de CustomerNaturalCreate / CustomerLegalCreate.
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Mapea los tipos de documento del frontend a los enum del backend.
 *
 * Frontend: dni, ce, passport, nit, ruc, other
 * Backend:  cc, ce, passport, nit, nit_legal, rut
 */
function mapDocumentTypeToBackend(value, isLegal) {
  const map = {
    dni: isLegal ? "nit_legal" : "cc",
    ce: isLegal ? "nit_legal" : "ce",
    passport: "passport",
    nit: "nit",
    ruc: "nit_legal",
    other: isLegal ? "nit_legal" : "cc",
  };
  return map[value] || (isLegal ? "nit_legal" : "cc");
}

/**
 * Convierte la forma del frontend a la forma del backend para crear.
 *
 * @param {object} payload - datos del formulario frontend
 * @returns {object} cuerpo listo para enviar a FastAPI
 */
function toBackendCreate(payload) {
  const isLegal = payload.type === "legal";
  const docType = mapDocumentTypeToBackend(payload.document_type, isLegal);

  const common = {
    customer_type: payload.type,
    phone: payload.phone ?? "",
    email: payload.email ?? undefined,
    address: payload.address ?? undefined,
    city: payload.city ?? undefined,
    department: payload.state ?? undefined,
    country: payload.country ?? undefined,
  };

  if (isLegal) {
    return {
      ...common,
      // Razón social → business_name; Nombre comercial → trade_name
      business_name: payload.legal_name ?? "",
      trade_name: payload.business_name ?? undefined,
      tax_id_type: docType,
      tax_id_number: payload.tax_id ?? payload.document_number ?? "",
      legal_rep_name: payload.contact_name ?? undefined,
      website: payload.website ?? undefined,
      economic_activity: payload.industry ?? undefined,
    };
  }

  return {
    ...common,
    first_name: payload.first_name ?? "",
    last_name: payload.last_name ?? "",
    identification_type: docType,
    identification_number: payload.document_number ?? "",
  };
}

/**
 * Convierte la respuesta del backend a la forma interna del frontend.
 *
 * @param {object} customer - objeto devuelto por FastAPI
 * @returns {object} cliente en forma de frontend
 */
function fromBackend(customer) {
  if (!customer) return null;

  const isLegal = customer.customer_type === "legal";

  return {
    ...customer,
    id: customer.id,
    type: customer.customer_type,
    first_name: customer.first_name ?? null,
    last_name: customer.last_name ?? null,
    // Razón social → legal_name; Nombre comercial → business_name
    business_name: customer.trade_name ?? null,
    legal_name: customer.business_name ?? null,
    tax_id: customer.tax_id_number ?? customer.identification_number ?? null,
    document_type:
      customer.tax_id_type ?? customer.identification_type ?? "other",
    document_number:
      customer.tax_id_number ?? customer.identification_number ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    birth_date: null,
    incorporation_date: null,
    industry: customer.economic_activity ?? null,
    website: customer.website ?? null,
    address: customer.address ?? "",
    city: customer.city ?? "",
    state: customer.department ?? null,
    country: customer.country ?? "",
    contact_name: customer.main_contact_name ?? null,
    contact_email: null,
    contact_phone: null,
    status: customer.status ?? "active",
    tags: [],
    notes_count: 0,
    created_at: customer.created_at ?? null,
    updated_at: customer.updated_at ?? null,
    // Nombres computados por el backend
    full_name: customer.full_name ?? getCustomerDisplayName(customer),
    display_name: customer.display_name ?? getCustomerDisplayName(customer),
  };
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

  const response = await get("/customers/", {
    query: {
      customer_type: type || undefined,
      status: status || undefined,
      query: search || undefined,
      page,
      page_size: pageSize,
      sort_by: "created_at",
      sort_order: "desc",
    },
  });

  const raw = response?.customers ?? [];
  const items = raw.map(fromBackend);

  return {
    items,
    total: Number(response?.total ?? raw.length),
    page: Number(response?.page ?? page),
    pageSize: Number(response?.page_size ?? pageSize),
    stats: {
      total: Number(response?.total ?? raw.length),
      natural: raw.filter((c) => c.customer_type === "natural").length,
      legal: raw.filter((c) => c.customer_type === "legal").length,
      active: raw.filter((c) => c.status === "active").length,
      inactive: raw.filter((c) => c.status === "inactive").length,
      archived: raw.filter((c) => c.status === "archived").length,
    },
  };
}

/**
 * Obtiene un cliente por su id.
 */
export async function getCustomer(id) {
  const customer = await get(`/customers/${id}`);

  if (!customer) throw notFound(id);

  return fromBackend(customer);
}

/**
 * Obtiene el cliente completo: datos + notas + historial + financiero.
 */
export async function getCustomerFull(id) {
  const full = await get(`/customers/${id}/full`);

  if (!full) throw notFound(id);

  return {
    customer: fromBackend(full?.customer ?? full),
    notes: Array.isArray(full?.notes) ? full.notes.map((n) => ({ ...n })) : [],
    audit: Array.isArray(full?.audit) ? full.audit.map((a) => ({ ...a })) : [],
    financial: { ...(full?.financial ?? {}) },
  };
}

/**
 * Resumen financiero del cliente.
 */
export async function getCustomerFinancial(id) {
  const summary = await get(`/customers/${id}/financial`);

  if (!summary) throw notFound(id);

  return {
    currency: summary.currency ?? "USD",
    total_invoiced: Number(summary.total_invoiced ?? 0),
    total_paid: Number(summary.total_paid ?? 0),
    outstanding: Number(summary.pending_balance ?? 0),
    invoices_count: Number(summary.jobs_count ?? 0),
    pending_invoices: 0,
    average_ticket: 0,
    last_invoice_date: summary.last_job_at ?? null,
    last_payment_date: null,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Alta
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Crea un cliente (natural o legal).
 */
export async function createCustomer(payload) {
  const body = toBackendCreate(payload);
  const created = await post("/customers/", body);

  return fromBackend(created);
}

/**
 * Crea una persona natural (POST /customers/natural).
 */
export async function createNaturalCustomer(payload) {
  const body = toBackendCreate({ ...payload, type: "natural" });
  const created = await post("/customers/natural", body);

  return fromBackend(created);
}

/**
 * Crea una persona jurídica (POST /customers/legal).
 */
export async function createLegalCustomer(payload) {
  const body = toBackendCreate({ ...payload, type: "legal" });
  const created = await post("/customers/legal", body);

  return fromBackend(created);
}

/**
 * Verifica si existen clientes con datos similares antes de crear.
 *
 * @param {{ document_number?: string, email?: string, name?: string, tax_id?: string }} payload
 * @returns {Promise<{ has_duplicates: boolean, duplicates: object[] }>}
 */
export async function checkDuplicates(payload = {}) {
  const documentNumber = (payload.document_number ?? "").trim();
  const email = (payload.email ?? "").trim();
  const taxId = (payload.tax_id ?? "").trim();
  const name = (payload.name ?? "").trim();

  const response = await post("/customers/check-duplicates", {
    identification_number: documentNumber || undefined,
    tax_id_number: taxId || undefined,
    email: email || undefined,
    phone: undefined,
  });

  const duplicates = Array.isArray(response?.duplicates) ? response.duplicates : [];

  return {
    has_duplicates: duplicates.length > 0,
    duplicates: duplicates.map((customer) => ({
      id: customer.id,
      type: customer.customer_type,
      name: customer.display_name || getCustomerDisplayName(customer),
      email: customer.email,
      document_number: customer.identification_number || customer.tax_id_number,
      status: customer.status,
      match_reason: "coincidencia",
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
  const isLegal = payload.type === "legal";

  const body = {};
  if (payload.first_name !== undefined) body.first_name = payload.first_name;
  if (payload.last_name !== undefined) body.last_name = payload.last_name;
  if (payload.legal_name !== undefined) body.business_name = payload.legal_name;
  if (payload.business_name !== undefined) body.trade_name = payload.business_name;
  if (payload.tax_id !== undefined) body.tax_id_number = payload.tax_id;
  if (payload.document_type !== undefined) {
    if (isLegal) body.tax_id_type = payload.document_type;
    else body.identification_type = payload.document_type;
  }
  if (payload.document_number !== undefined) {
    if (isLegal) body.tax_id_number = payload.document_number;
    else body.identification_number = payload.document_number;
  }
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.address !== undefined) body.address = payload.address;
  if (payload.city !== undefined) body.city = payload.city;
  if (payload.state !== undefined) body.department = payload.state;
  if (payload.country !== undefined) body.country = payload.country;
  if (payload.website !== undefined) body.website = payload.website;
  if (payload.industry !== undefined) body.economic_activity = payload.industry;
  if (payload.contact_name !== undefined) body.main_contact_name = payload.contact_name;

  const updated = await patch(`/customers/${id}`, body);

  return fromBackend(updated);
}

/**
 * Cambia el estado del cliente (active / inactive / archived).
 */
export async function updateCustomerStatus(id, status) {
  const updated = await patch(`/customers/${id}/status`, { status });

  return fromBackend(updated);
}

/**
 * Reactiva un cliente archivado.
 */
export async function reactivateCustomer(id) {
  const updated = await post(`/customers/${id}/reactivate`, {});

  return fromBackend(updated);
}

/**
 * Archiva un cliente (soft delete en el backend).
 */
export async function archiveCustomer(id) {
  await del(`/customers/${id}`);

  return { id };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Notas internas
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lista las notas internas de un cliente.
 */
export async function listCustomerNotes(id, params = {}) {
  const { page = 1, page_size = 20 } = params;

  const response = await get(`/customers/${id}/notes`, {
    query: { page, page_size },
  });

  const notes = Array.isArray(response?.notes) ? response.notes : [];

  return {
    items: notes.map((note) => ({ ...note })),
    total: Number(response?.total ?? notes.length),
  };
}

/**
 * Agrega una nota interna.
 */
export async function addCustomerNote(id, payload) {
  const note = await post(`/customers/${id}/notes`, {
    content: payload.content,
  });

  return { ...note };
}

/**
 * Actualiza una nota interna.
 */
export async function updateCustomerNote(id, noteId, payload) {
  const updated = await patch(`/customers/${id}/notes/${noteId}`, {
    content: payload.content,
  });

  return { ...updated };
}

/**
 * Elimina una nota interna.
 */
export async function deleteCustomerNote(id, noteId) {
  await del(`/customers/${id}/notes/${noteId}`);

  return { id: noteId };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Auditoría
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Historial de auditoría del cliente.
 */
export async function getCustomerAudit(id, params = {}) {
  const { page = 1, page_size = 20 } = params;

  const response = await get(`/customers/${id}/audit`, {
    query: { page, page_size },
  });

  const entries = Array.isArray(response?.logs) ? response.logs : [];

  return {
    items: entries.map((entry) => ({ ...entry })),
    total: Number(response?.total ?? entries.length),
  };
}
