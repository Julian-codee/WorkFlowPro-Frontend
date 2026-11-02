"use client";

import { useCallback, useMemo, useState } from "react";

import { updateProfile } from "../services/profileService";

/**
 * Estado del formulario de perfil (GET/PATCH /auth/me).
 */
export function useProfileForm(user) {
  const initialValues = useMemo(
    () => ({
      full_name: user?.full_name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      avatar_url: user?.avatar_url ?? "",
    }),
    [user],
  );

  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

  const isLoading = status === "loading";

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFormError(null);
    setNotice(null);
  }, []);

  const submitProfile = useCallback(async () => {
    setStatus("loading");
    setFormError(null);
    setNotice(null);

    try {
      const updated = await updateProfile({
        full_name: values.full_name.trim(),
        username: values.username.trim(),
        avatar_url: values.avatar_url.trim() || null,
      });

      setStatus("success");
      setNotice("Perfil actualizado correctamente.");
      return updated;
    } catch (error) {
      setStatus("error");
      setFormError(error?.message ?? "No pudimos guardar el perfil. Inténtalo de nuevo.");
      return null;
    }
  }, [values]);

  return {
    values,
    status,
    formError,
    notice,
    isLoading,
    handleChange,
    submitProfile,
  };
}
