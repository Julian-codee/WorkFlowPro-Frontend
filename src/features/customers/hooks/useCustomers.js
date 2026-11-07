"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listCustomers } from "../services/customerService";

/**
 * Carga y filtra el listado de clientes.
 *
 * Ya consume `listCustomers` (servicio preparado para `GET /customers/`).
 * Los filtros se aplican en el servidor cuando conectes el endpoint.
 */
export function useCustomers(initialFilters = {}) {
  const [filters, setFilters] = useState({
    type: "",
    status: "",
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

  // Clave que identifica la consulta actual (evita estados obsoletos).
  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let active = true;

    listCustomers(filters)
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
          error: requestError?.message ?? "No pudimos cargar los clientes.",
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
      // Cualquier cambio de filtro vuelve a la primera página.
      page: patch.page ?? 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: "",
      status: "",
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

  // Mientras la respuesta no corresponde a la consulta actual, seguimos cargando.
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
    customers: items,
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
