import { cn } from "@/lib/utils/cn";

/**
 * Bloque de esqueleto para estados de carga.
 */
export default function Skeleton({ className = "", rounded = "rounded-lg" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse bg-[#EDF1F7]", rounded, className)}
    />
  );
}
