"use client";

import { useCallback, useEffect, useState } from "react";

import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getTaskPayments } from "../services/taskService";

/** Carga el historial real y paginado de abonos asociados a una tarea. */
export function useTaskPayments(taskId, { pageSize = 10 } = {}) {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({
    status: "loading",
    payments: [],
    total: 0,
    page: 1,
    totalPages: 1,
    error: null,
  });

  const fetchPayments = useCallback(
    () => (taskId ? getTaskPayments(taskId, { page, pageSize }) : Promise.resolve(null)),
    [page, pageSize, taskId],
  );

  useEffect(() => {
    if (!taskId) return undefined;

    let active = true;

    fetchPayments()
      .then((result) => {
        if (!active) return;
        setState({
          status: "success",
          payments: result?.items ?? [],
          total: result?.total ?? 0,
          page: result?.page ?? page,
          totalPages: result?.totalPages ?? 1,
          error: null,
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          status: "error",
          payments: [],
          total: 0,
          page,
          totalPages: 1,
          error: requestError?.message ?? "No pudimos cargar el historial de abonos.",
        });
      });

    return () => {
      active = false;
    };
  }, [fetchPayments, page, taskId]);

  const reload = useCallback(() => {
    if (!taskId) return;

    fetchPayments()
      .then((result) => {
        setState({
          status: "success",
          payments: result?.items ?? [],
          total: result?.total ?? 0,
          page: result?.page ?? page,
          totalPages: result?.totalPages ?? 1,
          error: null,
        });
      })
      .catch((requestError) => {
        setState({
          status: "error",
          payments: [],
          total: 0,
          page,
          totalPages: 1,
          error: requestError?.message ?? "No pudimos cargar el historial de abonos.",
        });
      });
  }, [fetchPayments, page, taskId]);

  useDataInvalidation("tasks", reload);

  return {
    ...state,
    isLoading: state.status === "loading",
    reload,
    setPage,
  };
}
