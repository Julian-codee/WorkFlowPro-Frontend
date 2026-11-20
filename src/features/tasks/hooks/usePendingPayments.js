"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { listPendingPayments } from "../services/taskService";

const DEFAULT_FILTERS = {
  search: "",
  customerId: "",
  status: "",
  scope: "all",
  dueFrom: "",
  dueTo: "",
  minBalance: "",
  maxBalance: "",
  sortBy: "due_date",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
};

/** Estado de filtros, estadísticas y paginación de Pagos pendientes. */
export function usePendingPayments(initialFilters = {}) {
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    total: 0,
    totalPages: 1,
    stats: null,
    error: null,
  });

  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let active = true;

    listPendingPayments({
      ...filters,
      onlyActive: filters.scope === "active",
      onlyCompleted: filters.scope === "completed",
    })
      .then((result) => {
        if (!active) return;

        setState({
          key: queryKey,
          status: "success",
          items: result.items ?? [],
          total: result.total ?? 0,
          totalPages: result.totalPages ?? 1,
          stats: result.stats ?? null,
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
          totalPages: 1,
          stats: null,
          error: requestError?.message ?? "No pudimos cargar los pagos pendientes.",
        });
      });

    return () => {
      active = false;
    };
  }, [filters, queryKey]);

  const reload = useCallback(() => {
    setFilters((current) => ({ ...current }));
  }, []);

  useDataInvalidation("tasks", reload);

  const updateFilter = useCallback((patch) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const setPage = useCallback((page) => {
    setFilters((current) => ({ ...current, page }));
  }, []);

  const isCurrent = state.key === queryKey;
  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filters).some(
        ([key, value]) =>
          !["page", "pageSize", "sortBy", "sortOrder"].includes(key) &&
          value !== "" &&
          value !== null &&
          value !== "all",
      ),
    [filters],
  );

  return {
    tasks: isCurrent ? state.items : [],
    total: isCurrent ? state.total : 0,
    totalPages: isCurrent ? state.totalPages : 1,
    stats: isCurrent ? state.stats : null,
    filters,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    isEmpty: isCurrent && state.status === "success" && state.items.length === 0,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    reload,
    setPage,
  };
}
