"use client";

import { useEffect, useState } from "react";

import { getCustomer } from "../services/customerService";

/**
 * Carga el detalle de un cliente (preparado para `GET /customers/{id}`).
 */
export function useCustomer(id) {
  const [state, setState] = useState({
    id: null,
    status: "loading",
    customer: null,
    error: null,
  });

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    getCustomer(id)
      .then((customer) => {
        if (!active) return;
        setState({ id, status: "success", customer, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          id,
          status: "error",
          customer: null,
          error: requestError?.message ?? "No pudimos cargar el cliente.",
        });
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Si cambia el id, la información anterior se descarta.
  const isCurrent = state.id === id;

  return {
    customer: isCurrent ? state.customer : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload: () => setState({ id: null, status: "loading", customer: null, error: null }),
    setCustomer: (customer) => setState({ id, status: "success", customer, error: null }),
  };
}
