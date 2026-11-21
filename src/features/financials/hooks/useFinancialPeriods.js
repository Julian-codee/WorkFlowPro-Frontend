"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { listPeriods } from "../services/financialService";

/**
 * Carga los períodos semanales con sus acumuladores.
 *
 * Consume `GET /financial/periods`.
 */
export function useFinancialPeriods(initialFilters = {}) {
  const [filters, setFilters] = useState({
    status: "",
    year: "",
    cashAccountId: "",
    search: "",
    ...initialFilters,
  });

  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    total: 0,
    stats: null,
    error: null,
  });

  const queryKey = JSON.stringify(filters);

  useEffect(() => {
    let active = true;

    listPeriods(filters)
      .then((result) => {
        if (!active) return;

        setState({
          key: queryKey,
          status: "success",
          items: result?.items ?? [],
          total: result?.total ?? 0,
          stats: result?.stats ?? null,
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
          stats: null,
          error: requestError?.message ?? "No pudimos cargar los períodos.",
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
    setFilters({ status: "", year: "", cashAccountId: "", search: "" });
  }, []);

  const refresh = useCallback(() => {
    setFilters((current) => ({ ...current }));
  }, []);

  useDataInvalidation(DATA_DOMAINS.FINANCIALS, refresh);

  const isCurrent = state.key === queryKey;

  const items = useMemo(() => (isCurrent ? state.items : []), [isCurrent, state.items]);

  /** Comparación entre dos períodos consecutivos. */
  const comparison = useMemo(() => {
    if (items.length < 2) return null;

    // El listado llega del más reciente al más antiguo: el primero es el
    // período actual y el segundo es el inmediatamente anterior.
    const [current, previous] = items;

    const variation = (field) => {
      const before = Number(previous[field] ?? 0);
      const after = Number(current[field] ?? 0);

      if (before === 0) return after === 0 ? 0 : 100;

      return Math.round(((after - before) / Math.abs(before)) * 1000) / 10;
    };

    return {
      previous,
      current,
      variation: {
        income: variation("income"),
        expense: variation("expense"),
        balance: variation("balance"),
      },
    };
  }, [items]);

  return {
    periods: items,
    stats: isCurrent ? state.stats : null,
    total: isCurrent ? state.total : 0,
    filters,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    isEmpty: isCurrent && state.status === "success" && state.items.length === 0,
    comparison,
    updateFilter,
    resetFilters,
    refresh,
  };
}
