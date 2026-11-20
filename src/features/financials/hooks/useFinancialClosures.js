"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getClosuresHistory } from "../services/financialService";

/**
 * Carga el historial de cierres de caja con filtros.
 *
 * Consume `GET /financial/closures-history`.
 */
export function useFinancialClosures(initialFilters = {}) {
  const [filters, setFilters] = useState({
    status: "",
    from: "",
    to: "",
    search: "",
    ...initialFilters,
  });

  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    total: 0,
    totals: null,
    error: null,
  });

  const queryKey = JSON.stringify(filters);

  useEffect(() => {
    let active = true;

    getClosuresHistory(filters)
      .then((result) => {
        if (!active) return;

        setState({
          key: queryKey,
          status: "success",
          items: result?.items ?? [],
          total: result?.total ?? 0,
          totals: result?.totals ?? null,
          error: null,
        });
      })
      .catch((requestError) => {
        if (!active) return;

        setState({
          key: queryKey,
          status: "error",
          items: [],
          total: 0,
          totals: null,
          error: requestError?.message ?? "No pudimos cargar el historial de cierres.",
        });
      });

    return () => {
      active = false;
    };
  }, [filters, queryKey]);

  const updateFilter = useCallback((patch) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: "", from: "", to: "", search: "" });
  }, []);

  const refresh = useCallback(() => {
    setFilters((current) => ({ ...current }));
  }, []);

  const isCurrent = state.key === queryKey;

  const items = useMemo(() => (isCurrent ? state.items : []), [isCurrent, state.items]);

  const stats = useMemo(
    () => ({
      total: items.length,
      withDifference: items.filter((closure) => Math.abs(closure.difference ?? 0) > 0).length,
      pendingAdjustments: items.reduce(
        (acc, closure) =>
          acc + closure.adjustments.filter((adjustment) => adjustment.status === "pending").length,
        0,
      ),
    }),
    [items],
  );

  return {
    closures: items,
    stats,
    totals: isCurrent ? state.totals : null,
    total: isCurrent ? state.total : 0,
    filters,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    isEmpty: isCurrent && state.status === "success" && state.items.length === 0,
    updateFilter,
    resetFilters,
    refresh,
  };
}
