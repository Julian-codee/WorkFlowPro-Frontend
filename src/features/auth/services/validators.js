/**
 * Validadores de la vista de inicio de sesión y registro.
 *
 * Se mantienen fuera de los componentes visuales para poder reutilizarlos
 * (por ejemplo, en un registro futuro) y para testearlos de forma aislada.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,40}$/;
export const TENANT_SLUG_PATTERN = /^[a-z0-9-]{2,60}$/;

export function validateEmail(email) {
  const value = (email ?? "").trim();

  if (!value) {
    return "El correo electrónico es obligatorio.";
  }

  if (!EMAIL_PATTERN.test(value)) {
    return "Introduce un correo electrónico válido (nombre@empresa.com).";
  }

  return null;
}

export function validatePassword(password) {
  if (!password) {
    return "La contraseña es obligatoria.";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  return null;
}

export function validateUsername(username) {
  const value = (username ?? "").trim();

  if (!value) {
    return "El nombre de usuario es obligatorio.";
  }

  if (!USERNAME_PATTERN.test(value)) {
    return "Usa entre 3 y 40 caracteres: letras, números, punto, guion o guion bajo.";
  }

  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) {
    return "Confirma tu contraseña.";
  }

  if (password !== confirmation) {
    return "Las contraseñas no coinciden.";
  }

  return null;
}

export function validateTenantSlug(slug) {
  const value = (slug ?? "").trim();

  if (!value) return null;

  if (!TENANT_SLUG_PATTERN.test(value)) {
    return "Usa minúsculas, números y guiones (ej. mi-empresa).";
  }

  return null;
}

/**
 * Valida el formulario de inicio de sesión.
 * @returns {{ email: string|null, password: string|null }}
 */
export function validateLoginForm({ email, password } = {}) {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

/**
 * Valida el formulario de registro.
 */
export function validateRegisterForm(values = {}) {
  return {
    email: validateEmail(values.email),
    username: validateUsername(values.username),
    password: validatePassword(values.password),
    password_confirmation: validatePasswordConfirmation(
      values.password,
      values.password_confirmation,
    ),
    tenant_slug: validateTenantSlug(values.tenant_slug),
  };
}

export function hasErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}
