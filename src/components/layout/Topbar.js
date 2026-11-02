"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings2, X } from "lucide-react";

import { Avatar, Button } from "@/components/ui";
import { useSession } from "@/features/auth/hooks/useSession";
import { cn } from "@/lib/utils/cn";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tareas" },
  { href: "/settings/profile", label: "Mi perfil" },
];

const SECTION_TITLES = {
  "/dashboard": "Dashboard",
  "/tasks": "Tareas",
  "/tasks/new": "Nueva tarea",
  "/settings/profile": "Mi perfil",
};

/**
 * Barra superior de la zona autenticada.
 */
export default function Topbar() {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useSession();

  const title = SECTION_TITLES[pathname] ?? (pathname.startsWith("/tasks/") ? "Detalle de tarea" : "WorkFlowPro");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E6EBF3] bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen((current) => !current)}
          aria-label="Abrir navegación"
          aria-expanded={isMobileNavOpen}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#475569] transition hover:bg-[#F1F5F9] lg:hidden"
        >
          {isMobileNavOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#0B1220]">{title}</p>
          <p className="hidden truncate text-[11.5px] text-[#94A3B8] sm:block">
            Workspace · Plan Premium
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[12.5px] text-[#94A3B8] xl:flex">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Buscar…</span>
            <kbd className="ml-6 rounded border border-[#E2E8F0] bg-[#F7F9FC] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#94A3B8]">
              ⌘K
            </kbd>
          </div>

          <button
            type="button"
            aria-label="Notificaciones"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-[#475569] transition hover:bg-[#F1F5F9]"
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#2E6BFF]" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1 transition hover:border-[#E2E8F0] hover:bg-[#FAFBFD]"
            >
              <Avatar name={user?.full_name ?? user?.username ?? "Usuario"} size="sm" />
              <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-[#334155] sm:block">
                {user?.full_name ?? user?.username ?? "Invitado"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
            </button>

            {isMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-xl border border-[#E6EBF3] bg-white shadow-[0_20px_50px_-24px_rgba(11,18,32,0.4)]"
              >
                <div className="border-b border-[#F1F4F9] px-4 py-3">
                  <p className="truncate text-[13px] font-semibold text-[#0B1220]">
                    {user?.full_name ?? "Invitado"}
                  </p>
                  <p className="truncate text-[11.5px] text-[#94A3B8]">{user?.email ?? "—"}</p>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/settings/profile"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#334155] transition hover:bg-[#F7F9FC]"
                  >
                    <Settings2 className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                    Mi perfil
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#B42318] transition hover:bg-[#FEF4F4] disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isMobileNavOpen ? (
        <nav className="border-t border-[#EEF1F6] bg-white px-4 py-3 lg:hidden" aria-label="Navegación">
          <ul className="space-y-1">
            {MOBILE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-[13.5px] font-medium transition",
                    pathname === item.href
                      ? "bg-[#EFF4FF] text-[#2559E0]"
                      : "text-[#475569] hover:bg-[#F7F9FC]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
