"use client";

import { useCallback, useEffect, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getClosure } from "../services/financialService";

/**
 * Carga un cierre de caja con sus ajustes.
 *
 * Consume `GET /financial/closures/{id}`.
 */
export function useFinancialClosure(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    closure: null,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getClosure(id)
      .then((closure) => {
        if (!active) return;
        setState({ id, status: "success", closure, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          closure: null,
          error: requestError?.message ?? "No pudimos cargar el cierre.",
        });
      });

    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  const isCurrent = state.id === id;

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useDataInvalidation(DATA_DOMAINS.FINANCIALS, reload);

  return {
    closure: isCurrent ? state.closure : null,
    movements: isCurrent ? state.closure?.movements ?? [] : [],
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
