/**
 * Catálogo de tipos, estados y tipos documentales de cliente.
 *
 * ⚠️ Los valores son una propuesta de UI: ajústalos al enum real del backend
 * (FastAPI) cuando conectes los endpoints de /customers.
 */

export const CUSTOMER_TYPES = {
  NATURAL: "natural",
  LEGAL: "legal",
};

export const CUSTOMER_TYPE_LIST = [
  { value: CUSTOMER_TYPES.NATURAL, label: "Persona natural", shortLabel: "Natural", tone: "info" },
  { value: CUSTOMER_TYPES.LEGAL, label: "Persona jurídica", shortLabel: "Jurídica", tone: "purple" },
];

export const CUSTOMER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

export const CUSTOMER_STATUS_LIST = [
  { value: CUSTOMER_STATUSES.ACTIVE, label: "Activo", tone: "success" },
  { value: CUSTOMER_STATUSES.INACTIVE, label: "Inactivo", tone: "warning" },
  { value: CUSTOMER_STATUSES.ARCHIVED, label: "Archivado", tone: "neutral" },
];

/** Tipos documentales soportados por el formulario. */
export const DOCUMENT_TYPES = {
  DNI: "dni",
  CE: "ce",
  PASSPORT: "passport",
  NIT: "nit",
  RUC: "ruc",
  OTHER: "other",
};

export const DOCUMENT_TYPE_LIST = [
  { value: DOCUMENT_TYPES.DNI, label: "DNI / Documento de identidad" },
  { value: DOCUMENT_TYPES.CE, label: "Cédula de extranjería" },
  { value: DOCUMENT_TYPES.PASSPORT, label: "Pasaporte" },
  { value: DOCUMENT_TYPES.NIT, label: "NIT" },
  { value: DOCUMENT_TYPES.RUC, label: "RUC" },
  { value: DOCUMENT_TYPES.OTHER, label: "Otro documento" },
];

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPE_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const CUSTOMER_TYPE_OPTIONS = CUSTOMER_TYPE_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const CUSTOMER_STATUS_OPTIONS = CUSTOMER_STATUS_LIST.map((item) => ({
  value: item.value,
  label: item.label,
}));

/** Etiqueta legible a partir del valor recibido del backend. */
export function getTypeMeta(value) {
  return (
    CUSTOMER_TYPE_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin tipo",
      shortLabel: value ?? "—",
      tone: "neutral",
    }
  );
}

export function getStatusMeta(value) {
  return (
    CUSTOMER_STATUS_LIST.find((item) => item.value === value) ?? {
      value,
      label: value ?? "Sin estado",
      tone: "neutral",
    }
  );
}

export function getDocumentTypeMeta(value) {
  return DOCUMENT_TYPE_LIST.find((item) => item.value === value) ?? { value, label: value ?? "—" };
}

/**
 * Nombre principal de un cliente según su tipo.
 * Persona natural → nombre + apellidos; Persona jurídica → razón social.
 */
export function getCustomerDisplayName(customer) {
  if (!customer) return "Cliente";

  if (customer.type === CUSTOMER_TYPES.LEGAL) {
    return customer.business_name || customer.legal_name || "Persona jurídica";
  }

  return [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Persona natural";
}

/** Iniciales para el avatar. */
export function getCustomerInitials(customer) {
  const name = getCustomerDisplayName(customer);

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "CL"
  );
}
