"use client";

import { useCallback, useState } from "react";

import { calculateQuotation } from "../services/quotationService";

/**
 * Vista previa de totales de una cotización.
 *
 * Consume `POST /quotations/calculate` (el backend devuelve los totales
 * calculados a partir de los ítems enviados).
 */
export function useQuotationTotals() {
  const [totals, setTotals] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const calculate = useCallback(async (payload) => {
    setStatus("loading");
    setError(null);

    try {
      const result = await calculateQuotation(payload);
      setTotals(result);
      setStatus("success");
      return result;
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos calcular los totales.");
      setStatus("error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setTotals(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    totals,
    status,
    error,
    isLoading: status === "loading",
    calculate,
    reset,
  };
}
