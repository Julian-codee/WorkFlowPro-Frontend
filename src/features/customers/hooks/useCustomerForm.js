"use client";

import { useCallback, useMemo, useState } from "react";

import {
  createCustomer,
  createLegalCustomer,
  createNaturalCustomer,
  updateCustomer,
} from "../services/customerService";
import { hasCustomerErrors, validateCustomerForm } from "../services/validators";

const EMPTY_VALUES = {
  type: "natural",
  first_name: "",
  last_name: "",
  business_name: "",
  legal_name: "",
  tax_id: "",
  document_type: "dni",
  document_number: "",
  email: "",
  phone: "",
  birth_date: "",
  incorporation_date: "",
  industry: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
};

const EMPTY_ERRORS = {};

/**
 * Construye el payload final según el tipo de cliente.
 * Solo se envían los campos que aplican a la variante elegida.
 */
export function buildCustomerPayload(values = {}) {
  const common = {
    document_type: values.document_type,
    document_number: values.document_number?.trim(),
    email: values.email?.trim(),
    phone: values.phone?.trim(),
    address: values.address?.trim(),
    city: values.city?.trim(),
    state: values.state?.trim() || null,
    country: values.country?.trim(),
  };

  if (values.type === "legal") {
    return {
      type: "legal",
      ...common,
      business_name: values.business_name?.trim(),
      legal_name: values.legal_name?.trim(),
      tax_id: values.tax_id?.trim(),
      industry: values.industry?.trim(),
      incorporation_date: values.incorporation_date || null,
      website: values.website?.trim() || null,
      contact_name: values.contact_name?.trim(),
      contact_email: values.contact_email?.trim() || null,
      contact_phone: values.contact_phone?.trim() || null,
    };
  }

  return {
    type: "natural",
    ...common,
    first_name: values.first_name?.trim(),
    last_name: values.last_name?.trim(),
    birth_date: values.birth_date || null,
  };
}

/**
 * Estado y validación del formulario de cliente (alta y edición).
 *
 * `submitCustomer` llama al servicio; al conectar el backend solo cambia el
 * servicio, no este hook ni el componente del formulario.
 *
 * @param {object} options
 * @param {object} [options.initialValues] Valores iniciales (modo edición).
 * @param {string|null} [options.customerId] Si existe, edita en lugar de crear.
 * @param {"generic"|"natural"|"legal"} [options.createWith] Endpoint de alta:
 *   "generic" → POST /customers/ · "natural" → POST /customers/natural ·
 *   "legal" → POST /customers/legal.
 */
export function useCustomerForm({ initialValues = {}, customerId = null, createWith = "generic" } = {}) {
  const emptyValues = useMemo(
    () => ({ ...EMPTY_VALUES, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const isEditing = Boolean(customerId);
  const isLoading = status === "loading";

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      setNotice(null);

      if (!touched[field]) return;

      const fieldErrors = validateCustomerForm({ ...values, [field]: value });
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

      const fieldErrors = validateCustomerForm({ ...values, [name]: value });
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    },
    [values],
  );

  /**
   * Cambia el tipo de cliente y ajusta el tipo de documento por defecto
   * para que la combinación sea coherente (DNI ↔ RUC).
   */
  const handleTypeChange = useCallback((type) => {
    setValues((current) => {
      const next = { ...current, type };

      if (type === "legal" && current.document_type === "dni") {
        next.document_type = "ruc";
      }

      if (type === "natural" && current.document_type === "ruc") {
        next.document_type = "dni";
      }

      return next;
    });

    setFormError(null);
    setNotice(null);
  }, []);

  const submitCustomer = useCallback(async () => {
    const fieldErrors = validateCustomerForm(values);

    setErrors(fieldErrors);
    setTouched(
      Object.keys(fieldErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    );
    setFormError(null);
    setNotice(null);

    if (hasCustomerErrors(fieldErrors)) {
      setStatus("idle");
      return null;
    }

    setStatus("loading");

    const payload = buildCustomerPayload(values);

    try {
      let saved;

      if (isEditing) {
        saved = await updateCustomer(customerId, payload);
      } else if (createWith === "natural") {
        saved = await createNaturalCustomer(payload);
      } else if (createWith === "legal") {
        saved = await createLegalCustomer(payload);
      } else {
        saved = await createCustomer(payload);
      }

      setStatus("success");
      setNotice(isEditing ? "Cliente actualizado." : "Cliente creado correctamente.");
      return saved;
    } catch (error) {
      setStatus("error");
      setFormError(error?.message ?? "No pudimos guardar el cliente. Inténtalo de nuevo.");
      return null;
    }
  }, [createWith, customerId, isEditing, values]);

  const reset = useCallback(() => {
    setValues(emptyValues);
    setErrors(EMPTY_ERRORS);
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
    handleTypeChange,
    submitCustomer,
    reset,
    setValues,
  };
}
