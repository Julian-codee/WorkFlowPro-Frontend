"use client";

import { useCallback, useState } from "react";

import { checkDuplicates } from "../services/customerService";

/**
 * Verificación de duplicados antes de crear un cliente.
 *
 * Consume `checkDuplicates` (preparado para `POST /customers/check-duplicates`).
 */
export function useDuplicates() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const check = useCallback(async (payload) => {
    setStatus("loading");
    setError(null);

    try {
      const response = await checkDuplicates(payload);
      setResult(response);
      setStatus("success");
      return response;
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos verificar los duplicados.");
      setStatus("error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    isLoading: status === "loading",
    hasDuplicates: Boolean(result?.has_duplicates),
    check,
    reset,
  };
}
