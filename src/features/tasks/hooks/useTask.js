"use client";

import { useEffect, useState } from "react";

import { getTask } from "../services/taskService";

/**
 * Carga el detalle de una tarea (preparado para `GET /tasks/{id}`).
 */
export function useTask(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    task: null,
    error: null,
  });

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getTask(id)
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
  }, [id]);

  // Si cambia el id, la información anterior se descarta.
  const isCurrent = state.id === id;

  return {
    task: isCurrent ? state.task : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload: () => setState({ id: null, status: "loading", task: null, error: null }),
    setTask: (task) => setState({ id, status: "success", task, error: null }),
  };
}
