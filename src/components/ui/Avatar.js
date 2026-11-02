import { cn } from "@/lib/utils/cn";

/**
 * Avatar con iniciales o imagen.
 */
export default function Avatar({ src = null, name = "", size = "md", className = "" }) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-[11.5px]",
    lg: "h-12 w-12 text-[14px]",
    xl: "h-16 w-16 text-[18px]",
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const base = cn(
    "grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#2E6BFF] to-[#5B93FF] font-bold text-white",
    sizes[size] ?? sizes.md,
    className,
  );

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn(base, "object-cover")} />;
  }

  return (
    <span className={base} title={name || undefined}>
      {initials || "?"}
    </span>
  );
}
