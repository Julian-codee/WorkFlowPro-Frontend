import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Botón base del design system de WorkFlowPro.
 *
 * Variantes: primary | secondary | outline | ghost | danger
 * Tamaños:   sm | md | lg | icon
 *
 * Si receives `href` se renderiza como `next/link` (misma API visual).
 */

const VARIANTS = {
  primary:
    "bg-[#0F1A33] text-white shadow-[0_14px_30px_-16px_rgba(15,26,51,0.95)] hover:bg-[#17233F]",
  brand:
    "bg-[#2E6BFF] text-white shadow-[0_14px_30px_-14px_rgba(46,107,255,0.9)] hover:bg-[#2559E0]",
  secondary: "bg-[#EDF1F7] text-[#334155] hover:bg-[#E3E9F2]",
  outline:
    "border border-[#E2E8F0] bg-white text-[#1E293B] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#CBD5E1] hover:bg-[#FAFBFD]",
  ghost: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B]",
  danger:
    "bg-[#D92D20] text-white shadow-[0_14px_30px_-16px_rgba(217,45,32,0.9)] hover:bg-[#B42318]",
  dangerGhost: "border border-[#F4C7CA] bg-white text-[#B42318] hover:bg-[#FEF4F4]",
};

const SIZES = {
  sm: "h-9 px-3 text-[12.5px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[13.5px] gap-2 rounded-xl",
  lg: "h-12 px-5 text-[14px] gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF] disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    loading && "cursor-progress",
    className,
  );

  const content = (
    <>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || undefined} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
