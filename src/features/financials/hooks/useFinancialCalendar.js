"use client";

import { useCallback, useEffect, useState } from "react";

import { DATA_DOMAINS } from "@/lib/data/invalidation";
import { useDataInvalidation } from "@/lib/data/useDataInvalidation";

import { getFinancialCalendar } from "../services/financialService";

/**
 * Calendario financiero del mes.
 *
 * Consume `GET /financial/calendar/{year}/{month}`.
 */
export function useFinancialCalendar(year, month) {
  const [state, setState] = useState({
    key: null,
    status: "loading",
    calendar: null,
    error: null,
  });

  const key = `${year}-${month}`;

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    getFinancialCalendar(year, month)
      .then((calendar) => {
        if (!active) return;
        setState({ key, status: "success", calendar, error: null });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          key,
          status: "error",
          calendar: null,
          error: requestError?.message ?? "No pudimos cargar el calendario.",
        });
      });

    return () => {
      active = false;
    };
  }, [key, month, year, reloadToken]);

  const isCurrent = state.key === key;

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useDataInvalidation(DATA_DOMAINS.FINANCIALS, reload);

  return {
    calendar: isCurrent ? state.calendar : null,
    totals: isCurrent ? state.calendar?.totals : null,
    status: isCurrent ? state.status : "loading",
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent || state.status === "loading",
    reload,
  };
}
