"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ListChecks } from "lucide-react";

import LoginForm from "./LoginForm";

/**
 * Panel derecho de la pantalla de autenticación.
 *
 * Contiene la cabecera, el selector "Iniciar sesión / Crear cuenta" y el pie.
 * La pestaña de registro se muestra como una vista preparada (simulada): el
 * registro todavía no está implementado.
 */

const TABS = [
  { id: "login", label: "Iniciar sesión" },
  { id: "register", label: "Crear cuenta" },
];

export default function LoginPanel() {
  const router = useRouter();

  return (
    <section className="flex h-[100dvh] flex-col overflow-hidden bg-[#F7F9FC] px-6 py-[clamp(12px,2.2vh,28px)] sm:px-10 lg:px-12 xl:px-20">
      {/* Marca visible en móvil */}
      <div className="mb-[clamp(16px,3vh,40px)] flex items-center gap-2.5 lg:hidden">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2E6BFF] shadow-[0_10px_24px_-8px_rgba(46,107,255,0.9)]">
          <ListChecks className="h-[19px] w-[19px] text-white" aria-hidden="true" />
        </span>
        <span className="text-[18px] font-bold tracking-[-0.01em] text-[#0B1220]">
          WorkFlow<span className="text-[#2E6BFF]">Pro</span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-y-auto">
        <div className="m-auto w-full max-w-[430px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2E6BFF]">
            Bienvenido a WorkFlowPro
          </p>

          <h2 className="mt-[clamp(8px,1.2vh,12px)] text-[clamp(22px,3.3vh,34px)] font-bold leading-[1.15] tracking-[-0.025em] text-[#0B1220]">
            Vuelve a poner las ideas en marcha.
          </h2>

          <p className="mt-[clamp(6px,1vh,12px)] text-[clamp(12.5px,1.4vh,14px)] leading-[1.5] text-[#64748B]">
            Accede a tu cuenta para continuar donde lo dejaste.
          </p>

          <div
            role="tablist"
            aria-label="Acceso a WorkFlowPro"
            className="mt-[clamp(14px,2.2vh,24px)] grid grid-cols-2 gap-1 rounded-xl bg-[#EDF1F7] p-1"
          >
            {TABS.map((tab) => {
              const isActive = tab.id === "login";

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  onClick={() => {
                    if (tab.id === "register") router.push("/register");
                  }}
                  className={`h-[clamp(36px,4.4vh,40px)] rounded-lg text-[13.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF] ${
                    isActive
                      ? "bg-white text-[#0F1A33] shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
                      : "text-[#64748B] hover:text-[#334155]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id="panel-login" aria-labelledby="tab-login" className="mt-[clamp(4px,0.8vh,10px)]">
            <LoginForm />
          </div>

          <p className="mt-[clamp(8px,1.4vh,20px)] text-center text-[13px] text-[#64748B]">
            ¿Aún no tienes una cuenta?{" "}
            <Link
              href="/register"
              className="inline-flex items-center gap-1 font-semibold text-[#2E6BFF] transition hover:text-[#1D4FD8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF]"
            >
              Créala gratis
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>

      <footer className="mt-[clamp(8px,1.8vh,32px)] text-center text-[11.5px] text-[#94A3B8]">
        © 2026 WorkFlowPro · Seguridad y privacidad primero
      </footer>
    </section>
  );
}
