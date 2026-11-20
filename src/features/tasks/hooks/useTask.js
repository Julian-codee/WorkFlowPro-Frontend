"use client";

import { useCallback, useEffect, useState } from "react";

import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getTask } from "../services/taskService";

/** Carga el detalle real de una tarea y lo mantiene sincronizado. */
export function useTask(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    task: null,
    error: null,
  });

  const fetchTask = useCallback(() => (id ? getTask(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    fetchTask()
      .then((task) => {
        if (!active) return;
        setState({ id, status: "success", task, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          task: null,
          error: requestError?.message ?? "No pudimos cargar la tarea.",
        });
      });

    return () => {
      active = false;
    };
  }, [fetchTask, id]);

  const reload = useCallback(() => {
    if (!id) return;

    fetchTask()
      .then((task) => {
        setState({ id, status: "success", task, error: null });
      })
      .catch((requestError) => {
        setState({
          id,
          status: "error",
          task: null,
          error: requestError?.message ?? "No pudimos cargar la tarea.",
        });
      });
  }, [fetchTask, id]);

  useDataInvalidation("tasks", reload);

  const isCurrent = state.id === id;

  return {
    task: isCurrent ? state.task : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
    setTask: (task) => setState({ id, status: "success", task, error: null }),
  };
}
