/**
 * Errores de la capa de comunicación HTTP.
 *
 * Se mantienen aquí para que los servicios (incluido el de autenticación)
 * puedan diferenciar entre:
 *  - error de red / timeout,
 *  - error de validación devuelto por la API,
 *  - error de autenticación (credenciales incorrectas, token expirado...).
 *
 * Este módulo no conoce reglas de negocio: solo normaliza la respuesta HTTP.
 */

export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  ABORTED: "ABORTED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

export class ApiError extends Error {
  constructor(message, { status = 0, code = API_ERROR_CODES.UNKNOWN_ERROR, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Traduce un código HTTP a un código de error de la aplicación.
 */
export function codeFromStatus(status) {
  if (status === 401) return API_ERROR_CODES.UNAUTHORIZED;
  if (status === 403) return API_ERROR_CODES.FORBIDDEN;
  if (status === 404) return API_ERROR_CODES.NOT_FOUND;
  if (status === 429) return API_ERROR_CODES.RATE_LIMITED;
  if (status === 422 || status === 400) return API_ERROR_CODES.VALIDATION_ERROR;
  if (status >= 500) return API_ERROR_CODES.SERVER_ERROR;
  return API_ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Mensaje por defecto para errores que no traen detalle del backend.
 */
export function defaultMessageForStatus(status) {
  switch (status) {
    case 401:
      return "Las credenciales no son correctas.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no existe.";
    case 422:
    case 400:
      return "Los datos enviados no son válidos.";
    default:
      return status >= 500
        ? "El servicio no está disponible en este momento. Inténtalo de nuevo."
        : "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}
