/**
 * Gestión de sesión de WorkFlowPro.
 *
 * Flujo completo (ya preparado para el backend de FastAPI):
 *
 *   login  → POST /auth/login    → { access_token, refresh_token, expires_in }
 *   /me    → GET  /auth/me       → datos del usuario (con Bearer)
 *   refresh→ POST /auth/refresh  → nuevo access_token (usado por el interceptor 401)
 *   logout → POST /auth/logout   + limpieza local de tokens
 *
 * Los tokens nunca se guardan en `localStorage`:
 *  - access_token  → solo en memoria,
 *  - refresh_token → en memoria y, si el usuario marca "Recordarme",
 *                    en `sessionStorage` (se borra al cerrar la pestaña).
 */

import { get, post, setTokenRefreshHandler } from "@/lib/api";

import {
  clearSession,
  getRefreshToken,
  restorePersistedSession,
  setCurrentUser,
  setSession,
} from "./tokenStore";

/** Evita renovaciones simultáneas del mismo token. */
let refreshPromise = null;

/**
 * Transforma la respuesta de tokens en el formato interno de sesión.
 */
function toSessionPayload(payload = {}) {
  return {
    accessToken: payload.access_token ?? payload.accessToken ?? null,
    refreshToken: payload.refresh_token ?? payload.refreshToken ?? null,
    expiresIn: payload.expires_in ?? payload.expiresIn ?? null,
    tokenType: payload.token_type ?? payload.tokenType ?? "bearer",
  };
}

/**
 * Inicia sesión contra el backend.
 *
 * @param {{ email: string, password: string, rememberMe?: boolean }} credentials
 */
export async function loginWithCredentials({ email, password, rememberMe = false }) {
  const payload = await post("/auth/login", { email, password }, { skipAuth: true });

  const session = toSessionPayload(payload);

  setSession(session, { persist: rememberMe });

  return session;
}

/**
 * Registra una cuenta nueva (POST /auth/register).
 *
 * @param {{ email: string, username: string, password: string, tenant_slug?: string }} payload
 */
export async function registerAccount(payload) {
  const response = await post("/auth/register", payload, { skipAuth: true, skipRefresh: true });

  const session = toSessionPayload(response);

  setSession(session, { persist: false });

  return { session, user: response?.user ?? null };
}

/**
 * Renueva el access token usando el refresh token.
 * @returns {Promise<string|null>} nuevo access token o null si no es posible.
 */
export async function refreshSession() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) return null;

    try {
      const payload = await post("/auth/refresh", { refresh_token: refreshToken }, {
        skipAuth: true,
        skipRefresh: true,
      });

      const session = toSessionPayload(payload);

      setSession(session, { persist: true });

      return session.accessToken;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Obtiene el usuario autenticado (GET /auth/me).
 */
export async function fetchCurrentUser() {
  const user = await get("/auth/me");
  setCurrentUser(user);
  return user;
}

/**
 * Cierra sesión: avisa al backend y limpia los tokens locales.
 */
export async function logout() {
  try {
    await post("/auth/logout", {}, { skipRefresh: true });
  } catch {
    // Si el backend falla, la sesión local se limpia igualmente.
  } finally {
    clearSession();
  }
}

/**
 * Restaura una sesión persistida (tras recargar la página) renovando el
 * access token con el refresh token guardado.
 *
 * @returns {Promise<object|null>} usuario autenticado o null.
 */
export async function restoreSession() {
  if (!restorePersistedSession()) return null;

  const token = await refreshSession();
  if (!token) return null;

  try {
    return await fetchCurrentUser();
  } catch {
    return null;
  }
}

// El cliente HTTP usa este handler para renovar el token ante un 401.
setTokenRefreshHandler(refreshSession);
