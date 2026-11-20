import { Badge } from "@/components/ui";

import { getQuotationStatusMeta, getQuotationTypeMeta } from "../constants";

/**
 * Etiquetas de estado y tipo de una cotización.
 */
export function QuotationStatusBadge({ status, className = "" }) {
  const meta = getQuotationStatusMeta(status);

  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function QuotationTypeBadge({ type, className = "" }) {
  const meta = getQuotationTypeMeta(type);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.shortLabel}
    </Badge>
  );
}
