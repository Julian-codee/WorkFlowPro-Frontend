"use client";

import { useCallback, useMemo, useState } from "react";

import { createQuotation, updateQuotation } from "../services/quotationService";
import {
  hasQuotationErrors,
  validateQuotationForm,
} from "../services/validators";

const EMPTY_ITEM = {
  description: "",
  quantity: 1,
  unit_price: 0,
  discount: 0,
  tax_rate: 18,
};

const EMPTY_VALUES = {
  type: "natural",
  customer_id: "",
  customer_name: "",
  customer_email: "",
  title: "",
  currency: "USD",
  valid_until: "",
  notes: "",
  payment_terms: "",
  items: [{ ...EMPTY_ITEM }],
};

/**
 * Construye el payload final de la cotización.
 */
export function buildQuotationPayload(values = {}) {
  return {
    type: values.type ?? "natural",
    customer_id: values.customer_id ?? null,
    customer_name: values.customer_name ?? "",
    customer_email: values.customer_email ?? "",
    title: values.title?.trim(),
    currency: values.currency ?? "USD",
    valid_until: values.valid_until || null,
    notes: values.notes?.trim() ?? "",
    payment_terms: values.payment_terms?.trim() ?? "",
    items: (values.items ?? []).map((item) => ({
      // Las líneas nuevas (ids "new_*") todavía no existen en el backend.
      ...(item.id && !item.id.startsWith("new_") ? { id: item.id } : {}),
      description: item.description?.trim(),
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      discount: Number(item.discount ?? 0),
      tax_rate: Number(item.tax_rate ?? 0),
    })),
  };
}

/**
 * Estado y validación del formulario de cotización (alta y edición).
 *
 * `submitQuotation` llama al servicio; al conectar el backend solo cambia el
 * servicio, no este hook ni el componente del formulario.
 *
 * @param {{ initialValues?: object, quotationId?: string|null }} options
 */
export function useQuotationForm({ initialValues = {}, quotationId = null } = {}) {
  const emptyValues = useMemo(
    () => ({ ...EMPTY_VALUES, ...initialValues, items: initialValues.items?.length ? initialValues.items : [{ ...EMPTY_ITEM }] }),
    [initialValues],
  );

  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const isEditing = Boolean(quotationId);
  const isLoading = status === "loading";

  const validate = useCallback((nextValues) => validateQuotationForm(nextValues), []);

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      setNotice(null);

      // Solo se muestran los errores de los campos ya visitados.
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

  /** Actualiza una línea del detalle. */
  const setItemValue = useCallback(
    (itemId, field, value) => {
      const items = values.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      );

      setValues((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item,
        ),
      }));
      setFormError(null);
      setNotice(null);

      if (!touched.items) return;

      const fieldErrors = validate({ ...values, items });
      setErrors((current) => ({ ...current, item_errors: fieldErrors.item_errors }));
    },
    [touched.items, validate, values],
  );

  /** Añade una línea vacía al detalle. */
  const addItem = useCallback(() => {
    const items = [...values.items, { ...EMPTY_ITEM, id: `new_${Date.now().toString(36)}` }];

    setValues((current) => ({ ...current, items }));

    if (!touched.items) return;

    const fieldErrors = validate({ ...values, items });
    setErrors((current) => ({
      ...current,
      items: fieldErrors.items,
      item_errors: fieldErrors.item_errors,
    }));
  }, [touched.items, validate, values]);

  /** Elimina una línea del detalle. */
  const removeItem = useCallback(
    (itemId) => {
      const remaining = values.items.filter((item) => item.id !== itemId);
      const items = remaining.length ? remaining : [{ ...EMPTY_ITEM }];

      setValues((current) => ({ ...current, items }));

      if (!touched.items) return;

      const fieldErrors = validate({ ...values, items });
      setErrors((current) => ({
        ...current,
        items: fieldErrors.items,
        item_errors: fieldErrors.item_errors,
      }));
    },
    [touched.items, validate, values],
  );

  const submitQuotation = useCallback(async () => {
    const fieldErrors = validate(values);

    setErrors(fieldErrors);
    setTouched({
      title: true,
      customer_id: true,
      valid_until: true,
      items: true,
    });
    setFormError(null);
    setNotice(null);

    if (hasQuotationErrors(fieldErrors)) {
      setStatus("idle");
      return null;
    }

    setStatus("loading");

    const payload = buildQuotationPayload(values);

    try {
      const saved = isEditing
        ? await updateQuotation(quotationId, payload)
        : await createQuotation(payload);

      setStatus("success");
      setNotice(isEditing ? "Cotización actualizada." : "Cotización creada correctamente.");
      return saved;
    } catch (error) {
      setStatus("error");
      setFormError(error?.message ?? "No pudimos guardar la cotización. Inténtalo de nuevo.");
      return null;
    }
  }, [isEditing, quotationId, validate, values]);

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
    setFieldValue,
    setItemValue,
    addItem,
    removeItem,
    submitQuotation,
    reset,
    setValues,
  };
}
