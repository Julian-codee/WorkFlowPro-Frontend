"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, Settings2, Sparkles, Users, DollarSign, FileSpreadsheet } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tareas", icon: ListTodo },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/", label: "Finanzas", icon: DollarSign},
  { href: "/", label: "Cotizaciones", icon: FileSpreadsheet},
  { href: "/settings/profile", label: "Mi perfil", icon: Settings2 },
];

function isActive(pathname, href) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Barra lateral de la zona autenticada.
 * Mantiene el panel oscuro del login como hilo visual del producto.
 */
export default function Sidebar({ user = null }) {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-[264px] shrink-0 flex-col overflow-hidden bg-[#0B1220] text-white lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-[320px] w-[320px] rounded-full bg-[#1D4ED8]/25 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-16 h-[280px] w-[280px] rounded-full bg-[#2563EB]/15 blur-[100px]"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2E6BFF] shadow-[0_10px_24px_-8px_rgba(46,107,255,0.9)]">
            <ListTodo className="h-[19px] w-[19px] text-white" aria-hidden="true" />
          </span>
          <span className="text-[18px] font-bold tracking-[-0.01em]">
            WorkFlow<span className="text-[#5B93FF]">Pro</span>
          </span>
        </div>

        <nav className="mt-2 flex-1 px-3" aria-label="Navegación principal">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6D82A8]">
            Espacio de trabajo
          </p>

          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition",
                      active
                        ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                        : "text-[#9FB0CD] hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    <Icon
                      className={cn("h-[17px] w-[17px]", active ? "text-[#5B93FF]" : "text-[#6D82A8]")}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6D82A8]">
              <Sparkles className="h-3.5 w-3.5 text-[#5B93FF]" aria-hidden="true" />
              Plan Premium
            </span>
            <p className="mt-2 text-[12.5px] leading-5 text-[#9FB0CD]">
              Desbloquea automatizaciones, informes y permisos avanzados.
            </p>
            <span className="mt-3 inline-flex items-center rounded-lg bg-[#2E6BFF] px-3 py-1.5 text-[12px] font-semibold text-white">
              Conocer planes
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-white/[0.07] px-1 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2E6BFF] to-[#5B93FF] text-[11.5px] font-bold text-white">
              {(user?.full_name ?? user?.username ?? "Usuario").slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                {user?.full_name ?? user?.username ?? "Usuario"}
              </p>
              <p className="truncate text-[11.5px] text-[#7C90B5]">{user?.email ?? "sin sesión"}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
