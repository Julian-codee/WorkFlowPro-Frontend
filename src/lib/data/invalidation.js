/**
 * Invalidación local compartida entre dominios.
 *
 * FastAPI es la fuente de verdad; este canal local coordina cuándo deben
 * volver a consultar los hooks los datos afectados por una escritura.
 */

export const DATA_DOMAINS = Object.freeze({
  TASKS: "tasks",
  FINANCIALS: "financials",
});

const listeners = new Map();

/** Suscribe un callback al dominio indicado y devuelve la función de cleanup. */
export function subscribeDataInvalidation(domain, callback) {
  if (!domain || typeof callback !== "function") return () => {};

  const domainListeners = listeners.get(domain) ?? new Set();
  domainListeners.add(callback);
  listeners.set(domain, domainListeners);

  return () => {
    domainListeners.delete(callback);

    if (domainListeners.size === 0) {
      listeners.delete(domain);
    }
  };
}

/** Invalida uno o varios dominios en la misma transacción de UI. */
export function invalidateData(...domains) {
  const uniqueDomains = new Set(domains.filter(Boolean));

  for (const domain of uniqueDomains) {
    const domainListeners = listeners.get(domain);

    if (!domainListeners) continue;

    for (const listener of [...domainListeners]) {
      listener(domain);
    }
  }
}
