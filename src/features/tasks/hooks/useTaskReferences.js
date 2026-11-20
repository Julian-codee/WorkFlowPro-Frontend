"use client";

import { useCallback, useEffect, useState } from "react";

import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { listPaymentAccounts, listTaskCustomers } from "../services/taskService";

async function fetchTaskReferences() {
  const [customerResult, accountResult] = await Promise.allSettled([
    listTaskCustomers(),
    listPaymentAccounts(),
  ]);

  const customers = customerResult.status === "fulfilled" ? customerResult.value.items ?? [] : [];
  const accounts = accountResult.status === "fulfilled" ? accountResult.value.items ?? [] : [];
  const customersError =
    customerResult.status === "rejected"
      ? customerResult.reason?.message ?? "No pudimos cargar los clientes."
      : null;
  const accountsError =
    accountResult.status === "rejected"
      ? accountResult.reason?.message ?? "No pudimos cargar las cuentas financieras."
      : null;

  return {
    status: customersError && accountsError ? "error" : "success",
    customers,
    accounts,
    customersError,
    accountsError,
    error: customersError && accountsError ? customersError : null,
  };
}

/**
 * Catálogos de referencia necesarios para asociar clientes y recibir abonos.
 * Ambos recursos provienen de los endpoints reales del backend.
 */
export function useTaskReferences() {
  const [state, setState] = useState({
    status: "loading",
    customers: [],
    accounts: [],
    customersError: null,
    accountsError: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    fetchTaskReferences()
      .then((result) => {
        if (active) setState(result);
      })
      .catch((error) => {
        if (!active) return;
        setState({
          status: "error",
          customers: [],
          accounts: [],
          customersError: error?.message ?? "No pudimos cargar los datos auxiliares.",
          accountsError: null,
          error: error?.message ?? "No pudimos cargar los datos auxiliares.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(() => {
    fetchTaskReferences()
      .then((result) => setState(result))
      .catch((error) =>
        setState({
          status: "error",
          customers: [],
          accounts: [],
          customersError: error?.message ?? "No pudimos cargar los datos auxiliares.",
          accountsError: null,
          error: error?.message ?? "No pudimos cargar los datos auxiliares.",
        }),
      );
  }, []);

  useDataInvalidation("financials", reload);

  return {
    ...state,
    isLoading: state.status === "loading",
    reload,
  };
}
