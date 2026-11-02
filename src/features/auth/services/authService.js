/**
 * Servicio de autenticación de WorkFlowPro.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  MODO PREDETERMINADO: "mock" (datos ficticios, sin llamadas HTTP).
 *
 * El modo se controla con `NEXT_PUBLIC_AUTH_MODE`:
 *   - "mock" → no se consume ningún endpoint (ideal para trabajar la UI).
 *   - "api"  → se llama al backend real de FastAPI.
 *
 * En ambos modos la firma de las funciones es idéntica, de forma que activar
 * la integración no obliga a tocar componentes, hooks ni pantallas.
 *
 * Contrato del backend (prefijo /api/v1):
 *   POST /auth/login     { email, password }  → { access_token, refresh_token, expires_in }
 *   POST /auth/register  { email, username, password, tenant_slug? } → tokens (201)
 *   POST /auth/refresh   { refresh_token }    → tokens
 *   GET  /auth/me                              → usuario
 *   PATCH /auth/me                             → usuario actualizado
 *   POST /auth/logout                          → cierre de sesión
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { post } from "@/lib/api";
import { loginWithCredentials, registerAccount } from "@/lib/auth/session";

import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES } from "../constants";
import { IS_API_MODE } from "../config";

/**
 * Error de negocio del módulo de autenticación (diferente de un error HTTP).
 */
export class AuthError extends Error {
  constructor(message, { code = AUTH_ERROR_CODES.UNKNOWN, status = 0 } = {}) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Cuenta ficticia usada en modo mock (no representa ningún usuario real).
 */
const DEMO_USER = {
  id: "usr_demo_001",
  email: "demo@workflowpro.com",
  password: "Demo1234",
  name: "Ana Morales",
  role: "Product Manager",
};

const SIMULATED_LATENCY_MS = 900;

/** Espera simulada para representar la latencia de una API real. */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Traduce los errores de la API a mensajes presentables para el usuario.
 */
function toAuthError(error) {
  if (error instanceof AuthError) return error;

  const status = error?.status ?? 0;
  const detail = error?.message ?? "";

  if (status === 401) {
    return new AuthError(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS], {
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      status,
    });
  }

  if (status === 409 || status === 400) {
    return new AuthError(detail || "El email o el usuario ya están registrados.", {
      code: AUTH_ERROR_CODES.UNKNOWN,
      status,
    });
  }

  if (status === 422) {
    return new AuthError(detail || "Revisa los datos introducidos.", {
      code: AUTH_ERROR_CODES.UNKNOWN,
      status,
    });
  }

  return new AuthError(detail || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN], {
    code: AUTH_ERROR_CODES.UNKNOWN,
    status,
  });
}

/**
 * Inicia sesión con correo y contraseña.
 *
 * @param {{ email: string, password: string, rememberMe?: boolean }} credentials
 * @returns {Promise<{ user: object|null, session: object|null }>}
 */
export async function login(credentials) {
  const { email, password, rememberMe = false } = credentials;

  if (IS_API_MODE) {
    try {
      const session = await loginWithCredentials({ email, password, rememberMe });
      return { user: null, session };
    } catch (error) {
      throw toAuthError(error);
    }
  }

  // ── Modo mock ────────────────────────────────────────────────────────────
  await delay(SIMULATED_LATENCY_MS);

  const isValid =
    email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password;

  if (!isValid) {
    throw new AuthError(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS], {
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    });
  }

  return {
    user: {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      role: DEMO_USER.role,
    },
    session: {
      provider: "password",
      expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60,
      simulated: true,
    },
  };
}

/**
 * Registra una cuenta nueva.
 *
 * @param {{ email: string, username: string, password: string, tenant_slug?: string }} payload
 */
export async function register(payload) {
  if (IS_API_MODE) {
    try {
      // El backend responde 201 con los tokens y el usuario creado.
      const { session, user } = await registerAccount(payload);
      return { user, session };
    } catch (error) {
      throw toAuthError(error);
    }
  }

  // ── Modo mock ────────────────────────────────────────────────────────────
  await delay(SIMULATED_LATENCY_MS);

  return {
    user: {
      id: "usr_mock_new",
      name: payload.username,
      email: payload.email,
      role: "Miembro",
    },
    session: { provider: "password", expiresIn: 60 * 60, simulated: true },
  };
}

/**
 * Inicia sesión con un proveedor externo (Google).
 *
 * El backend todavía no expone un endpoint OAuth, por lo que se informa
 * con claridad en lugar de inventar una ruta.
 */
export async function loginWithProvider(provider = "google") {
  if (IS_API_MODE) {
    throw new AuthError(
      "El acceso con Google todavía no está disponible en el backend. Puedes iniciar sesión con correo y contraseña.",
      { code: AUTH_ERROR_CODES.UNKNOWN },
    );
  }

  // ── Modo mock ────────────────────────────────────────────────────────────
  await delay(SIMULATED_LATENCY_MS);

  return {
    user: {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      role: DEMO_USER.role,
    },
    session: { provider, expiresIn: 60 * 60, simulated: true },
  };
}

/**
 * Solicita el envío de un correo de recuperación de contraseña.
 *
 * El backend no expone todavía este endpoint.
 */
export async function requestPasswordReset(email) {
  if (IS_API_MODE) {
    throw new AuthError(
      "La recuperación de contraseña todavía no está habilitada en el backend.",
      { code: AUTH_ERROR_CODES.UNKNOWN },
    );
  }

  // ── Modo mock ────────────────────────────────────────────────────────────
  await delay(600);

  return { email, sent: true, simulated: true };
}
