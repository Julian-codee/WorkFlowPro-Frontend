import { cn } from "@/lib/utils/cn";

/**
 * Estado vacío (sin datos) con icono, título, descripción y acción.
 */
export default function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCE3ED] bg-white px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EFF4FF] text-[#2E6BFF]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}

      <h3 className="mt-4 text-[15px] font-semibold text-[#0B1220]">{title}</h3>

      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-[#64748B]">{description}</p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
