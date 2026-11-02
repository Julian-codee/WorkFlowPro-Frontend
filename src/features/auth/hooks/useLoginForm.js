"use client";

/**
 * Hook de estado y orquestación del formulario de inicio de sesión.
 *
 * Concentra toda la lógica de autenticación de la vista (estado, validación,
 * envío, carga y errores) para que los componentes visuales solo pinten.
 */

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_STATUS } from "../constants";
import { IS_API_MODE, POST_LOGIN_PATH } from "../config";
import { login, loginWithProvider, requestPasswordReset } from "../services/authService";
import { hasErrors, validateEmail, validateLoginForm } from "../services/validators";

const INITIAL_VALUES = { email: "", password: "" };
const INITIAL_ERRORS = { email: null, password: null };
const INITIAL_TOUCHED = { email: false, password: false };

export function useLoginForm() {
  const router = useRouter();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState(INITIAL_TOUCHED);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState(AUTH_STATUS.IDLE);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const formRef = useRef(null);

  const isLoading = status === AUTH_STATUS.LOADING;
  const isSuccess = status === AUTH_STATUS.SUCCESS;

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      setNotice(null);

      // Solo se valida en caliente un campo que el usuario ya ha tocado.
      if (!touched[field]) return;

      const fieldErrors = validateLoginForm({ ...values, [field]: value });
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

      const fieldErrors = validateLoginForm({ ...values, [name]: value });
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    },
    [values],
  );

  const handleRememberMe = useCallback((event) => {
    setRememberMe(event.target.checked);
  }, []);

  /** Enfoca el primer campo con error para mejorar la accesibilidad. */
  const focusFirstError = useCallback((fieldErrors) => {
    const firstInvalidField = ["email", "password"].find((field) => fieldErrors[field]);
    if (!firstInvalidField || !formRef.current) return;

    const input = formRef.current.querySelector(`[name="${firstInvalidField}"]`);
    if (input) input.focus();
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isLoading) return;

      const fieldErrors = validateLoginForm(values);
      setErrors(fieldErrors);
      setTouched({ email: true, password: true });
      setFormError(null);
      setNotice(null);

      if (hasErrors(fieldErrors)) {
        setStatus(AUTH_STATUS.IDLE);
        focusFirstError(fieldErrors);
        return;
      }

      setStatus(AUTH_STATUS.LOADING);

      try {
        const result = await login({ ...values, rememberMe });

        setStatus(AUTH_STATUS.SUCCESS);

        if (IS_API_MODE) {
          // Sesión real: navegamos al dashboard (el backend no redirige).
          setNotice("Sesión iniciada. Redirigiendo…");
          router.push(POST_LOGIN_PATH);
          return;
        }

        setNotice(`Sesión iniciada como ${result.user?.name ?? values.email} (simulación).`);
      } catch (error) {
        setStatus(AUTH_STATUS.ERROR);
        setFormError(error?.message ?? "No pudimos iniciar tu sesión. Inténtalo de nuevo.");
      }
    },
    [focusFirstError, isLoading, router, values, rememberMe],
  );

  const handleProviderLogin = useCallback(
    async (provider) => {
      if (isLoading) return;

      setStatus(AUTH_STATUS.LOADING);
      setFormError(null);
      setNotice(null);

      try {
        const result = await loginWithProvider(provider);
        setStatus(AUTH_STATUS.SUCCESS);
        setNotice(`Sesión iniciada con ${provider === "google" ? "Google" : provider} (simulación).`);
        return result;
      } catch (error) {
        setStatus(AUTH_STATUS.ERROR);
        setFormError(error?.message ?? "No pudimos iniciar tu sesión con este proveedor.");
        return null;
      }
    },
    [isLoading],
  );

  const resetForm = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors(INITIAL_ERRORS);
    setTouched(INITIAL_TOUCHED);
    setFormError(null);
    setNotice(null);
    setStatus(AUTH_STATUS.IDLE);
  }, []);

  /**
   * Rellena el formulario con datos concretos (usado por el acceso rápido a
   * la cuenta de demostración de la vista previa).
   */
  const setCredentials = useCallback((credentials = {}) => {
    setValues((current) => ({ ...current, ...credentials }));
    setErrors(INITIAL_ERRORS);
    setTouched(INITIAL_TOUCHED);
    setFormError(null);
    setNotice(null);
    setStatus(AUTH_STATUS.IDLE);
  }, []);

  /**
   * Recuperación de contraseña (simulada por ahora).
   */
  const handlePasswordReset = useCallback(async () => {
    const emailError = validateEmail(values.email);

    if (emailError) {
      setErrors((current) => ({ ...current, email: emailError }));
      setTouched((current) => ({ ...current, email: true }));
      focusFirstError({ email: emailError });
      return;
    }

    setFormError(null);
    setNotice(
      "Simulación: se ha solicitado el correo de recuperación. No se envía ningún email real todavía.",
    );

    try {
      await requestPasswordReset(values.email);
    } catch (error) {
      setFormError(error?.message ?? "No pudimos procesar la solicitud. Inténtalo de nuevo.");
    }
  }, [focusFirstError, values.email]);

  return {
    // valores y callbacks
    values,
    errors,
    touched,
    rememberMe,
    status,
    formError,
    notice,
    formRef,
    isLoading,
    isSuccess,
    // acciones
    handleChange,
    handleBlur,
    handleRememberMe,
    handleSubmit,
    handleProviderLogin,
    handlePasswordReset,
    resetForm,
    setCredentials,
  };
}
