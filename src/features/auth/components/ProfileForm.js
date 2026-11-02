"use client";

import { useState } from "react";
import { Camera, Check, LoaderCircle } from "lucide-react";

import { Alert, Avatar, Button, Card, CardBody, CardFooter, CardHeader, Input } from "@/components/ui";

import { useProfileForm } from "../hooks/useProfileForm";

/**
 * Formulario de perfil del usuario autenticado.
 *
 * Conecta con `GET /auth/me` (datos) y `PATCH /auth/me` (guardado).
 */
export default function ProfileForm({ user = null }) {
  const { values, formError, notice, isLoading, handleChange, submitProfile } = useProfileForm(user);
  const [preview, setPreview] = useState(user?.avatar_url ?? "");

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Vista previa local con object URL (no se sube ningún archivo todavía).
    setPreview(URL.createObjectURL(file));
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submitProfile();
      }}
    >
      <Card>
        <CardHeader
          title="Datos personales"
          description="Esta información se muestra a tu equipo dentro del espacio de trabajo."
        />

        <CardBody className="space-y-5">
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          {notice ? <Alert variant="success">{notice}</Alert> : null}

          <div className="flex flex-wrap items-center gap-4">
            <Avatar src={preview || null} name={values.full_name || values.username} size="xl" />

            <div>
              <label
                htmlFor="avatar"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#334155] transition hover:border-[#CBD5E1] hover:bg-[#FAFBFD]"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Cambiar avatar
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="mt-1.5 text-[11.5px] text-[#94A3B8]">
                PNG o JPG. La subida real se conectará al endpoint de perfil.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="full_name"
              name="full_name"
              label="Nombre completo"
              value={values.full_name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Nombre y apellidos"
            />

            <Input
              id="username"
              name="username"
              label="Nombre de usuario"
              value={values.username}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="nombre.apellido"
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Correo electrónico"
            value={values.email}
            disabled
            hint="El correo identifica tu cuenta y no se puede cambiar aquí."
          />
        </CardBody>

        <CardFooter>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Guardar cambios
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
