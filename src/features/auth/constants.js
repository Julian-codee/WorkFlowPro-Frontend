/**
 * Constantes del módulo de autenticación.
 */

export const AUTH_PROVIDERS = {
  GOOGLE: "google",
};

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  RATE_LIMITED: "RATE_LIMITED",
  UNKNOWN: "UNKNOWN",
};

/**
 * Mensajes de error mostrados al usuario final.
 */
export const AUTH_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
    "Las credenciales no son correctas. Revisa tu correo y tu contraseña.",
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]:
    "Tu cuenta está bloqueada temporalmente. Contacta con soporte para recibir ayuda.",
  [AUTH_ERROR_CODES.RATE_LIMITED]:
    "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.",
  [AUTH_ERROR_CODES.UNKNOWN]:
    "No pudimos iniciar tu sesión. Inténtalo de nuevo en unos momentos.",
};

/**
 * Etiquetas de los estados del formulario.
 */
export const AUTH_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};
