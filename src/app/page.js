import { redirect } from "next/navigation";

/**
 * Punto de entrada de la aplicación.
 * Redirige al dashboard (zona autenticada) o al login según la sesión.
 */
export default function Home() {
  redirect("/dashboard");
}
