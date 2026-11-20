"use client";

import { useEffect, useState } from "react";

import { getQuotationFull } from "../services/quotationService";

/**
 * Historial de acciones de la cotización.
 * Consume `GET /quotations/{id}/full` (la parte `history` de la respuesta).
 */
export function useQuotationHistory(quotationId) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    entries: [],
    error: null,
  });

  useEffect(() => {
    if (!quotationId) return undefined;

    let active = true;

    getQuotationFull(quotationId)
      .then((result) => {
        if (!active) return;
        setState({
          key: quotationId,
          status: "success",
          entries: result?.history ?? [],
          error: null,
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key: quotationId,
          status: "error",
          entries: [],
          error: requestError?.message ?? "No pudimos cargar el historial.",
        });
      });

    return () => {
      active = false;
    };
  }, [quotationId]);

  const isCurrent = state.key === quotationId;

  return {
    entries: isCurrent ? state.entries : [],
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
  };
}
