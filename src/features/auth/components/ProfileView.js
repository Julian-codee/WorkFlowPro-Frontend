"use client";

import ProfileForm from "@/features/auth/components/ProfileForm";
import { useSession } from "@/features/auth/hooks/useSession";
import { PageHeader } from "@/components/ui";

/**
 * Vista de perfil del usuario autenticado.
 */
export default function ProfileView() {
  const { user } = useSession();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        description="Gestiona tus datos personales y la información visible para tu equipo."
      />

      <ProfileForm user={user} />
    </div>
  );
}
