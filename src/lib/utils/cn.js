/**
 * Concatena clases ignorando valores falsy.
 * Utilidad mínima para no depender de librerías externas.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
