/**
 * Servicio de perfil de usuario.
 *
 * ⚠️ Modo predeterminado: "mock" (no consume endpoints).
 * El modo se controla con `NEXT_PUBLIC_AUTH_MODE`.
 *
 * Contrato del backend:
 *   GET   /auth/me  → usuario actual
 *   PATCH /auth/me  → actualiza el perfil (full_name, avatar_url…)
 */

import { patch } from "@/lib/api";

import { IS_API_MODE } from "../config";

/**
 * Actualiza los datos de perfil del usuario autenticado.
 *
 * @param {{ full_name?: string, username?: string, avatar_url?: string }} payload
 */
export async function updateProfile(payload) {
  if (IS_API_MODE) {
    return patch("/auth/me", payload);
  }

  // ── Modo mock ────────────────────────────────────────────────────────────
  await new Promise((resolve) => setTimeout(resolve, 600));

  return { ...payload, updated_at: new Date().toISOString() };
}
