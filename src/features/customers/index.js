/**
 * API pública del módulo de clientes.
 */

export * from "./components";
export * from "./constants";
export { useCustomer } from "./hooks/useCustomer";
export { useCustomerAudit, useCustomerFinancial } from "./hooks/useCustomerAudit";
export { useCustomerForm } from "./hooks/useCustomerForm";
export { useCustomerNotes } from "./hooks/useCustomerNotes";
export { useCustomers } from "./hooks/useCustomers";
export { useDuplicates } from "./hooks/useDuplicates";
export {
  addCustomerNote,
  archiveCustomer,
  checkDuplicates,
  createCustomer,
  createLegalCustomer,
  createNaturalCustomer,
  deleteCustomerNote,
  getCustomer,
  getCustomerAudit,
  getCustomerFinancial,
  getCustomerFull,
  listCustomerNotes,
  listCustomers,
  reactivateCustomer,
  resetMockCustomers,
  updateCustomer,
  updateCustomerNote,
  updateCustomerStatus,
} from "./services/customerService";
export {
  hasCustomerErrors,
  validateCustomerForm,
  validateNoteContent,
} from "./services/validators";
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelative,
} from "./utils/format";
