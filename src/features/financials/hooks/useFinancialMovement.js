"use client";

import { useCallback, useEffect, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getMovement } from "../services/financialService";

/**
 * Carga un movimiento concreto.
 *
 * Consume `GET /financial/movements/{id}`.
 */
export function useFinancialMovement(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    movement: null,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getMovement(id)
      .then((movement) => {
        if (!active) return;
        setState({ id, status: "success", movement, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          movement: null,
          error: requestError?.message ?? "No pudimos cargar el movimiento.",
        });
      });

    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  const isCurrent = state.id === id;

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useDataInvalidation(DATA_DOMAINS.FINANCIALS, reload);

  return {
    movement: isCurrent ? state.movement : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
