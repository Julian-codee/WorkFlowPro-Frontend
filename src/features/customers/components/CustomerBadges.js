import { Badge } from "@/components/ui";

import { getStatusMeta, getTypeMeta } from "../constants";

/**
 * Etiquetas de tipo y estado de un cliente.
 */
export function CustomerTypeBadge({ type, className = "" }) {
  const meta = getTypeMeta(type);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.shortLabel}
    </Badge>
  );
}

export function CustomerStatusBadge({ status, className = "" }) {
  const meta = getStatusMeta(status);

  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}
