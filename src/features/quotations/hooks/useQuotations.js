"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listQuotations } from "../services/quotationService";

/**
 * Carga y filtra el listado de cotizaciones.
 *
 * Ya consume `listQuotations` (servicio preparado para `GET /quotations/`).
 */
export function useQuotations(initialFilters = {}) {
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    customerId: "",
    search: "",
    page: 1,
    pageSize: 8,
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

    listQuotations(filters)
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
          error: requestError?.message ?? "No pudimos cargar las cotizaciones.",
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
      status: "",
      type: "",
      customerId: "",
      search: "",
      page: 1,
      pageSize: 8,
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
    () => Math.max(1, Math.ceil(total / (filters.pageSize || 8))),
    [total, filters.pageSize],
  );

  return {
    quotations: items,
    stats,
    total,
    filters,
    status,
    error,
    isLoading: status === "loading",
    isEmpty: status === "success" && items.length === 0,
    totalPages,
    updateFilter,
    resetFilters,
    refresh,
    setPage,
  };
}
