import { AppShell } from "@/components/layout";

/**
 * La zona autenticada depende de datos de sesión y de `usePathname()`,
 * por lo que se renderiza en tiempo de cliente (bloqueante) en lugar de
 * prerenderizarse como shell estático (Cache Components / `instant`).
 */
export const instant = false;

/**
 * Layout de la zona autenticada (sidebar + topbar + contenido).
 */
export default function AuthenticatedLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
