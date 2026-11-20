import { Badge } from "@/components/ui";

import { getPaymentStatusMeta, getPriorityMeta, getStatusMeta } from "../constants";

/** Etiquetas de estado operativo, prioridad y estado financiero de una tarea. */
export function TaskStatusBadge({ status, className = "" }) {
  const meta = getStatusMeta(status);

  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority, className = "" }) {
  const meta = getPriorityMeta(priority);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}

export function TaskPaymentBadge({ status, totalPrice = null, className = "" }) {
  const meta = getPaymentStatusMeta(status, totalPrice);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
