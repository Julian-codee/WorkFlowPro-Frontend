"use client";

import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";

import RegisterForm from "./RegisterForm";

/**
 * Panel derecho de la pantalla de registro.
 * Mantiene la misma composición visual que la pantalla de inicio de sesión.
 */
export default function RegisterPanel() {
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
            Crea tu espacio de trabajo
          </p>

          <h2 className="mt-[clamp(8px,1.2vh,12px)] text-[clamp(22px,3.3vh,34px)] font-bold leading-[1.15] tracking-[-0.025em] text-[#0B1220]">
            Empieza a organizar tu trabajo hoy.
          </h2>

          <p className="mt-[clamp(6px,1vh,12px)] text-[clamp(12.5px,1.4vh,14px)] leading-[1.5] text-[#64748B]">
            Registra tu cuenta e invita a tu equipo cuando quieras.
          </p>

          <RegisterForm />

          <p className="mt-[clamp(8px,1.4vh,20px)] text-center text-[12.5px] text-[#94A3B8]">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-[#2E6BFF] transition hover:text-[#1D4FD8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF]"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
              Volver al inicio de sesión
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
