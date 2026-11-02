"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_STATUS } from "../constants";
import { IS_API_MODE, POST_LOGIN_PATH } from "../config";
import { register } from "../services/authService";
import { hasErrors, validateRegisterForm } from "../services/validators";

const INITIAL_VALUES = {
  email: "",
  username: "",
  password: "",
  password_confirmation: "",
  tenant_slug: "",
};

/**
 * Estado y validación del formulario de registro.
 *
 * El servicio `register` ya está preparado para `POST /auth/register`.
 */
export function useRegisterForm() {
  const router = useRouter();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState(AUTH_STATUS.IDLE);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const formRef = useRef(null);
  const isLoading = status === AUTH_STATUS.LOADING;

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      setNotice(null);

      if (!touched[field]) return;

      const fieldErrors = validateRegisterForm({ ...values, [field]: value });
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

      const fieldErrors = validateRegisterForm({ ...values, [name]: value });
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    },
    [values],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isLoading) return;

      const fieldErrors = validateRegisterForm(values);
      setErrors(fieldErrors);
      setTouched({
        email: true,
        username: true,
        password: true,
        password_confirmation: true,
        tenant_slug: true,
      });
      setFormError(null);
      setNotice(null);

      if (hasErrors(fieldErrors)) {
        setStatus(AUTH_STATUS.IDLE);

        const firstInvalid = ["email", "username", "password", "password_confirmation"].find(
          (field) => fieldErrors[field],
        );

        if (firstInvalid && formRef.current) {
          formRef.current.querySelector(`[name="${firstInvalid}"]`)?.focus();
        }

        return;
      }

      setStatus(AUTH_STATUS.LOADING);

      try {
        const result = await register({
          email: values.email.trim(),
          username: values.username.trim(),
          password: values.password,
          tenant_slug: values.tenant_slug.trim() || undefined,
        });

        setStatus(AUTH_STATUS.SUCCESS);

        if (IS_API_MODE) {
          setNotice("Cuenta creada. Redirigiendo…");
          router.push(POST_LOGIN_PATH);
          return;
        }

        setNotice(
          `Cuenta creada para ${result.user?.email ?? values.email} (simulación). Ya puedes iniciar sesión.`,
        );
      } catch (error) {
        setStatus(AUTH_STATUS.ERROR);
        setFormError(error?.message ?? "No pudimos crear la cuenta. Inténtalo de nuevo.");
      }
    },
    [formRef, isLoading, router, values],
  );

  return {
    values,
    errors,
    touched,
    status,
    formError,
    notice,
    formRef,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
