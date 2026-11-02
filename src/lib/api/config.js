/**
 * Configuración de la capa HTTP.
 *
 * La URL base incluye el prefijo de la API (`/api/v1` en el backend de
 * FastAPI). Se configura por variable de entorno para poder apuntar a
 * desarrollo, staging o producción sin tocar el código.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8000/api/v1";

export const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Origen del frontend, útil para los mensajes de diagnóstico (CORS).
 */
export const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
