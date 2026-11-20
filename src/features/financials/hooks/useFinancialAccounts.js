"use client";

import { useCallback, useEffect, useState } from "react";

import { listAccounts } from "../services/financialService";

/**
 * Carga la lista de cuentas financieras con filtros.
 *
 * Consume `GET /financial/accounts`.
 */
export function useFinancialAccounts(initialFilters = {}) {
  const [filters, setFilters] = useState({
    type: "",
    status: "active",
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

    listAccounts(filters)
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
          error: requestError?.message ?? "No pudimos cargar las cuentas.",
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
    setFilters({ type: "", status: "active", search: "" });
  }, []);

  const refresh = useCallback(() => {
    setFilters((current) => ({ ...current }));
  }, []);

  const isCurrent = state.key === queryKey;

  return {
    accounts: isCurrent ? state.items : [],
    stats: isCurrent ? state.stats : null,
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
