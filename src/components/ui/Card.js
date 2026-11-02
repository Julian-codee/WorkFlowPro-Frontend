import { cn } from "@/lib/utils/cn";

/**
 * Contenedor de contenido (tarjeta) del design system.
 */
export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-[#E6EBF3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, className = "" }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="min-w-0">
        {title ? <h3 className="text-[15px] font-semibold text-[#0B1220]">{title}</h3> : null}
        {description ? (
          <p className="mt-1 text-[12.5px] leading-5 text-[#64748B]">{description}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={cn("px-5 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF1F6] px-5 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
