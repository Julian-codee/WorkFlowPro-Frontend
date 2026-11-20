"use client";

import { useCallback, useEffect, useState } from "react";

import { listCustomers } from "@/features/customers/services/customerService";

/**
 * Selector de clientes para la cotización.
 *
 * Reutiliza el servicio del módulo de clientes (`GET /customers/`): la
 * cotización necesita cliente_id, nombre y tipo (natural / legal).
 */
export function useQuotationCustomers({ type = "", search = "" } = {}) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    error: null,
  });

  const key = JSON.stringify({ type, search });

  useEffect(() => {
    let active = true;

    listCustomers({ type, search, pageSize: 20 })
      .then((result) => {
        if (!active) return;
        setState({
          key,
          status: "success",
          items: result?.items ?? [],
          error: null,
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key,
          status: "error",
          items: [],
          error: requestError?.message ?? "No pudimos cargar los clientes.",
        });
      });

    return () => {
      active = false;
    };
  }, [key, search, type]);

  const isCurrent = state.key === key;

  const reload = useCallback(() => {
    setState({ key: null, status: "loading", items: [], error: null });
  }, []);

  return {
    customers: isCurrent ? state.items : [],
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
