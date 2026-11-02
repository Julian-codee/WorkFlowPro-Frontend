/**
 * API pública del módulo de autenticación.
 * Importa desde aquí para no acoplar las vistas a rutas internas del feature.
 */

export * from "./components";
export * from "./config";
export * from "./constants";
export { useLoginForm } from "./hooks/useLoginForm";
export { useProfileForm } from "./hooks/useProfileForm";
export { useRegisterForm } from "./hooks/useRegisterForm";
export { useSession } from "./hooks/useSession";
export {
  AuthError,
  login,
  loginWithProvider,
  register,
  requestPasswordReset,
} from "./services/authService";
export { updateProfile } from "./services/profileService";
export {
  EMAIL_PATTERN,
  PASSWORD_MIN_LENGTH,
  TENANT_SLUG_PATTERN,
  USERNAME_PATTERN,
  hasErrors,
  validateEmail,
  validateLoginForm,
  validatePassword,
  validatePasswordConfirmation,
  validateRegisterForm,
  validateTenantSlug,
  validateUsername,
} from "./services/validators";
