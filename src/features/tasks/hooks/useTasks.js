"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listTasks } from "../services/taskService";

/**
 * Carga y filtra el listado de tareas.
 *
 * Ya consume `listTasks` (servicio preparado para `GET /tasks/`).
 * Los filtros se aplican en el servidor cuando conectes el endpoint.
 */
export function useTasks(initialFilters = {}) {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
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

    listTasks(filters)
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
          error: requestError?.message ?? "No pudimos cargar las tareas.",
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
      status: "",
      priority: "",
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
    tasks: items,
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
