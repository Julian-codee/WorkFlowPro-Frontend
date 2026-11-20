"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addQuotationItem,
  deleteQuotationItem,
  getQuotation,
  updateQuotationItem,
} from "../services/quotationService";

/**
 * Líneas (ítems) de una cotización existente.
 *
 * Consume:
 *   POST   /quotations/{id}/items
 *   PATCH  /quotations/{id}/items/{item_id}
 *   DELETE /quotations/{id}/items/{item_id}
 */
export function useQuotationItems(quotationId, { onQuotationChange } = {}) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    error: null,
  });

  const [isMutating, setIsMutating] = useState(false);

  /** Registra el error de una mutación conservando los ítems ya cargados. */
  const setErrorState = useCallback((requestError) => {
    setState((current) => ({
      ...current,
      key: quotationId,
      status: current.status === "success" ? "success" : "error",
      error: requestError?.message ?? "No pudimos completar la operación.",
    }));
  }, [quotationId]);

  const syncQuotation = useCallback(async () => {
    if (!quotationId) return null;

    try {
      const quotation = await getQuotation(quotationId);
      setState((current) => ({
        ...current,
        key: quotationId,
        status: "success",
        items: quotation.items ?? [],
        error: null,
      }));
      onQuotationChange?.(quotation);
      return quotation;
    } catch {
      return null;
    }
  }, [onQuotationChange, quotationId]);

  useEffect(() => {
    if (!quotationId) return undefined;

    let active = true;

    getQuotation(quotationId)
      .then((quotation) => {
        if (!active) return;
        setState({
          key: quotationId,
          status: "success",
          items: quotation.items ?? [],
          error: null,
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key: quotationId,
          status: "error",
          items: [],
          error: requestError?.message ?? "No pudimos cargar las líneas.",
        });
      });

    return () => {
      active = false;
    };
  }, [quotationId]);

  const addItem = useCallback(
    async (payload) => {
      setIsMutating(true);

      try {
        const item = await addQuotationItem(quotationId, payload);
        await syncQuotation();
        return item;
      } catch (requestError) {
        setErrorState(requestError);
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [quotationId, setErrorState, syncQuotation],
  );

  const updateItem = useCallback(
    async (itemId, payload) => {
      setIsMutating(true);

      try {
        const item = await updateQuotationItem(quotationId, itemId, payload);
        await syncQuotation();
        return item;
      } catch (requestError) {
        setErrorState(requestError);
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [quotationId, setErrorState, syncQuotation],
  );

  const removeItem = useCallback(
    async (itemId) => {
      setIsMutating(true);

      try {
        await deleteQuotationItem(quotationId, itemId);
        await syncQuotation();
        return true;
      } catch (requestError) {
        setErrorState(requestError);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [quotationId, setErrorState, syncQuotation],
  );

  const isCurrent = state.key === quotationId;

  return {
    items: isCurrent ? state.items : [],
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    isMutating,
    addItem,
    updateItem,
    removeItem,
    reload: syncQuotation,
  };
}
