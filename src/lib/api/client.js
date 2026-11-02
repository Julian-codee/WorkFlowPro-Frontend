/**
 * Cliente HTTP centralizado de WorkFlowPro.
 *
 * Responsabilidades:
 *  - aplicar la URL base del backend (variable `NEXT_PUBLIC_API_URL`),
 *  - serializar/deserializar JSON y query params,
 *  - añadir el header `Authorization: Bearer <access_token>` cuando hay sesión,
 *  - renovar el access token ante un 401 y reintentar la petición una vez,
 *  - normalizar errores (red, timeout, errores HTTP) en `ApiError`.
 *
 * Nota: este archivo NO define endpoints. Cada feature indica la ruta que
 * necesita, de modo que conectar FastAPI no obligue a tocar la capa de red.
 */

import { getAccessToken } from "@/lib/auth/tokenStore";

import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from "./config";
import {
  API_ERROR_CODES,
  ApiError,
  codeFromStatus,
  defaultMessageForStatus,
  isApiError,
} from "./errors";

/**
 * Handler de renovación de token. Lo registra `lib/auth/session.js`.
 * Se mantiene como callback para evitar dependencias circulares.
 */
let tokenRefreshHandler = null;

/**
 * Registra la función que renueva el access token.
 * @param {(() => Promise<string|null>) | null} handler
 */
export function setTokenRefreshHandler(handler) {
  tokenRefreshHandler = handler;
}

/**
 * Une la URL base con la ruta del recurso evitando dobles barras.
 */
export function buildUrl(baseUrl, path) {
  const base = (baseUrl ?? "").replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/**
 * Construye la query string ignorando valores vacíos.
 */
export function buildQuery(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Extrae el mensaje de error devuelto por FastAPI.
 * FastAPI suele responder `{ "detail": ... }` o `{ "detail": [{ "msg": ... }] }`.
 */
export function extractApiMessage(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const first = payload.detail[0];
    if (typeof first === "string") return first;
    if (first && typeof first.msg === "string") return first.msg;
  }
  if (typeof payload.message === "string") return payload.message;
  return null;
}

/**
 * Ejecuta una petición HTTP y normaliza el resultado.
 *
 * @param {string} path Ruta del recurso (ej. "/auth/login").
 * @param {object} [options]
 * @param {string} [options.method] Verbo HTTP, por defecto "GET".
 * @param {unknown} [options.body] Cuerpo serializable a JSON.
 * @param {Record<string, unknown>} [options.query] Parámetros de query.
 * @param {Record<string,string>} [options.headers] Cabeceras adicionales.
 * @param {AbortSignal} [options.signal] Cancelación externa.
 * @param {number} [options.timeout] Tiempo máximo de espera en ms.
 * @param {boolean} [options.skipAuth] Omite la cabecera Authorization.
 * @param {boolean} [options.skipRefresh] No intenta renovar el token ante un 401.
 * @param {string} [options.baseUrl] Sobrescribe la URL base.
 * @returns {Promise<unknown>} cuerpo de la respuesta ya parseado.
 */
export async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    query,
    headers = {},
    signal,
    timeout = DEFAULT_TIMEOUT_MS,
    skipAuth = false,
    skipRefresh = false,
    baseUrl = API_BASE_URL,
  } = options;

  const controller = new AbortController();
  const timeoutId =
    timeout > 0
      ? setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), timeout)
      : null;

  const onExternalAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) onExternalAbort();
    else signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const accessToken = skipAuth ? null : getAccessToken();

  const requestHeaders = {
    Accept: "application/json",
    ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  };

  const url = `${buildUrl(baseUrl, path)}${buildQuery(query)}`;

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: controller.signal,
      // El backend de FastAPI usa tokens en header, no cookies.
      credentials: "omit",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : await response.text();

    if (!response.ok) {
      // 401 → se intenta renovar el token y reintentar una única vez.
      if (response.status === 401 && !skipRefresh && tokenRefreshHandler) {
        const renewed = await tokenRefreshHandler();

        if (renewed) {
          return request(path, { ...options, skipRefresh: true });
        }
      }

      throw new ApiError(extractApiMessage(payload) ?? defaultMessageForStatus(response.status), {
        status: response.status,
        code: codeFromStatus(response.status),
        details: payload,
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error?.name === "TimeoutError") {
      throw new ApiError("La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.", {
        code: API_ERROR_CODES.TIMEOUT,
      });
    }

    if (error?.name === "AbortError") {
      throw new ApiError("La solicitud fue cancelada.", { code: API_ERROR_CODES.ABORTED });
    }

    throw new ApiError(
      "No pudimos conectar con el servidor. Comprueba que el backend esté levantado y que CORS permita este origen.",
      { code: API_ERROR_CODES.NETWORK_ERROR },
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", onExternalAbort);
  }
}

export const get = (path, options) => request(path, { ...options, method: "GET" });
export const post = (path, body, options) => request(path, { ...options, method: "POST", body });
export const put = (path, body, options) => request(path, { ...options, method: "PUT", body });
export const patch = (path, body, options) => request(path, { ...options, method: "PATCH", body });
export const del = (path, options) => request(path, { ...options, method: "DELETE" });

export { API_ERROR_CODES, ApiError, isApiError };
