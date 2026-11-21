"use client";

import { useCallback, useEffect, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getPeriodSummary } from "../services/financialService";

/**
 * Carga el resumen completo de un período semanal.
 *
 * Consume `GET /financial/periods/{id}/summary`.
 */
export function useFinancialPeriod(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    summary: null,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getPeriodSummary(id)
      .then((summary) => {
        if (!active) return;
        setState({ id, status: "success", summary, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          summary: null,
          error: requestError?.message ?? "No pudimos cargar el período.",
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
    period: isCurrent ? state.summary?.period : null,
    totals: isCurrent ? state.summary?.totals : null,
    closureTotals: isCurrent ? state.summary?.closure_totals : null,
    movements: isCurrent ? state.summary?.movements ?? [] : [],
    closure: isCurrent ? state.summary?.closure ?? null : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
