/**
 * Validadores del formulario de tareas.
 * Reutilizables por el alta (`/tasks/new`) y la edición (`/tasks/[id]`).
 */

export const TASK_TITLE_MIN_LENGTH = 3;
export const TASK_TITLE_MAX_LENGTH = 120;
export const TASK_DESCRIPTION_MAX_LENGTH = 1000;

export function validateTaskTitle(title) {
  const value = (title ?? "").trim();

  if (!value) {
    return "El título de la tarea es obligatorio.";
  }

  if (value.length < TASK_TITLE_MIN_LENGTH) {
    return `El título debe tener al menos ${TASK_TITLE_MIN_LENGTH} caracteres.`;
  }

  if (value.length > TASK_TITLE_MAX_LENGTH) {
    return `El título no puede superar ${TASK_TITLE_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateTaskDescription(description) {
  const value = (description ?? "").trim();

  if (value.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return `La descripción no puede superar ${TASK_DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateDueDate(dueDate) {
  if (!dueDate) return null;

  if (Number.isNaN(new Date(dueDate).getTime())) {
    return "Introduce una fecha válida.";
  }

  return null;
}

export function validateTaskForm(values = {}) {
  return {
    title: validateTaskTitle(values.title),
    description: validateTaskDescription(values.description),
    due_date: validateDueDate(values.due_date),
  };
}

export function hasTaskErrors(errors = {}) {
  return Boolean(errors.title || errors.description || errors.due_date);
}
