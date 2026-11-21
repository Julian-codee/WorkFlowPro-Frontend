"use client";

import { useCallback, useEffect, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getFinancialOverview } from "../services/financialService";

/**
 * Carga el resumen general del dashboard financiero.
 *
 * Compone `GET /financial/movements`, `GET /financial/periods` y
 * `GET /financial/closures-history` (no es un endpoint propio).
 */
export function useFinancialOverview() {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    data: null,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    getFinancialOverview()
      .then((data) => {
        if (!active) return;
        setState({ key: reloadToken, status: "success", data, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key: reloadToken,
          status: "error",
          data: null,
          error: requestError?.message ?? "No pudimos cargar el resumen financiero.",
        });
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useDataInvalidation(DATA_DOMAINS.FINANCIALS, reload);

  const isCurrent = state.key === reloadToken;

  return {
    overview: isCurrent ? state.data : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
