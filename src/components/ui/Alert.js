import { CircleAlert, CircleCheckBig, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Alerta / banner del design system.
 * Variantes: info | success | warning | error
 */
const VARIANTS = {
  info: {
    wrapper: "border-[#CDDFFC] bg-[#F3F7FF] text-[#1D4ED8]",
    icon: Info,
  },
  success: {
    wrapper: "border-[#CDEBD8] bg-[#F0FBF4] text-[#0A6B3D]",
    icon: CircleCheckBig,
  },
  warning: {
    wrapper: "border-[#F7E3BF] bg-[#FEF8EC] text-[#96590A]",
    icon: TriangleAlert,
  },
  error: {
    wrapper: "border-[#F4C7CA] bg-[#FEF4F4] text-[#B42318]",
    icon: CircleAlert,
  },
};

export default function Alert({ variant = "info", title, children, icon, action, className = "" }) {
  const config = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = icon ?? config.icon;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-[12.5px] leading-5",
        config.wrapper,
        className,
      )}
    >
      <Icon className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
