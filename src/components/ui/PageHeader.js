import { cn } from "@/lib/utils/cn";

/**
 * Cabecera de página: título, descripción y acciones.
 */
export default function PageHeader({ title, description, actions, eyebrow, className = "" }) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2E6BFF]">{eyebrow}</p>
        ) : null}

        <h1 className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.02em] text-[#0B1220] sm:text-[26px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-6 text-[#64748B]">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
