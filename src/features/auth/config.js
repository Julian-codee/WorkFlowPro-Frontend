/**
 * Configuración del módulo de autenticación.
 *
 * `NEXT_PUBLIC_AUTH_MODE`:
 *   "mock" → la vista usa datos ficticios (por defecto, para trabajar la UI).
 *   "api"  → la vista llama a la API real (POST /auth/login, /auth/register…).
 *
 * Cuando conectes los endpoints, cambia el valor en `.env.local` a "api".
 */

export const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE?.trim() || "mock";

export const IS_API_MODE = AUTH_MODE === "api";

/** Ruta a la que se navega tras un login correcto. */
export const POST_LOGIN_PATH = process.env.NEXT_PUBLIC_POST_LOGIN_PATH?.trim() || "/dashboard";

/** Credenciales de la cuenta de demostración del entorno de desarrollo. */
export const DEMO_CREDENTIALS = IS_API_MODE
  ? { email: "admin@default.com", password: "password" }
  : { email: "demo@workflowpro.com", password: "Demo1234" };

/** Texto del aviso visible cuando la autenticación está simulada. */
export const SIMULATION_NOTICE =
  "Autenticación simulada · pendiente de conectar con FastAPI.";
