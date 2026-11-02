/**
 * Catálogo de estados y prioridades de tarea.
 *
 * ⚠️ Los valores son una propuesta de UI: ajústalos al enum real del backend
 * (FastAPI) cuando conectes los endpoints de /tasks.
 */

export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
  BLOCKED: "blocked",
};

export const TASK_STATUS_LIST = [
  { value: TASK_STATUSES.TODO, label: "Pendiente", tone: "neutral" },
  { value: TASK_STATUSES.IN_PROGRESS, label: "En curso", tone: "brand" },
  { value: TASK_STATUSES.REVIEW, label: "En revisión", tone: "purple" },
  { value: TASK_STATUSES.DONE, label: "Completada", tone: "success" },
  { value: TASK_STATUSES.BLOCKED, label: "Bloqueada", tone: "danger" },
];

export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const TASK_PRIORITY_LIST = [
  { value: TASK_PRIORITIES.LOW, label: "Baja", tone: "neutral" },
  { value: TASK_PRIORITIES.MEDIUM, label: "Media", tone: "info" },
  { value: TASK_PRIORITIES.HIGH, label: "Alta", tone: "warning" },
  { value: TASK_PRIORITIES.URGENT, label: "Urgente", tone: "danger" },
];

export const TASK_STATUS_OPTIONS = TASK_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const TASK_PRIORITY_OPTIONS = TASK_PRIORITY_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

/** Etiquetas legibles a partir del valor recibido del backend. */
export function getStatusMeta(value) {
  return (
    TASK_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin estado",
      tone: "neutral",
    }
  );
}

export function getPriorityMeta(value) {
  return (
    TASK_PRIORITY_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin prioridad",
      tone: "neutral",
    }
  );
}
