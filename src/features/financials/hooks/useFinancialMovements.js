"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listMovements } from "../services/financialService";

/**
 * Carga y filtra el registro de movimientos.
 *
 * Consume `GET /financial/movements`.
 */
export function useFinancialMovements(initialFilters = {}) {
  const [filters, setFilters] = useState({
    type: "",
    accountId: "",
    category: "",
    paymentMethod: "",
    status: "",
    from: "",
    to: "",
    minAmount: "",
    maxAmount: "",
    search: "",
    page: 1,
    pageSize: 12,
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

  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let active = true;

    listMovements(filters)
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
          error: requestError?.message ?? "No pudimos cargar los movimientos.",
        });
      });

    return () => {
      active = false;
    };
  }, [filters, queryKey]);

  const updateFilter = useCallback((patch) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: "",
      accountId: "",
      category: "",
      paymentMethod: "",
      status: "",
      from: "",
      to: "",
      minAmount: "",
      maxAmount: "",
      search: "",
      page: 1,
      pageSize: 12,
    });
  }, []);

  const refresh = useCallback(() => {
    setFilters((current) => ({ ...current }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((current) => ({ ...current, page }));
  }, []);

  const isCurrentQuery = state.key === queryKey;
  const status = isCurrentQuery ? state.status : "loading";
  const items = isCurrentQuery ? state.items : [];
  const total = isCurrentQuery ? state.total : 0;
  const stats = isCurrentQuery ? state.stats : null;
  const error = isCurrentQuery ? state.error : null;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / (filters.pageSize || 12))),
    [filters.pageSize, total],
  );

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filters).some(
        ([key, value]) =>
          !["page", "pageSize"].includes(key) && value !== "" && value !== null,
      ),
    [filters],
  );

  return {
    movements: items,
    stats,
    total,
    filters,
    status,
    error,
    isLoading: status === "loading",
    isEmpty: status === "success" && items.length === 0,
    hasActiveFilters,
    totalPages,
    updateFilter,
    resetFilters,
    refresh,
    setPage,
  };
}
