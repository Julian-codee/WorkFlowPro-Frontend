"use client";

import { useCallback, useMemo, useState } from "react";

import { createTask, updateTask } from "../services/taskService";
import { hasTaskErrors, validateTaskForm } from "../services/validators";

/**
 * Estado y validación del formulario de tarea (alta y edición).
 *
 * `submitTask` llama al servicio; al conectar el backend solo cambia el
 * servicio, no este hook ni el componente del formulario.
 */
export function useTaskForm({ initialValues = {}, taskId = null } = {}) {
  const emptyValues = useMemo(
    () => ({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      project: "",
      assignee: "",
      ...initialValues,
    }),
    [initialValues],
  );

  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const isEditing = Boolean(taskId);
  const isLoading = status === "loading";

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      setNotice(null);

      if (!touched[field]) return;

      const fieldErrors = validateTaskForm({ ...values, [field]: value });
      setErrors((current) => ({ ...current, [field]: fieldErrors[field] }));
    },
    [touched, values],
  );

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setFieldValue(name, value);
    },
    [setFieldValue],
  );

  const handleBlur = useCallback(
    (event) => {
      const { name, value } = event.target;
      setTouched((current) => ({ ...current, [name]: true }));

      const fieldErrors = validateTaskForm({ ...values, [name]: value });
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    },
    [values],
  );

  const submitTask = useCallback(async () => {
    const fieldErrors = validateTaskForm(values);
    setErrors(fieldErrors);
    setTouched({ title: true, description: true, due_date: true });
    setFormError(null);
    setNotice(null);

    if (hasTaskErrors(fieldErrors)) {
      setStatus("idle");
      return null;
    }

    setStatus("loading");

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
      due_date: values.due_date || null,
      project: values.project.trim() || null,
      assignee: values.assignee.trim() || null,
    };

    try {
      const saved = isEditing ? await updateTask(taskId, payload) : await createTask(payload);

      setStatus("success");
      setNotice(isEditing ? "Tarea actualizada." : "Tarea creada correctamente.");
      return saved;
    } catch (error) {
      setStatus("error");
      setFormError(error?.message ?? "No pudimos guardar la tarea. Inténtalo de nuevo.");
      return null;
    }
  }, [isEditing, taskId, values]);

  const reset = useCallback(() => {
    setValues(emptyValues);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setFormError(null);
    setNotice(null);
  }, [emptyValues]);

  return {
    values,
    errors,
    touched,
    status,
    formError,
    notice,
    isEditing,
    isLoading,
    handleChange,
    handleBlur,
    submitTask,
    reset,
    setValues,
  };
}
