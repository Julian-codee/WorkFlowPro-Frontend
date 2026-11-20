import { Badge } from "@/components/ui";

import {
  getAccountTypeMeta,
  getAdjustmentTypeMeta,
  getClosureStatusMeta,
  getMovementTypeMeta,
  getPeriodStatusMeta,
} from "../constants";

/** Etiqueta del tipo de movimiento (ingreso / egreso). */
export function MovementTypeBadge({ type, className = "" }) {
  const meta = getMovementTypeMeta(type);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.shortLabel}
    </Badge>
  );
}

/** Etiqueta del tipo de cuenta financiera. */
export function AccountTypeBadge({ type, className = "" }) {
  const meta = getAccountTypeMeta(type);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.shortLabel}
    </Badge>
  );
}

/** Etiqueta del estado de un período semanal. */
export function PeriodStatusBadge({ status, className = "" }) {
  const meta = getPeriodStatusMeta(status);

  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

/** Etiqueta del estado de un cierre de caja. */
export function ClosureStatusBadge({ status, className = "" }) {
  const meta = getClosureStatusMeta(status);

  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

/** Etiqueta del tipo de diferencia de caja (faltante / sobrante). */
export function AdjustmentTypeBadge({ type, className = "" }) {
  const meta = getAdjustmentTypeMeta(type);

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
