"use client";

import { useCallback, useMemo, useState } from "react";

import { createTask, getTaskApiFieldErrors, updateTask } from "../services/taskService";
import { hasTaskErrors, validateTaskForm } from "../services/validators";
import { toApiDateTime } from "../utils/format";

const EMPTY_VALUES = {
  title: "",
  description: "",
  priority: "medium",
  due_date: "",
  customer_id: "",
  total_price: "",
  initial_payment_amount: "",
  initial_payment_date: "",
  initial_payment_method: "cash",
  initial_payment_account_id: "",
  initial_payment_reference: "",
  initial_payment_notes: "",
};

/**
 * Estado, validación y payload del formulario de tarea (alta y edición).
 * Solo se envían campos editables y aceptados por el backend.
 */
export function useTaskForm({
  initialValues = {},
  taskId = null,
  totalPaid = 0,
} = {}) {
  const emptyValues = useMemo(
    () => ({ ...EMPTY_VALUES, ...initialValues }),
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
  const validationOptions = useMemo(
    () => ({ isEditing, totalPaid }),
    [isEditing, totalPaid],
  );

  const setFieldValue = useCallback(
    (field, value) => {
      const nextValues = { ...values, [field]: value };
      setValues(nextValues);
      setFormError(null);
      setNotice(null);

      if (!touched[field]) return;

      const fieldErrors = validateTaskForm(nextValues, validationOptions);
      setErrors((current) => ({ ...current, [field]: fieldErrors[field] }));
    },
    [touched, validationOptions, values],
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

      const fieldErrors = validateTaskForm(
        { ...values, [name]: value },
        validationOptions,
      );
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    },
    [validationOptions, values],
  );

  const submitTask = useCallback(async () => {
    const fieldErrors = validateTaskForm(values, validationOptions);
    setErrors(fieldErrors);
    setTouched(
      Object.keys(fieldErrors).reduce(
        (current, key) => ({ ...current, [key]: true }),
        {},
      ),
    );
    setFormError(null);
    setNotice(null);

    if (hasTaskErrors(fieldErrors)) {
      setStatus("idle");
      return null;
    }

    setStatus("loading");

    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
      due_date: toApiDateTime(values.due_date),
      customer_id: values.customer_id || null,
      total_price:
        values.total_price === "" || values.total_price === null
          ? null
          : Number(values.total_price),
    };

    if (!isEditing && values.initial_payment_amount !== "") {
      payload.initial_payment_amount = Number(values.initial_payment_amount);
      payload.initial_payment_date = toApiDateTime(values.initial_payment_date);
      payload.initial_payment_method = values.initial_payment_method;
      payload.initial_payment_account_id = values.initial_payment_account_id;
      payload.initial_payment_reference = values.initial_payment_reference.trim() || null;
      payload.initial_payment_notes = values.initial_payment_notes.trim() || null;
    }

    try {
      const saved = isEditing ? await updateTask(taskId, payload) : await createTask(payload);

      setStatus("success");
      setNotice(isEditing ? "Tarea actualizada." : "Tarea creada correctamente.");
      return saved;
    } catch (error) {
      const fieldErrors = getTaskApiFieldErrors(error);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
      }

      setStatus("error");
      setFormError(error?.message ?? "No pudimos guardar la tarea. Inténtalo de nuevo.");
      return null;
    }
  }, [isEditing, taskId, validationOptions, values]);

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
    setFieldValue,
  };
}
