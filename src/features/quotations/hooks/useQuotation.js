"use client";

import { useEffect, useState } from "react";

import { getQuotation } from "../services/quotationService";

/**
 * Carga el detalle de una cotización (preparado para `GET /quotations/{id}`).
 */
export function useQuotation(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    quotation: null,
    error: null,
  });

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getQuotation(id)
      .then((quotation) => {
        if (!active) return;
        setState({ id, status: "success", quotation, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          quotation: null,
          error: requestError?.message ?? "No pudimos cargar la cotización.",
        });
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isCurrent = state.id === id;

  return {
    quotation: isCurrent ? state.quotation : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload: () => setState({ id: null, status: "loading", quotation: null, error: null }),
    setQuotation: (quotation) => setState({ id, status: "success", quotation, error: null }),
  };
}
