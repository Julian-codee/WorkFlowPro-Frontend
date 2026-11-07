import { ProfileView } from "@/features/auth/components/ProfileView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Mi perfil",
  description: "Actualiza los datos de tu cuenta de WorkFlowPro.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
