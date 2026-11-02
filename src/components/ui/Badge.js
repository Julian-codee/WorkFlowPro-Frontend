import { cn } from "@/lib/utils/cn";

/**
 * Badge / etiqueta de estado.
 * Tonos: neutral | brand | success | warning | danger | info | purple
 */
const TONES = {
  neutral: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
  brand: "border-[#D6E2FB] bg-[#EFF4FF] text-[#2559E0]",
  success: "border-[#CDEBD8] bg-[#F0FBF4] text-[#0A6B3D]",
  warning: "border-[#F7E3BF] bg-[#FEF8EC] text-[#96590A]",
  danger: "border-[#F4C7CA] bg-[#FEF4F4] text-[#B42318]",
  info: "border-[#CDDFFC] bg-[#F3F7FF] text-[#1D4ED8]",
  purple: "border-[#E4DBFB] bg-[#F7F4FF] text-[#6941C6]",
};

export default function Badge({ children, tone = "neutral", dot = false, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold leading-none",
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
