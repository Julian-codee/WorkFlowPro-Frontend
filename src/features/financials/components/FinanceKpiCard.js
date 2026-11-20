import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/**
 * Tarjeta de indicador financiero (KPI).
 *
 * Reutilizada por el dashboard, el resumen semanal y el historial de cierres.
 */
export default function FinanceKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "bg-[#EFF4FF] text-[#2E6BFF]",
  trend = null,
  isLoading = false,
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E6EBF3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-[#64748B]">{label}</p>

          {isLoading ? (
            <Skeleton className="mt-2.5 h-7 w-24" />
          ) : (
            <p className="mt-1 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#0B1220]">
              {value}
            </p>
          )}

          {hint && !isLoading ? (
            <p className="mt-2 text-[11.5px] leading-4 text-[#94A3B8]">{hint}</p>
          ) : null}
        </div>

        {Icon ? (
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tone)}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {trend ? (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
            trend.tone,
          )}
        >
          {trend.label}
        </p>
      ) : null}
    </div>
  );
}
