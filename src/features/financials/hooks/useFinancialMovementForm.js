"use client";

import { useCallback, useMemo, useState } from "react";

import { createMovement, updateMovement } from "../services/financialService";
import { hasMovementErrors, validateMovementForm } from "../services/validators";
import { MOVEMENT_TYPES, getCategoriesForType } from "../constants";

const EMPTY_VALUES = {
  type: MOVEMENT_TYPES.EXPENSE,
  concept: "",
  category: "",
  amount: "",
  account_id: "",
  payment_method: "cash",
  movement_date: "",
  reference: "",
  notes: "",
};

/**
 * Construye el payload final del movimiento.
 */
export function buildMovementPayload(values = {}) {
  return {
    type: values.type ?? MOVEMENT_TYPES.EXPENSE,
    concept: values.concept?.trim(),
    category: values.category ?? "",
    amount: Number(values.amount ?? 0),
    account_id: values.account_id ?? null,
    payment_method: values.payment_method ?? "cash",
    movement_date: values.movement_date ?? null,
    reference: values.reference?.trim() ?? "",
    notes: values.notes?.trim() ?? "",
  };
}

/**
 * Estado y validación del formulario de movimiento (alta y edición).
 *
 * `submitMovement` llama al servicio; al conectar el backend solo cambia el
 * servicio, no este hook ni el componente del formulario.
 *
 * @param {{ initialValues?: object, movementId?: string|null }} options
 */
export function useFinancialMovementForm({ initialValues = {}, movementId = null } = {}) {
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

  const isEditing = Boolean(movementId);
  const isLoading = status === "loading";

  const validate = useCallback((nextValues) => validateMovementForm(nextValues), []);

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((current) => {
        const next = { ...current, [field]: value };

        // Al cambiar el tipo se reinicia la categoría para que siga siendo válida.
        if (field === "type") {
          next.category = "";
        }

        return next;
      });
      setFormError(null);
      setNotice(null);

      if (!touched[field]) return;

      const fieldErrors = validate({ ...values, [field]: value });
      setErrors((current) => ({ ...current, [field]: fieldErrors[field] }));
    },
    [touched, validate, values],
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

      const fieldErrors = validate({ ...values, [name]: value });
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    },
    [validate, values],
  );

  const categories = getCategoriesForType(values.type);

  const submitMovement = useCallback(async () => {
    const fieldErrors = validate(values);

    setErrors(fieldErrors);
    setTouched({
      type: true,
      concept: true,
      amount: true,
      account_id: true,
      category: true,
      payment_method: true,
      movement_date: true,
      notes: true,
    });
    setFormError(null);
    setNotice(null);

    if (hasMovementErrors(fieldErrors)) {
      setStatus("idle");
      return null;
    }

    setStatus("loading");

    const payload = buildMovementPayload(values);

    try {
      const saved = isEditing
        ? await updateMovement(movementId, payload)
        : await createMovement(payload);

      setStatus("success");
      setNotice(isEditing ? "Movimiento actualizado." : "Movimiento registrado.");
      return saved;
    } catch (error) {
      setStatus("error");
      setFormError(error?.message ?? "No pudimos guardar el movimiento.");
      return null;
    }
  }, [isEditing, movementId, validate, values]);

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
    categories,
    isEditing,
    isLoading,
    handleChange,
    handleBlur,
    setFieldValue,
    submitMovement,
    reset,
  };
}
