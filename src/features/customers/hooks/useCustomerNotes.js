"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addCustomerNote,
  deleteCustomerNote,
  listCustomerNotes,
  updateCustomerNote,
} from "../services/customerService";

/**
 * Notas internas de un cliente.
 *
 * Consume `listCustomerNotes` (preparado para `GET /customers/{id}/notes`).
 */
export function useCustomerNotes(customerId) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    items: [],
    error: null,
  });

  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    if (!customerId) return undefined;

    let active = true;

    listCustomerNotes(customerId)
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
          error: requestError?.message ?? "No pudimos cargar las notas.",
        });
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  const addNote = useCallback(
    async (content) => {
      if (!customerId) return null;

      setMutating(true);

      try {
        const note = await addCustomerNote(customerId, { content });
        setState((current) => ({
          ...current,
          items: current.key === customerId ? [note, ...current.items] : current.items,
        }));
        return note;
      } finally {
        setMutating(false);
      }
    },
    [customerId],
  );

  const updateNote = useCallback(
    async (noteId, content) => {
      if (!customerId) return null;

      setMutating(true);

      try {
        const note = await updateCustomerNote(customerId, noteId, { content });
        setState((current) => ({
          ...current,
          items: current.items.map((item) => (item.id === noteId ? note : item)),
        }));
        return note;
      } finally {
        setMutating(false);
      }
    },
    [customerId],
  );

  const removeNote = useCallback(
    async (noteId) => {
      if (!customerId) return false;

      setMutating(true);

      try {
        await deleteCustomerNote(customerId, noteId);
        setState((current) => ({
          ...current,
          items: current.items.filter((item) => item.id !== noteId),
        }));
        return true;
      } finally {
        setMutating(false);
      }
    },
    [customerId],
  );

  const reload = useCallback(() => {
    setState({ key: null, status: "loading", items: [], error: null });
  }, []);

  const isCurrent = state.key === customerId;

  return {
    notes: isCurrent ? state.items : [],
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    isMutating: mutating,
    addNote,
    updateNote,
    removeNote,
    reload,
  };
}
