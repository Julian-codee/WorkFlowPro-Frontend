"use client";

import { useEffect } from "react";

import { subscribeDataInvalidation } from "./invalidation";

/** Ejecuta un callback cuando el dominio recibe una invalidación. */
export function useDataInvalidation(domain, callback) {
  useEffect(() => {
    if (!domain || typeof callback !== "function") return undefined;

    return subscribeDataInvalidation(domain, callback);
  }, [callback, domain]);
}
