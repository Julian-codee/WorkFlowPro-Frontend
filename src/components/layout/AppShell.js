"use client";

import { useEffect, useState } from "react";

import { ToastProvider } from "@/components/ui";
import { fetchCurrentUser, restoreSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/tokenStore";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Shell de la zona autenticada.
 *
 * Al cargar, intenta recuperar la sesión:
 *  1. Si hay refresh token persistido → POST /auth/refresh + GET /auth/me.
 *  2. Si no hay sesión → deja la zona en modo invitado (la protección de
 *     rutas se puede activar más adelante con `middleware.js`).
 */
export default function AppShell({ children, title }) {
  const [user, setUser] = useState(getCurrentUser());
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const restored = await restoreSession();

        if (!active) return;

        if (restored) {
          setUser(restored);
          return;
        }

        // Sesión en memoria (sin persistencia): recuperamos el usuario.
        const current = await fetchCurrentUser();
        if (active) setUser(current);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsRestoring(false);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F7F9FC]">
        <Sidebar user={user} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {isRestoring ? null : children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
