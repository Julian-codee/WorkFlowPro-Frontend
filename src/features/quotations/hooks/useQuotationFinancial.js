"use client";

import { useEffect, useState } from "react";

import { getQuotationFinancial } from "../services/quotationService";

/**
 * Resumen financiero de la cotización.
 * Consume `getQuotationFinancial` (preparado para `GET /quotations/{id}/financial`).
 */
export function useQuotationFinancial(quotationId) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    financial: null,
    error: null,
  });

  useEffect(() => {
    if (!quotationId) return undefined;

    let active = true;

    getQuotationFinancial(quotationId)
      .then((financial) => {
        if (!active) return;
        setState({ key: quotationId, status: "success", financial, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key: quotationId,
          status: "error",
          financial: null,
          error: requestError?.message ?? "No pudimos cargar el resumen financiero.",
        });
      });

    return () => {
      active = false;
    };
  }, [quotationId]);

  const isCurrent = state.key === quotationId;

  return {
    financial: isCurrent ? state.financial : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
  };
}
