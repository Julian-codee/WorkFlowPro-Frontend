"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearSession,
  getCurrentUser,
  subscribeToSession,
} from "@/lib/auth/tokenStore";
import { logout as logoutRequest } from "@/lib/auth/session";

/**
 * Estado de sesión del cliente.
 *
 * - `user`   → usuario autenticado (GET /auth/me).
 * - `status` → idle | loading | authenticated | anonymous.
 * - `logout` → cierra sesión (POST /auth/logout) y vuelve al login.
 */
export function useSession() {
  const router = useRouter();

  const [user, setUser] = useState(getCurrentUser());
  const [status, setStatus] = useState(getCurrentUser() ? "authenticated" : "idle");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    return subscribeToSession((session) => {
      setUser(session.user);
      setStatus(session.accessToken ? "authenticated" : "anonymous");
    });
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logoutRequest();
    } finally {
      clearSession();
      setIsLoggingOut(false);
      router.push("/login");
    }
  }, [router]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoggingOut,
    logout,
  };
}
