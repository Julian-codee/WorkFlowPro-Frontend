import { ProfileView } from "@/features/auth/components/ProfileView";

export const metadata = {
  title: "Mi perfil",
  description: "Actualiza los datos de tu cuenta de WorkFlowPro.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
