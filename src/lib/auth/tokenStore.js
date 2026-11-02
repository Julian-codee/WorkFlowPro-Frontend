/**
 * Almacén de tokens y sesión.
 *
 * Reglas de seguridad aplicadas:
 *  - El `access_token` vive SOLO en memoria: nunca se escribe en
 *    `localStorage`, `sessionStorage` ni cookies.
 *  - El `refresh_token` se guarda en `sessionStorage` únicamente si el usuario
 *    marca "Recordarme"; en caso contrario también vive solo en memoria.
 *  - `localStorage` no se usa en ningún momento.
 *
 * Cuando el backend evolucione a cookies `httpOnly`, este módulo se puede
 * sustituir sin tocar los componentes.
 */

const REFRESH_TOKEN_STORAGE_KEY = "workflowpro:refresh-token";

let state = {
  accessToken: null,
  refreshToken: null,
  user: null,
  expiresAt: null,
  persisted: false,
};

const listeners = new Set();

function readPersistedRefreshToken() {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePersistedRefreshToken(token) {
  if (typeof window === "undefined") return;

  try {
    if (token) {
      window.sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Modo privado / storage bloqueado: la sesión seguirá solo en memoria.
  }
}

function emit() {
  listeners.forEach((listener) => listener(getSession()));
}

export function getSession() {
  return { ...state };
}

export function getAccessToken() {
  return state.accessToken;
}

export function getRefreshToken() {
  return state.refreshToken;
}

export function getCurrentUser() {
  return state.user;
}

export function isAuthenticated() {
  return Boolean(state.accessToken);
}

/**
 * Guarda la sesión recibida del backend.
 *
 * @param {{ accessToken: string, refreshToken?: string, expiresIn?: number, user?: object }} tokens
 * @param {{ persist?: boolean }} [options] `persist` = "Recordarme" (sessionStorage).
 */
export function setSession(tokens = {}, { persist = false } = {}) {
  const { accessToken, refreshToken, expiresIn, user } = tokens;

  state = {
    accessToken: accessToken ?? null,
    refreshToken: refreshToken ?? state.refreshToken,
    user: user ?? state.user,
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
    persisted: persist && Boolean(refreshToken),
  };

  if (persist && refreshToken) {
    writePersistedRefreshToken(refreshToken);
  }

  emit();
}

/**
 * Restaura el refresh token persistido (al recargar la página).
 * El access token sigue siendo de memoria: se renueva vía `/auth/refresh`.
 */
export function restorePersistedSession() {
  const refreshToken = readPersistedRefreshToken();

  if (!refreshToken) return false;

  state = { ...state, refreshToken, persisted: true };
  emit();

  return true;
}

export function setCurrentUser(user) {
  state = { ...state, user };
  emit();
}

export function clearSession() {
  state = {
    accessToken: null,
    refreshToken: null,
    user: null,
    expiresAt: null,
    persisted: false,
  };

  writePersistedRefreshToken(null);
  emit();
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
