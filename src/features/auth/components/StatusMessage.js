import { CircleAlert, CircleCheckBig, Info } from "lucide-react";

/**
 * Mensaje de estado del formulario (error, éxito o información).
 * Componente puramente visual: no conoce reglas de autenticación.
 */

const VARIANTS = {
  error: {
    wrapper: "border-[#F4C7CA] bg-[#FEF4F4] text-[#B42318]",
    icon: CircleAlert,
    iconClass: "text-[#D92D20]",
  },
  success: {
    wrapper: "border-[#BDE5CC] bg-[#F0FBF4] text-[#0A6B3D]",
    icon: CircleCheckBig,
    iconClass: "text-[#12A150]",
  },
  info: {
    wrapper: "border-[#CDDFFC] bg-[#F3F7FF] text-[#1D4ED8]",
    icon: Info,
    iconClass: "text-[#2E6BFF]",
  },
};

export default function StatusMessage({ variant = "info", children, className = "" }) {
  const config = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = config.icon;

  if (!children) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-[clamp(8px,1.1vh,12px)] text-[12.5px] leading-5 ${config.wrapper} ${className}`}
    >
      <Icon className={`mt-px h-4 w-4 shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
