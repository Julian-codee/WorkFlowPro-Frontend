/**
 * Validadores del formulario de clientes (alta y edición).
 *
 * Se mantienen fuera de los componentes visuales para poder reutilizarlos y
 * testearlos de forma aislada.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_PATTERN = /^[+0-9\s().-]{7,20}$/;
export const URL_PATTERN = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;

export const CUSTOMER_NAME_MIN_LENGTH = 2;
export const CUSTOMER_NAME_MAX_LENGTH = 120;
export const DOCUMENT_NUMBER_MIN_LENGTH = 4;
export const DOCUMENT_NUMBER_MAX_LENGTH = 32;
export const NOTE_MAX_LENGTH = 1000;

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

export function validateRequired(value, message) {
  return isBlank(value) ? message : null;
}

export function validateFirstName(value) {
  if (isBlank(value)) return "El nombre es obligatorio.";

  const name = String(value).trim();

  if (name.length < CUSTOMER_NAME_MIN_LENGTH) {
    return `El nombre debe tener al menos ${CUSTOMER_NAME_MIN_LENGTH} caracteres.`;
  }

  if (name.length > CUSTOMER_NAME_MAX_LENGTH) {
    return `El nombre no puede superar ${CUSTOMER_NAME_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateLastName(value) {
  if (isBlank(value)) return "El apellido es obligatorio.";

  const name = String(value).trim();

  if (name.length < CUSTOMER_NAME_MIN_LENGTH) {
    return `El apellido debe tener al menos ${CUSTOMER_NAME_MIN_LENGTH} caracteres.`;
  }

  if (name.length > CUSTOMER_NAME_MAX_LENGTH) {
    return `El apellido no puede superar ${CUSTOMER_NAME_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateBusinessName(value) {
  if (isBlank(value)) return "La razón social es obligatoria.";

  const name = String(value).trim();

  if (name.length < CUSTOMER_NAME_MIN_LENGTH) {
    return `La razón social debe tener al menos ${CUSTOMER_NAME_MIN_LENGTH} caracteres.`;
  }

  if (name.length > CUSTOMER_NAME_MAX_LENGTH) {
    return `La razón social no puede superar ${CUSTOMER_NAME_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateDocumentNumber(value) {
  if (isBlank(value)) return "El número de documento es obligatorio.";

  const number = String(value).trim();

  if (number.length < DOCUMENT_NUMBER_MIN_LENGTH) {
    return `El documento debe tener al menos ${DOCUMENT_NUMBER_MIN_LENGTH} caracteres.`;
  }

  if (number.length > DOCUMENT_NUMBER_MAX_LENGTH) {
    return `El documento no puede superar ${DOCUMENT_NUMBER_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateEmail(value, { optional = false } = {}) {
  if (isBlank(value)) {
    return optional ? null : "El correo electrónico es obligatorio.";
  }

  if (!EMAIL_PATTERN.test(String(value).trim())) {
    return "Introduce un correo electrónico válido (nombre@empresa.com).";
  }

  return null;
}

export function validatePhone(value, { optional = false } = {}) {
  if (isBlank(value)) {
    return optional ? null : "El teléfono es obligatorio.";
  }

  if (!PHONE_PATTERN.test(String(value).trim())) {
    return "Introduce un teléfono válido (solo dígitos, espacios y +).";
  }

  return null;
}

export function validateWebsite(value) {
  if (isBlank(value)) return null;

  if (!URL_PATTERN.test(String(value).trim())) {
    return "Introduce una URL válida (https://empresa.com).";
  }

  return null;
}

export function validateBirthDate(value) {
  if (isBlank(value)) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Introduce una fecha válida.";
  }

  if (date.getTime() > Date.now()) {
    return "La fecha no puede ser futura.";
  }

  return null;
}

export function validateNoteContent(value) {
  if (isBlank(value)) return "La nota no puede estar vacía.";

  if (String(value).trim().length > NOTE_MAX_LENGTH) {
    return `La nota no puede superar ${NOTE_MAX_LENGTH} caracteres.`;
  }

  return null;
}

/**
 * Valida el formulario completo de cliente.
 * El tipo de cliente determina qué campos son obligatorios.
 *
 * @param {{ type?: string }} values
 * @returns {Record<string, string|null>}
 */
export function validateCustomerForm(values = {}) {
  const type = values.type ?? "natural";

  const common = {
    document_type: validateRequired(values.document_type, "Selecciona un tipo de documento."),
    document_number: validateDocumentNumber(values.document_number),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    address: validateRequired(values.address, "La dirección es obligatoria."),
    city: validateRequired(values.city, "La ciudad es obligatoria."),
    country: validateRequired(values.country, "El país es obligatorio."),
    website: validateWebsite(values.website),
  };

  if (type === "legal") {
    return {
      ...common,
      business_name: validateBusinessName(values.business_name),
      legal_name: validateBusinessName(values.legal_name),
      tax_id: validateRequired(values.tax_id, "El identificador fiscal es obligatorio."),
      industry: validateRequired(values.industry, "El sector o industria es obligatorio."),
      incorporation_date: validateBirthDate(values.incorporation_date),
      contact_name: validateRequired(values.contact_name, "El nombre del contacto es obligatorio."),
      contact_email: validateEmail(values.contact_email, { optional: true }),
      contact_phone: validatePhone(values.contact_phone, { optional: true }),
    };
  }

  return {
    ...common,
    first_name: validateFirstName(values.first_name),
    last_name: validateLastName(values.last_name),
    birth_date: validateBirthDate(values.birth_date),
  };
}

export function hasCustomerErrors(errors = {}) {
  return Object.values(errors).some(Boolean);
}
