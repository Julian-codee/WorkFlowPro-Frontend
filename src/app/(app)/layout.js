import { AppShell } from "@/components/layout";

/**
 * Layout de la zona autenticada (sidebar + topbar + contenido).
 */
export default function AuthenticatedLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
