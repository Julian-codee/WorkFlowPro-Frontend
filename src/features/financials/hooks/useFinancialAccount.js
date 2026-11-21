"use client";

import { useCallback, useEffect, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getAccount } from "../services/financialService";

/**
 * Carga una cuenta financiera con sus movimientos.
 *
 * Consume `GET /financial/accounts/{id}`.
 */
export function useFinancialAccount(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    account: null,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getAccount(id)
      .then((account) => {
        if (!active) return;
        setState({ id, status: "success", account, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          account: null,
          error: requestError?.message ?? "No pudimos cargar la cuenta.",
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
    account: isCurrent ? state.account : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
