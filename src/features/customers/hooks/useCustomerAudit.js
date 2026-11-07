"use client";

import { useEffect, useState } from "react";

import { getCustomerAudit, getCustomerFinancial } from "../services/customerService";

/**
 * Historial de auditoría del cliente.
 * Consume `getCustomerAudit` (preparado para `GET /customers/{id}/audit`).
 */
export function useCustomerAudit(customerId) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    error: null,
  });

  useEffect(() => {
    if (!customerId) return undefined;

    let active = true;

    getCustomerAudit(customerId)
      .then((result) => {
        if (!active) return;
        setState({
          key: customerId,
          status: "success",
          items: result?.items ?? [],
          error: null,
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key: customerId,
          status: "error",
          items: [],
          error: requestError?.message ?? "No pudimos cargar el historial.",
        });
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  const isCurrent = state.key === customerId;

  return {
    entries: isCurrent ? state.items : [],
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
  };
}

/**
 * Resumen financiero del cliente.
 * Consume `getCustomerFinancial` (preparado para `GET /customers/{id}/financial`).
 */
export function useCustomerFinancial(customerId) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    financial: null,
    error: null,
  });

  useEffect(() => {
    if (!customerId) return undefined;

    let active = true;

    getCustomerFinancial(customerId)
      .then((financial) => {
        if (!active) return;
        setState({ key: customerId, status: "success", financial, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key: customerId,
          status: "error",
          financial: null,
          error: requestError?.message ?? "No pudimos cargar el resumen financiero.",
        });
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  const isCurrent = state.key === customerId;

  return {
    financial: isCurrent ? state.financial : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
  };
}
