/**
 * Servicio de tareas de WorkFlowPro.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  MODO MOCK: todavía NO se consumen los endpoints del backend.
 *
 * Todas las funciones tienen marcada la petición real que te faltará por
 * implementar. Para activar la integración basta con sustituir el cuerpo
 * `mock*` por la llamada marcada en cada función.
 *
 * Contrato del backend (FastAPI, prefijo /api/v1):
 *   POST   /tasks/                  → crear
 *   GET    /tasks/                  → listar (query: status, priority, search…)
 *   GET    /tasks/{id}              → detalle
 *   PATCH  /tasks/{id}              → editar
 *   PATCH  /tasks/{id}/status       → cambiar estado
 *   PATCH  /tasks/{id}/priority     → cambiar prioridad
 *   DELETE /tasks/{id}              → eliminar
 *
 * Todas las rutas requieren `Authorization: Bearer <access_token>`
 * (el cliente HTTP de `src/lib/api` ya lo añade automáticamente).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { get, post, patch, del } from "@/lib/api";

import { MOCK_STATS, MOCK_TASKS } from "./mockData";

/** Latencia simulada para que los estados de carga sean visibles. */
function mockDelay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Copia en memoria del store ficticio (permite crear/editar/borrar en la demo). */
let mockStore = MOCK_TASKS.map((task) => ({ ...task }));

function clone(task) {
  return { ...task };
}

/**
 * Lista tareas con filtros.
 *
 * @param {{ status?: string, priority?: string, search?: string, page?: number, pageSize?: number }} params
 * @returns {Promise<{ items: object[], total: number, page: number, pageSize: number, stats: object }>}
 */
export async function listTasks(params = {}) {
  const { status = "", priority = "", search = "", page = 1, pageSize = 10 } = params;

  // ── Integración real ──────────────────────────────────────────────────────
  // return get("/tasks/", {
  //   query: { status, priority, search, page, page_size: pageSize },
  // });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay();

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = mockStore.filter((task) => {
    if (status && task.status !== status) return false;
    if (priority && task.priority !== priority) return false;

    if (normalizedSearch) {
      const haystack = `${task.title} ${task.description} ${task.project} ${task.assignee}`
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
      in_progress: mockStore.filter((task) => task.status === "in_progress").length,
      completed: mockStore.filter((task) => task.status === "done").length,
    },
  };
}

/**
 * Obtiene una tarea por su id.
 */
export async function getTask(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return get(`/tasks/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(300);

  const task = mockStore.find((item) => item.id === id);

  if (!task) {
    const error = new Error("No encontramos la tarea solicitada.");
    error.code = "TASK_NOT_FOUND";
    throw error;
  }

  return clone(task);
}

/**
 * Crea una tarea nueva.
 *
 * @param {{ title: string, description?: string, status?: string, priority?: string, due_date?: string, project?: string, assignee?: string }} payload
 */
export async function createTask(payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return post("/tasks/", payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(600);

  const now = new Date().toISOString();

  const task = {
    id: `task_${String(mockStore.length + 1).padStart(3, "0")}`,
    title: payload.title,
    description: payload.description ?? "",
    status: payload.status ?? "todo",
    priority: payload.priority ?? "medium",
    due_date: payload.due_date ?? null,
    project: payload.project ?? "General",
    assignee: payload.assignee ?? "Ana Morales",
    created_at: now,
    updated_at: now,
  };

  mockStore = [task, ...mockStore];

  return clone(task);
}

/**
 * Actualiza los campos editables de una tarea.
 */
export async function updateTask(id, payload) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/tasks/${id}`, payload);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(550);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) {
    const error = new Error("No encontramos la tarea solicitada.");
    error.code = "TASK_NOT_FOUND";
    throw error;
  }

  const updated = {
    ...mockStore[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return clone(updated);
}

/**
 * Cambia el estado de una tarea.
 */
export async function updateTaskStatus(id, status) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/tasks/${id}/status`, { status });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(350);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) {
    const error = new Error("No encontramos la tarea solicitada.");
    error.code = "TASK_NOT_FOUND";
    throw error;
  }

  const updated = {
    ...mockStore[index],
    status,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return clone(updated);
}

/**
 * Cambia la prioridad de una tarea.
 */
export async function updateTaskPriority(id, priority) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return patch(`/tasks/${id}/priority`, { priority });
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(350);

  const index = mockStore.findIndex((item) => item.id === id);

  if (index === -1) {
    const error = new Error("No encontramos la tarea solicitada.");
    error.code = "TASK_NOT_FOUND";
    throw error;
  }

  const updated = {
    ...mockStore[index],
    priority,
    updated_at: new Date().toISOString(),
  };

  mockStore = mockStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

  return clone(updated);
}

/**
 * Elimina una tarea.
 */
export async function deleteTask(id) {
  // ── Integración real ──────────────────────────────────────────────────────
  // return del(`/tasks/${id}`);
  // ─────────────────────────────────────────────────────────────────────────

  await mockDelay(450);

  const exists = mockStore.some((item) => item.id === id);

  if (!exists) {
    const error = new Error("No encontramos la tarea solicitada.");
    error.code = "TASK_NOT_FOUND";
    throw error;
  }

  mockStore = mockStore.filter((item) => item.id !== id);

  return { id };
}

/**
 * Reinicia el store ficticio (útil durante el desarrollo).
 */
export function resetMockTasks() {
  mockStore = MOCK_TASKS.map((task) => ({ ...task }));
}
